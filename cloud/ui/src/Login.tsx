"use client";
// Caminho relativo ao projeto: src/Login.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadConfig,
  isOriginAllowed,
  saveAuthInfo,
  authenticateWithGoogle,
  BYPASS_DEFAULT_USER,
} from "./LoginHelper";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const BYPASS_BUTTON_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  width: "280px",
  height: "40px",
  borderRadius: "4px",
  border: "1px solid #dadce0",
  backgroundColor: "#fff",
  color: "#3c4043",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer" as const,
};

export default function Login() {
  const btnRef = useRef<HTMLDivElement | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [allowed, setAllowed] = useState<string[]>([]);
  const [originOk, setOriginOk] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState<boolean>(false);

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      if (isLoading) return; // Prevent double-click

      try {
        setIsLoading(true);
        setErrorMsg("");
        console.log("Google response received:", response);

        if (!response.credential) {
          throw new Error("Credencial do Google não recebida.");
        }

        // Authenticate with our API
        const authResult = await authenticateWithGoogle(
          response.credential,
          clientId,
        );

        if (authResult.success && authResult.user && authResult.access_token) {
          // Save authentication info
          saveAuthInfo(authResult.access_token, {
            email: authResult.user.email,
            name: authResult.user.name,
            picture: authResult.user.picture,
          });

          // Redirect to upload page
          window.location.href = "/upload";
        } else {
          throw new Error("Falha na autenticação com o servidor.");
        }
      } catch (e: unknown) {
        console.error("Google authentication error:", e);
        setErrorMsg(
          e instanceof Error ? e.message : "Erro ao processar login do Google.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [clientId, isLoading],
  );

  const handleBypassLogin = useCallback(() => {
    if (isLoading) return; // Prevent double-click

    try {
      setIsLoading(true);
      setErrorMsg("");
      saveAuthInfo(BYPASS_DEFAULT_USER.token, {
        email: BYPASS_DEFAULT_USER.email,
        name: BYPASS_DEFAULT_USER.name,
        picture: BYPASS_DEFAULT_USER.picture,
      });
      window.location.href = "/upload";
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : "Erro ao processar login temporário.",
      );
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const config = await loadConfig();
        if (!active) return;
        setClientId(config.googleClientId || "");
        setAllowed(
          Array.isArray(config.allowedOrigins) ? config.allowedOrigins : [],
        );
      } catch {
        setClientId("");
        setAllowed([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!allowed?.length) return;
    const ok = isOriginAllowed(window.location.origin, allowed);
    setOriginOk(ok);
  }, [allowed]);

  useEffect(() => {
    if (!clientId) return;
    const id = "gsi-client";
    if (document.getElementById(id)) {
      setGoogleScriptLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.id = id;
    s.onload = () => {
      setErrorMsg(""); // Clear any previous errors when script loads successfully
      setGoogleScriptLoaded(true);
    };
    s.onerror = () => {
      setErrorMsg("Falha ao carregar o script do Google.");
      setGoogleScriptLoaded(false);
    };
    document.head.appendChild(s);
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !googleScriptLoaded || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        ux_mode: "popup",
        auto_select: false,
        itp_support: true,
      });

      if (btnRef.current) {
        // Clear existing content before rendering
        btnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 280,
          text: "signin_with",
          shape: "rectangular",
        });
      }
      setErrorMsg(""); // Clear errors if initialization succeeds
    } catch (error) {
      console.error("Google initialization error:", error);
      setErrorMsg("Erro na inicialização do Google SSO.");
    }
  }, [clientId, googleScriptLoaded, handleGoogleResponse]);

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        padding: 24,
      }}
    >
      <section style={{ width: 360, maxWidth: "90vw" }}>
        <h1 style={{ marginBottom: 8 }}>Acesso ao Sistema de Análise de IA</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Faça login com sua conta Google para continuar.
        </p>
        {!originOk && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffeeba",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            Origem não autorizada: <b>{window.location.origin}</b>. Ajuste as
            origens permitidas no servidor.
          </div>
        )}
        {errorMsg && (
          <div
            style={{
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {errorMsg}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          {/* Loading state */}
          {isLoading && (
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                style={{ marginRight: "8px" }}
              >
                <span className="visually-hidden">Carregando...</span>
              </div>
              <span style={{ color: "#666" }}>Processando autenticação...</span>
            </div>
          )}

          {/* Google Sign-In Button (rendered by Google SDK) */}
          {!isLoading && clientId && originOk && (
            <div ref={btnRef} style={{ marginBottom: "12px" }} />
          )}

          {/* Demo/Bypass Button */}
          <button
            type="button"
            onClick={handleBypassLogin}
            disabled={isLoading || !originOk}
            style={{
              ...BYPASS_BUTTON_STYLE,
              backgroundColor: isLoading || !originOk ? "#f5f5f5" : "#f8f9fa",
              border: "1px solid #dadce0",
              marginTop: "8px",
              opacity: isLoading || !originOk ? 0.6 : 1,
              cursor: isLoading || !originOk ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <>
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{ marginRight: "8px" }}
                >
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <span>Processando...</span>
              </>
            ) : (
              <>
                <i
                  className="fab fa-google"
                  style={{ fontSize: "18px", opacity: 0.6 }}
                ></i>
                <span>Continuar com conta demo</span>
              </>
            )}
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
          <div>
            <b>client_id:</b> {clientId || "(não configurado)"}
          </div>
          <div>
            <b>origem atual:</b>{" "}
            {typeof window !== "undefined" ? window.location.origin : "-"}
          </div>
        </div>
      </section>
    </main>
  );
}
