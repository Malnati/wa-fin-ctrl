// ui/src/components/onboarding/OnboardingPermissions.tsx

// Browser permissions step of onboarding flow

import { useState, useEffect } from "react";
import {
  markPermissionsGranted,
  loadOnboardingProgress,
} from "../../shared/lib/ConsentHelper";
import type { BrandingConfig } from "../../shared/lib/BrandingHelper";
import { AVATAR_PLACEHOLDER_URL } from "../../constants/constants";

interface OnboardingPermissionsProps {
  onNext: () => void;
  onBack: () => void;
  config?: BrandingConfig | null;
}

export function OnboardingPermissions({
  onNext,
  onBack,
  config,
}: OnboardingPermissionsProps) {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    // Check if permissions were already granted
    const progress = loadOnboardingProgress();
    if (progress?.permissionsGranted) {
      setPermissionsGranted(true);
    }
  }, []);

  const handleGrantPermissions = async () => {
    setIsGranting(true);

    try {
      // In a real Chrome extension, this would use chrome.permissions.request
      // For now, we'll simulate the permission grant
      console.log("Requesting browser permissions...");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real extension, you would check chrome.permissions.contains
      // For the web app, we'll just mark as granted
      markPermissionsGranted();
      setPermissionsGranted(true);

      // Update UI
      setTimeout(() => {
        setIsGranting(false);
      }, 100);
    } catch (error) {
      console.error("Error granting permissions:", error);
      setIsGranting(false);
    }
  };

  const handleContinue = () => {
    if (permissionsGranted) {
      onNext();
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <header className="d-flex align-items-center justify-content-between border-bottom px-4 py-3 bg-white">
        <div className="d-flex align-items-center gap-3">
          {config?.logo ? (
            <img
              src={config.logo}
              alt="Logo institucional"
              style={{ height: "40px", width: "auto" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : null}
          <h2 className="h5 mb-0 fw-semibold text-dark">
            {config?.companyName || "MBRA"} • Yagnostic
          </h2>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="small fw-medium text-muted">
            {config?.companyName || "InovaCorp"}
          </span>
          <div
            className="rounded-circle bg-secondary"
            style={{
              width: "32px",
              height: "32px",
              backgroundImage: `url('${AVATAR_PLACEHOLDER_URL}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: "28rem" }}>
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="card-body p-5">
              {/* Logo Section */}
              <div className="text-center mb-5">
                <div className="d-flex align-items-center justify-content-center gap-3">
                  {config?.logo ? (
                    <img
                      src={config.logo}
                      alt="Logo institucional"
                      style={{ height: "40px", width: "auto" }}
                    />
                  ) : null}
                  <span
                    className="small fw-bold text-uppercase text-primary"
                    style={{ letterSpacing: "0.3em" }}
                  >
                    {config?.companyName || "MBRA"}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mb-4">
                <p className="small fw-medium text-muted mb-2">Passo 3 de 4</p>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: "75%" }}
                    role="progressbar"
                    aria-valuenow={75}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              {/* Permissions Content */}
              <div className="text-start">
                <h1 className="h4 fw-bold text-dark mb-3">
                  Permissões do Navegador
                </h1>
                <p className="text-muted mb-4">
                  Para analisar seus relatórios, a extensão{" "}
                  {config?.title || "Yagnostic"} precisa de permissão para
                  interceptar downloads. Veja como funciona:
                </p>

                {/* Feature List */}
                <div className="mb-4">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="text-primary flex-shrink-0 mt-1">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="small text-muted mb-0">
                      A extensão detecta quando você baixa um PDF de um domínio
                      suportado.
                    </p>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="text-primary flex-shrink-0 mt-1">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="small text-muted mb-0">
                      Ela cancela o download local e busca o arquivo com
                      segurança usando uma conexão autorizada.
                    </p>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="text-primary flex-shrink-0 mt-1">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="small text-muted mb-0">
                      O arquivo é enviado para nosso servidor seguro para
                      análise.
                    </p>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="text-primary flex-shrink-0 mt-1">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="small text-muted mb-0">
                      Um token de processamento é salvo localmente no IndexedDB
                      do seu navegador para rastrear o status do relatório.
                    </p>
                  </div>
                </div>

                {/* Warning Banner - Only show if permissions not granted */}
                {!permissionsGranted && (
                  <div
                    className="alert alert-warning border-0 d-flex align-items-start gap-3 mb-4"
                    role="alert"
                  >
                    <div className="text-warning flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="small fw-medium text-warning mb-0">
                        Permissões necessárias para prosseguir. Por favor,
                        clique no botão abaixo para conceder acesso.
                      </p>
                    </div>
                  </div>
                )}

                {/* Grant Permissions Button */}
                {!permissionsGranted && (
                  <div className="mb-4">
                    <button
                      className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-3"
                      onClick={handleGrantPermissions}
                      disabled={isGranting}
                      style={{ borderRadius: "0.5rem" }}
                    >
                      {isGranting ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Carregando...
                            </span>
                          </div>
                          <span>Solicitando...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Conceder Permissões</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Success State */}
                {permissionsGranted && (
                  <div
                    className="alert alert-success border-0 d-flex align-items-start gap-3 mb-4"
                    role="alert"
                  >
                    <div className="text-success flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="small fw-medium text-success mb-0">
                        Permissões concedidas com sucesso! Você pode prosseguir.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-link text-muted small text-decoration-none p-0"
                  onClick={handleBack}
                  disabled={isGranting}
                >
                  Voltar
                </button>

                <button
                  className={`btn btn-lg px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 ${
                    permissionsGranted && !isGranting
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  style={{ borderRadius: "0.5rem" }}
                  onClick={handleContinue}
                  disabled={!permissionsGranted || isGranting}
                >
                  <span>Continuar</span>
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary py-4 text-white">
        <div className="container">
          <div className="row g-3 small text-white-50 align-items-center">
            <div className="col-sm-auto">
              <p className="fw-semibold mb-0">
                © 2024 {config?.companyName || "MBRA"}. Todos os direitos
                reservados.
              </p>
            </div>
            <div className="col-sm">
              <div className="small">
                <p className="mb-1">
                  {config?.contactEmail || "contato@mbra.com.br"} •{" "}
                  {config?.contactPhone || "+55 (61) 3037-6960"}
                </p>
                <p className="mb-0">
                  {config?.contactAddress ||
                    "SHN QD. 2 BL. F Ed. Executive Office Tower SL. 1114 - Asa Norte, Brasília-DF CEP 70702-906"}
                </p>
              </div>
            </div>
            <div className="col-sm-auto">
              <div
                className="d-flex gap-3 small text-uppercase"
                style={{ letterSpacing: "0.3em" }}
              >
                {config?.contactWebsite && (
                  <a
                    href={config.contactWebsite}
                    className="text-white-50 text-decoration-none hover-text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website
                  </a>
                )}
                {config?.linkLinkedin && (
                  <a
                    href={config.linkLinkedin}
                    className="text-white-50 text-decoration-none hover-text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
                {config?.linkGithub && (
                  <a
                    href={config.linkGithub}
                    className="text-white-50 text-decoration-none hover-text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
