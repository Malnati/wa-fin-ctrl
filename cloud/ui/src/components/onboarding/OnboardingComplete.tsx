// ui/src/components/onboarding/OnboardingComplete.tsx

// Final step of LGPD onboarding flow

import type { BrandingConfig } from "../../shared/lib/BrandingHelper";
import { AVATAR_PLACEHOLDER_URL } from "../../constants/constants";

interface OnboardingCompleteProps {
  onFinish: () => void;
  config?: BrandingConfig | null;
}

export function OnboardingComplete({
  onFinish,
  config,
}: OnboardingCompleteProps) {
  const handleFinish = () => {
    onFinish();
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

              {/* Progress Indicator - Complete */}
              <div className="mb-4">
                <p className="small fw-medium text-muted mb-2">Passo 4 de 4</p>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: "100%" }}
                    role="progressbar"
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              {/* Success Content */}
              <div className="text-center">
                {/* Success Icon */}
                <div className="mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <svg
                      width="40"
                      height="40"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <h1 className="h3 fw-bold text-dark mb-3">
                  Configuração Concluída!
                </h1>
                <p className="text-muted mb-5">
                  Seu consentimento foi registrado com sucesso e todas as
                  permissões necessárias foram concedidas. Agora você pode usar
                  o {config?.title || "Yagnostic"} para gerar insights a partir
                  dos seus documentos.
                </p>

                {/* Summary Items */}
                <div className="text-start mb-5">
                  <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded">
                    <div className="text-success flex-shrink-0">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">Consentimento LGPD</h6>
                      <p className="small text-muted mb-0">
                        Aceito em conformidade com a lei de proteção de dados
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded">
                    <div className="text-success flex-shrink-0">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">
                        Permissões do Navegador
                      </h6>
                      <p className="small text-muted mb-0">
                        Concedidas para análise de documentos
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded">
                    <div className="text-success flex-shrink-0">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">Conta Ativada</h6>
                      <p className="small text-muted mb-0">
                        Pronto para usar todas as funcionalidades
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="text-center">
                <button
                  className="btn btn-success btn-lg px-5 py-3 fw-bold d-inline-flex align-items-center gap-2"
                  onClick={handleFinish}
                  style={{ borderRadius: "0.5rem" }}
                >
                  <span>Começar a Usar</span>
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

              {/* Additional Information */}
              <div className="text-center mt-4">
                <p className="small text-muted">
                  Você pode alterar suas preferências de privacidade a qualquer
                  momento nas configurações da conta.
                </p>
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
