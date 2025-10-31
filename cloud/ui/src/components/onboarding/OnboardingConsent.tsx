// ui/src/components/onboarding/OnboardingConsent.tsx

// LGPD consent step of onboarding flow

import { useState, useEffect } from "react";
import {
  saveConsentWithSync,
  loadConsent,
} from "../../shared/lib/ConsentHelper";
import type { BrandingConfig } from "../../shared/lib/BrandingHelper";
import { AVATAR_PLACEHOLDER_URL } from "../../constants/constants";

interface OnboardingConsentProps {
  onNext: () => void;
  onBack: () => void;
  config?: BrandingConfig | null;
  userEmail?: string;
}

export function OnboardingConsent({
  onNext,
  onBack,
  config,
  userEmail,
}: OnboardingConsentProps) {
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Load existing consent if available
    const existingConsent = loadConsent();
    if (existingConsent) {
      setDataProcessingConsent(existingConsent.dataProcessing);
      setTermsConsent(existingConsent.termsAndPrivacy);
    }
  }, []);

  const canContinue = dataProcessingConsent && termsConsent;

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsLoading(true);
    setSyncError(null);

    try {
      // Save consent with immediate API synchronization
      const result = await saveConsentWithSync(
        {
          dataProcessing: dataProcessingConsent,
          termsAndPrivacy: termsConsent,
        },
        userEmail,
      );

      if (!result.syncSuccess && result.error) {
        setSyncError(`Erro de sincronização: ${result.error}`);
        // Still proceed locally - sync can be retried later
        console.warn(
          "API sync failed, proceeding with local storage:",
          result.error,
        );
      }

      // Proceed to next step - consent is saved locally
      onNext();
    } catch (error) {
      console.error("Error saving consent:", error);
      setSyncError("Erro interno ao salvar consentimento");
      // Still proceed for UX continuity
      onNext();
    } finally {
      setIsLoading(false);
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
                <p className="small fw-medium text-muted mb-2">Etapa 2 de 4</p>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: "50%" }}
                    role="progressbar"
                    aria-valuenow={50}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              {/* Consent Content */}
              <div className="text-start">
                <h1 className="h4 fw-bold text-dark mb-3">
                  Sua Privacidade é Importante
                </h1>
                <p className="text-muted mb-4">
                  Para fornecer insights personalizados, precisamos coletar e
                  processar alguns de seus dados de navegação. Estamos
                  comprometidos em proteger sua privacidade e cumprir a LGPD.
                </p>

                {/* Consent Checkboxes */}
                <div className="mb-4">
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="consent-data-processing"
                        checked={dataProcessingConsent}
                        onChange={(e) =>
                          setDataProcessingConsent(e.target.checked)
                        }
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="consent-data-processing"
                      >
                        Eu consinto com a coleta e processamento dos meus dados
                        de navegação para gerar insights baseados em IA.
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="consent-terms"
                        checked={termsConsent}
                        onChange={(e) => setTermsConsent(e.target.checked)}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="consent-terms"
                      >
                        Li e concordo com a{" "}
                        <a
                          href="#"
                          className="fw-medium text-primary text-decoration-none"
                        >
                          Política de Privacidade
                        </a>{" "}
                        e os{" "}
                        <a
                          href="#"
                          className="fw-medium text-primary text-decoration-none"
                        >
                          Termos de Serviço
                        </a>
                        .
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Error Display */}
              {syncError && (
                <div className="mt-3">
                  <div
                    className="alert alert-warning d-flex align-items-center"
                    role="alert"
                  >
                    <span className="me-2">⚠️</span>
                    <small>{syncError}</small>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-link text-muted small text-decoration-none p-0"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Voltar
                </button>

                <button
                  className={`btn btn-lg px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 ${
                    canContinue && !isLoading ? "btn-primary" : "btn-secondary"
                  }`}
                  style={{ borderRadius: "0.5rem" }}
                  onClick={handleContinue}
                  disabled={!canContinue || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                      >
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>Concordar e Continuar</span>
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
                    </>
                  )}
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
