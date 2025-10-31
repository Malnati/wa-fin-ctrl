// ui/src/components/approval/ApprovalStatus.tsx
import type { BrandingConfig } from "../../shared/lib/BrandingHelper";
import { APPROVAL_STATUS } from "../../constants/constants";

interface ApprovalStatusProps {
  config: BrandingConfig;
  status: keyof typeof APPROVAL_STATUS;
  onContactSupport?: () => void;
}

export function ApprovalStatus({
  config,
  status,
  onContactSupport,
}: ApprovalStatusProps) {
  if (status === "APPROVED") {
    return null; // User should continue to main app
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-300 px-6 py-4 bg-white">
        <div className="flex items-center gap-3 text-purple-700">
          {config.logo && (
            <img
              alt="Logotipo da MBRA"
              className="h-10 w-auto"
              src={config.logo}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          )}
          <h2 className="text-xl font-semibold text-gray-900">
            {config.companyName || "MBRA"} • Yagnostic
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <span className="text-sm font-medium text-gray-600">
            Aguardando Aprovação
          </span>
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">?</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white/90 p-8 text-center shadow-lg ring-1 ring-purple-700/10 backdrop-blur">
          <div className="mb-6 flex justify-center">
            {config.logo && (
              <img
                alt="Logotipo institucional"
                className="h-12 w-auto"
                src={config.logo}
              />
            )}
          </div>

          <div className="mb-6 space-y-2">
            {status === "PENDING" ? (
              <>
                <h1 className="text-2xl font-extrabold text-purple-700">
                  Estamos quase lá!
                </h1>
                <p className="text-sm text-gray-600">
                  Sua conta foi enviada para aprovação. Assim que o time de
                  administração liberar o acesso, você receberá um e-mail com
                  instruções para continuar.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-red-600">
                  Aprovação Negada
                </h1>
                <p className="text-sm text-gray-600">
                  Infelizmente sua solicitação de acesso não foi aprovada. Entre
                  em contato com o suporte para mais informações.
                </p>
              </>
            )}
          </div>

          {status === "PENDING" && (
            <div className="rounded-2xl border border-purple-700/10 bg-purple-700/5 p-5 text-left text-sm text-gray-600">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-700/80">
                Próximos passos
              </h2>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                    1
                  </span>
                  <p>
                    Fique de olho no e-mail cadastrado para confirmar a
                    liberação.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                    2
                  </span>
                  <p>
                    Assim que aprovado, você poderá concluir o onboarding e
                    configurar permissões.
                  </p>
                </li>
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p>
              Precisa adiantar a análise? Entre em contato com{" "}
              <button
                onClick={onContactSupport}
                className="font-medium text-purple-700 hover:text-purple-800"
              >
                {config.contactEmail}
              </button>
              .
            </p>
            {status === "PENDING" && (
              <p className="text-xs text-gray-400">
                Tempo médio de aprovação: até 1 dia útil.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-purple-700 py-6 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-semibold">
            {config.copyright || "© 2024 MBRA. Todos os direitos reservados."}
          </p>
          <div className="space-y-1">
            <p>
              {config.contactEmail} • {config.contactPhone}
            </p>
            {config.contactAddress && <p>{config.contactAddress}</p>}
          </div>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
            {config.contactWebsite && (
              <a
                href={config.contactWebsite}
                className="hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                Website
              </a>
            )}
            {config.linkLinkedin && (
              <a
                href={config.linkLinkedin}
                className="hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {config.linkGithub && (
              <a
                href={config.linkGithub}
                className="hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
