// ui/src/components/dashboard/DiagnosticQueue.tsx
import { useState, useEffect } from "react";
import type { BrandingConfig } from "../../shared/lib/BrandingHelper";

export interface DiagnosticItem {
  id: string;
  fileName: string;
  fileType: string;
  status: "processing" | "success" | "error" | "pending";
  uploadDate: string;
  hasAudio: boolean;
  hasPdf: boolean;
  errorMessage?: string;
  analysisText?: string;
  originalFileUrl?: string;
  analysisFileUrl?: string;
  audioFileUrl?: string;
}

interface DiagnosticQueueProps {
  config: BrandingConfig;
}

export function DiagnosticQueue({ config }: DiagnosticQueueProps) {
  const [items, setItems] = useState<DiagnosticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use config for future branding customizations
  const brandingCompany = config?.companyName || "Sistema";

  // Simulate diagnostic queue data (in real implementation, this would fetch from API)
  useEffect(() => {
    const fetchDiagnosticQueue = async () => {
      try {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate diagnostic queue data
        const mockItems: DiagnosticItem[] = [
          {
            id: "1",
            fileName: "Relatorio_Original.pdf",
            fileType: "PDF",
            status: "success",
            uploadDate: new Date().toISOString(),
            hasAudio: true,
            hasPdf: true,
            analysisText:
              "Análise completa realizada com sucesso. O relatório indica...",
            originalFileUrl: "#",
            analysisFileUrl: "#",
            audioFileUrl: "#",
          },
          {
            id: "2",
            fileName: "Exame_Laboratorio.pdf",
            fileType: "PDF",
            status: "error",
            uploadDate: new Date(Date.now() - 86400000).toISOString(),
            hasAudio: false,
            hasPdf: false,
            errorMessage: "Falha na geração de áudio. Tente novamente.",
          },
          {
            id: "3",
            fileName: "Diagnostico_Imagem.pdf",
            fileType: "PDF",
            status: "processing",
            uploadDate: new Date(Date.now() - 300000).toISOString(),
            hasAudio: false,
            hasPdf: false,
          },
        ];

        setItems(mockItems);
      } catch {
        setError("Erro ao carregar fila de diagnósticos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosticQueue();
  }, []);

  const handleRetry = async (itemId: string) => {
    // Simulate retry operation
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: "processing" as const, errorMessage: undefined }
          : item,
      ),
    );

    // Simulate processing time
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "success" as const,
                hasAudio: true,
                hasPdf: true,
              }
            : item,
        ),
      );
    }, 3000);
  };

  const handleShare = (item: DiagnosticItem) => {
    // Simulate share functionality
    if (navigator.share) {
      navigator.share({
        title: `Diagnóstico: ${item.fileName}`,
        text: "Compartilhar resultado do diagnóstico",
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const getStatusBadge = (status: DiagnosticItem["status"]) => {
    const baseClasses =
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

    switch (status) {
      case "success":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <span className="material-symbols-outlined !text-sm mr-1">
              check_circle
            </span>
            Sucesso
          </span>
        );
      case "error":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <span className="material-symbols-outlined !text-sm mr-1">
              error
            </span>
            Erro
          </span>
        );
      case "processing":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <span className="material-symbols-outlined !text-sm mr-1 animate-spin">
              progress_activity
            </span>
            Processando
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <span className="material-symbols-outlined !text-sm mr-1">
              schedule
            </span>
            Pendente
          </span>
        );
      default:
        return null;
    }
  };

  const getFileIcon = (status: DiagnosticItem["status"]) => {
    const iconClasses = "material-symbols-outlined !text-3xl";

    switch (status) {
      case "success":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
            <span className={iconClasses}>picture_as_pdf</span>
          </div>
        );
      case "error":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <span className={iconClasses}>error</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <span className={`${iconClasses} animate-pulse`}>
              hourglass_empty
            </span>
          </div>
        );
      case "pending":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
            <span className={iconClasses}>schedule</span>
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <span className={iconClasses}>description</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Fila de Diagnósticos
        </h2>
        <div className="rounded-xl border border-gray-300 bg-white p-6 text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-700">
            <span className="material-symbols-outlined !text-3xl">
              progress_activity
            </span>
          </div>
          <p className="text-gray-600">Carregando fila de diagnósticos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Fila de Diagnósticos
        </h2>
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center">
          <span className="material-symbols-outlined !text-3xl text-red-600 mb-2">
            error
          </span>
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Fila de Diagnósticos - {brandingCompany}
        </h2>
        <span className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-300 bg-white p-6 text-center">
          <span className="material-symbols-outlined !text-3xl text-gray-400 mb-2">
            inbox
          </span>
          <p className="text-gray-600">Nenhum diagnóstico na fila</p>
          <p className="text-sm text-gray-500">
            Faça upload de um arquivo para começar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                item.status === "error"
                  ? "border-red-300 bg-red-50/50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(item.status)}
                  <div>
                    <p className="font-semibold text-base text-gray-900">
                      {item.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <span>{item.fileType}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.uploadDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                    {item.errorMessage && (
                      <p className="text-sm text-red-600 mt-1">
                        {item.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 sm:mt-0">
                  {item.status === "success" && (
                    <>
                      <button
                        onClick={() => handleShare(item)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium bg-purple-700 text-white hover:bg-purple-800 transition-colors"
                      >
                        <span className="material-symbols-outlined !text-base">
                          share
                        </span>
                        <span>Compartilhar</span>
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined !text-base">
                          download
                        </span>
                        <span>Baixar</span>
                      </button>
                    </>
                  )}

                  {item.status === "error" && (
                    <button
                      onClick={() => handleRetry(item.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <span className="material-symbols-outlined !text-base">
                        refresh
                      </span>
                      <span>Tentar Novamente</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
