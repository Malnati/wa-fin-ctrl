// ui/src/Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { submitPdfToAPI, type DiagnosisStatus } from "./UploadHelper";
import {
  type DiagnosticItem,
  type DiagnosticMetrics,
  calculateMetrics,
  saveDiagnosticQueue,
  loadDiagnosticQueue,
  syncMetricsWithAPI,
  retryDiagnostic,
  shareDiagnostic,
  getProcessingStatus,
} from "./DashboardMetricsHelper";

export function Dashboard() {
  const [diagnosisQueue, setDiagnosisQueue] = useState<DiagnosticItem[]>([]);
  const [metrics, setMetrics] = useState<DiagnosticMetrics | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [voiceOption, setVoiceOption] = useState<
    "nenhum" | "masculino" | "feminino"
  >("nenhum");
  const [retryingItems, setRetryingItems] = useState<Set<string>>(new Set());
  const [sharingItems, setSharingItems] = useState<Set<string>>(new Set());

  // Load diagnosis queue and metrics from localStorage on mount
  useEffect(() => {
    const queue = loadDiagnosticQueue();
    setDiagnosisQueue(queue);

    // Calculate initial metrics
    const initialMetrics = calculateMetrics(queue);
    setMetrics(initialMetrics);
  }, []);

  // Save diagnosis queue and update metrics whenever it changes
  useEffect(() => {
    if (diagnosisQueue.length > 0 || metrics !== null) {
      saveDiagnosticQueue(diagnosisQueue);

      // Update metrics
      const newMetrics = calculateMetrics(diagnosisQueue);
      setMetrics(newMetrics);

      // Sync with API (fire and forget)
      syncMetricsWithAPI(newMetrics).catch(console.warn);
    }
  }, [diagnosisQueue, metrics]);

  // Real-time status polling for processing items
  useEffect(() => {
    const processingItems = diagnosisQueue.filter(
      (item) => item.status === "processing" || item.status === "uploading",
    );

    if (processingItems.length === 0) return;

    const pollInterval = setInterval(async () => {
      const updates: Array<{ id: string; updates: Partial<DiagnosticItem> }> =
        [];

      for (const item of processingItems) {
        const status = await getProcessingStatus(item.id);
        if (
          status &&
          (status.status !== item.status || status.progress !== item.progress)
        ) {
          updates.push({
            id: item.id,
            updates: {
              status: status.status,
              progress: status.progress,
              errorMessage: status.error,
              processingEndTime:
                status.status === "completed" ? Date.now() : undefined,
            },
          });
        }
      }

      if (updates.length > 0) {
        setDiagnosisQueue((prev) =>
          prev.map((item) => {
            const update = updates.find((u) => u.id === item.id);
            return update ? { ...item, ...update.updates } : item;
          }),
        );
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [diagnosisQueue]);

  const addDiagnosisItem = useCallback((item: DiagnosticItem) => {
    setDiagnosisQueue((prev) => [item, ...prev]);
  }, []);

  const updateDiagnosisItem = useCallback(
    (id: string, updates: Partial<DiagnosticItem>) => {
      setDiagnosisQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  const handleFileUpload = async (file: File) => {
    // Generate secure item ID using crypto API
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    const secureId = array[0].toString(36) + array[1].toString(36);
    const itemId = `${Date.now()}-${secureId}`;
    const generateAudio = voiceOption !== "nenhum";

    // Add initial item to queue
    const newItem: DiagnosticItem = {
      id: itemId,
      fileName: file.name,
      fileType: file.type.includes("pdf")
        ? "pdf"
        : file.type.includes("audio")
          ? "audio"
          : "text",
      status: "uploading",
      uploadDate: new Date(),
      progress: 0,
      processingStartTime: Date.now(),
    };

    addDiagnosisItem(newItem);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 20, 90);
          updateDiagnosisItem(itemId, { progress: newProgress });
          return newProgress;
        });
      }, 200);

      updateDiagnosisItem(itemId, { status: "processing" });

      const result = await submitPdfToAPI({
        file,
        generateAudio,
        voiceID: voiceOption === "feminino" ? "female" : "male",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      updateDiagnosisItem(itemId, { progress: 100 });

      if (result.ok && result.json) {
        updateDiagnosisItem(itemId, {
          status: "completed",
          fileUrl: result.json.fileUrl,
          audioUrl: result.json.audioUrl,
          pdfUrl: result.json.pdfUrl,
          processingEndTime: Date.now(),
        });
      } else {
        updateDiagnosisItem(itemId, {
          status: "error",
          errorMessage: `Erro ${result.status}: Falha no processamento`,
          processingEndTime: Date.now(),
        });
      }
    } catch (error) {
      updateDiagnosisItem(itemId, {
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRetry = async (item: DiagnosticItem) => {
    if (retryingItems.has(item.id)) return;

    setRetryingItems((prev) => new Set([...prev, item.id]));

    updateDiagnosisItem(item.id, {
      status: "processing",
      progress: 0,
      errorMessage: undefined,
      processingStartTime: Date.now(),
      processingEndTime: undefined,
    });

    try {
      // Try to retry with the API helper
      const result = await retryDiagnostic(item.id);

      if (result.success) {
        updateDiagnosisItem(item.id, {
          status: "completed",
          progress: 100,
          processingEndTime: Date.now(),
        });
      } else {
        updateDiagnosisItem(item.id, {
          status: "error",
          errorMessage: result.error || "Erro na nova tentativa",
          processingEndTime: Date.now(),
        });
      }
    } catch (error) {
      updateDiagnosisItem(item.id, {
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Erro na nova tentativa",
        processingEndTime: Date.now(),
      });
    } finally {
      setRetryingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleShare = async (item: DiagnosticItem) => {
    if (!shareEmail.trim()) {
      alert("Por favor, digite um email para compartilhar");
      return;
    }

    if (sharingItems.has(item.id)) return;

    setSharingItems((prev) => new Set([...prev, item.id]));

    try {
      const result = await shareDiagnostic(
        item.id,
        shareEmail.trim(),
        `Resultado do diagnóstico: ${item.fileName}`,
      );

      if (result.success) {
        alert(
          `Arquivo ${item.fileName} compartilhado com sucesso para ${shareEmail}`,
        );
        setShareEmail("");
      } else {
        alert(`Erro ao compartilhar: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Erro ao compartilhar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    } finally {
      setSharingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  // Helper functions for status display
  // const getStatusColor = (status: DiagnosisStatus) => {
  //   switch (status) {
  //     case 'completed': return 'text-success';
  //     case 'error': return 'text-danger';
  //     case 'processing':
  //     case 'uploading': return 'text-warning';
  //     default: return 'text-secondary';
  //   }
  // };

  const getStatusIcon = (status: DiagnosisStatus) => {
    switch (status) {
      case "completed":
        return "✅";
      case "error":
        return "❌";
      case "processing":
        return "⏳";
      case "uploading":
        return "📤";
      default:
        return "📄";
    }
  };

  const getStatusText = (status: DiagnosisStatus) => {
    switch (status) {
      case "completed":
        return "Sucesso";
      case "error":
        return "Erro";
      case "processing":
        return "Processando";
      case "uploading":
        return "Enviando";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">Visão Geral</h1>
              <p className="text-muted">
                Gerencie seus diagnósticos e acompanhe o progresso
              </p>
            </div>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => document.getElementById("fileInput")?.click()}
              disabled={isUploading}
            >
              <span>➕</span>
              <span>Novo Diagnóstico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="row mb-4">
          <div className="col">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Métricas em Tempo Real</h5>
                  <small className="text-muted">
                    Última atualização:{" "}
                    {new Date(metrics.lastUpdate).toLocaleTimeString()}
                  </small>
                </div>
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1 text-primary">
                        {metrics.totalDiagnostics}
                      </div>
                      <div className="small text-muted">
                        Total de Diagnósticos
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1 text-success">
                        {metrics.successfulDiagnostics}
                      </div>
                      <div className="small text-muted">Bem-sucedidos</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1 text-warning">
                        {metrics.processingDiagnostics}
                      </div>
                      <div className="small text-muted">Em Processamento</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1 text-info">
                        {metrics.successRate}%
                      </div>
                      <div className="small text-muted">Taxa de Sucesso</div>
                    </div>
                  </div>
                </div>
                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <div className="text-center p-2">
                      <div className="h6 mb-1">
                        🕐 Tempo Médio: {metrics.averageProcessingTime}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-center p-2">
                      <div className="h6 mb-1">
                        📅 Hoje: {metrics.todayUploads} uploads
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <div
                className={`border-2 border-dashed rounded p-4 text-center ${
                  dragOver ? "border-primary bg-light" : "border-secondary"
                } ${isUploading ? "opacity-50" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                style={{
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="mb-3">
                  <div
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <span style={{ fontSize: "24px" }}>☁️</span>
                  </div>
                </div>
                <h5 className="mb-2">Arraste e solte ou clique para enviar</h5>
                <p className="text-muted mb-3">Suporta: PDF, DOCX, TXT</p>

                {isUploading && (
                  <div className="w-50 mx-auto mb-3">
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${uploadProgress}%` }}
                        role="progressbar"
                      >
                        {Math.round(uploadProgress)}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
                  <span>🔒</span>
                  <span>
                    Garantimos a confidencialidade e anonimização dos seus dados
                  </span>
                </div>
              </div>

              {/* Voice Option */}
              <div className="mt-3" style={{ maxWidth: "300px" }}>
                <label htmlFor="voiceSelect" className="form-label">
                  Gerar áudio
                </label>
                <select
                  id="voiceSelect"
                  className="form-select"
                  value={voiceOption}
                  onChange={(e) =>
                    setVoiceOption(
                      e.target.value as "nenhum" | "masculino" | "feminino",
                    )
                  }
                  disabled={isUploading}
                >
                  <option value="nenhum">Nenhum</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>

              <input
                id="fileInput"
                type="file"
                className="d-none"
                accept=".pdf,.txt,.docx"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share Results Section */}
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Compartilhar Resultados</h5>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Número de WhatsApp ou e-mail"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <button
                  className="btn btn-primary d-flex align-items-center gap-1"
                  onClick={() =>
                    diagnosisQueue.length > 0 && handleShare(diagnosisQueue[0])
                  }
                  disabled={
                    !shareEmail.trim() ||
                    diagnosisQueue.length === 0 ||
                    (diagnosisQueue.length > 0 &&
                      sharingItems.has(diagnosisQueue[0].id))
                  }
                >
                  {diagnosisQueue.length > 0 &&
                  sharingItems.has(diagnosisQueue[0].id) ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      Compartilhar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Queue */}
      <div className="row">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Fila de Diagnósticos</h3>
            <small className="text-muted">
              Última sincronização: {new Date().toLocaleString("pt-BR")}
            </small>
          </div>

          {diagnosisQueue.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="text-muted">
                  <div style={{ fontSize: "48px" }} className="mb-3">
                    📋
                  </div>
                  <h5>Nenhum diagnóstico encontrado</h5>
                  <p>Faça upload de um arquivo para começar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {diagnosisQueue.map((item) => (
                <div key={item.id} className="col-12 mb-3">
                  <div
                    className={`card ${item.status === "error" ? "border-danger" : ""}`}
                  >
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className={`rounded p-2 ${item.status === "error" ? "bg-danger-subtle" : "bg-primary-subtle"}`}
                            >
                              <span style={{ fontSize: "24px" }}>
                                {item.fileType === "pdf"
                                  ? "📄"
                                  : item.fileType === "audio"
                                    ? "🎵"
                                    : "📝"}
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">{item.fileName}</h6>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className={`badge ${item.status === "completed" ? "bg-success" : item.status === "error" ? "bg-danger" : "bg-warning"}`}
                                >
                                  <span className="me-1">
                                    {getStatusIcon(item.status)}
                                  </span>
                                  {getStatusText(item.status)}
                                </span>
                                {item.status === "processing" && (
                                  <div
                                    className="progress"
                                    style={{ width: "100px", height: "4px" }}
                                  >
                                    <div
                                      className="progress-bar progress-bar-striped progress-bar-animated"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                              {item.errorMessage && (
                                <small className="text-danger">
                                  {item.errorMessage}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                            {item.status === "completed" && (
                              <>
                                {item.audioUrl && (
                                  <button className="btn btn-sm btn-outline-primary">
                                    <span className="me-1">🎵</span>
                                    Ouvir
                                  </button>
                                )}
                                {item.pdfUrl && (
                                  <button className="btn btn-sm btn-outline-primary">
                                    <span className="me-1">📄</span>
                                    PDF
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                  onClick={() => handleShare(item)}
                                  disabled={
                                    !shareEmail.trim() ||
                                    sharingItems.has(item.id)
                                  }
                                >
                                  {sharingItems.has(item.id) ? (
                                    <>
                                      <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                      ></span>
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <span>📤</span>
                                      Compartilhar
                                    </>
                                  )}
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <span className="me-1">⬇️</span>
                                  Baixar
                                </button>
                              </>
                            )}
                            {item.status === "error" && (
                              <button
                                className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                                onClick={() => handleRetry(item)}
                                disabled={retryingItems.has(item.id)}
                              >
                                {retryingItems.has(item.id) ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    Tentando...
                                  </>
                                ) : (
                                  <>
                                    <span>🔄</span>
                                    Tentar Novamente
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
