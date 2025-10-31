import React, { useState, useRef, useMemo } from "react";

import { MarkdownContent } from "./MarkdownContent";
import { submitPdfToAPI, type SubmitResponse } from "./UploadHelper";
import {
  convertMarkdownToHtml,
  getMarkdownHtmlMap,
  type MarkdownHtmlMap,
} from "./utils/markdown";

interface UploadResult {
  ok: boolean;
  status: number;
  json: SubmitResponse | null;
}

interface UploadProps {
  title?: string;
}

const DEFAULT_TITLE = "Título de Demonstração";
const ERROR_SELECT_FILE = "Por favor, selecione um arquivo PDF.";
const ERROR_PREFIX = "Erro ao processar arquivo: ";
const ERROR_UNKNOWN = "Erro desconhecido";
const DOWNLOAD_ORIGINAL_LABEL = "Baixar Original";
const DOWNLOAD_ANALYSIS_LABEL = "Baixar PDF da Análise";
const DOWNLOAD_AUDIO_LABEL = "Ouvir Áudio";
const DOWNLOAD_AUDIO_NOT_AVAILABLE = "Áudio não disponível";
const ORIGINAL_CARD_TITLE = "Original";
const ORIGINAL_CARD_DESCRIPTION = "PDF enviado para análise";
const ANALYSIS_CARD_TITLE = "Análise";
const ANALYSIS_CARD_DESCRIPTION = "Análise de IA";
const AUDIO_CARD_TITLE = "Áudio";
const AUDIO_CARD_DESCRIPTION = "Análise falada";
const SUMMARY_SECTION_TITLE = "Resumo";
const SUMMARY_CARD_LABEL = "Resumo do processamento";
const STATUS_LABEL = "Status:";
const AUDIO_STATUS_LABEL = "Áudio gerado:";
const FILE_STATUS_LABEL = "Arquivo original:";
const PDF_STATUS_LABEL = "PDF da análise:";
const AVAILABLE_LABEL = "Disponível";
const UNAVAILABLE_LABEL = "Indisponível";
const YES_LABEL = "Sim";
const NO_LABEL = "Não";
const RESPONSE_FIELD_STATUS = "status";
const RESPONSE_FIELD_RESUMO = "resumo";
const RESPONSE_FIELD_TEXT = "text";
const PRE_WRAP_STYLE: React.CSSProperties = { whiteSpace: "pre-wrap" };

const Upload: React.FC<UploadProps> = ({ title = DEFAULT_TITLE }) => {
  const [file, setFile] = useState<File | null>(null);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [voiceID, setVoiceID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError(ERROR_SELECT_FILE);
      return;
    }

    // Validar tamanho do arquivo (10MB max conforme RF-024)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      setError(
        `Arquivo muito grande. Tamanho máximo permitido: 10MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      );
      return;
    }

    // Validar tipo de arquivo
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Apenas arquivos PDF são aceitos para análise médica.");
      return;
    }

    // Validar seleção de voz quando áudio está habilitado
    if (generateAudio && !voiceID) {
      setError("Por favor, selecione uma voz para gerar o áudio da análise.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(
        `🎯 Iniciando upload: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      );
      const response = await submitPdfToAPI({ file, generateAudio, voiceID });

      console.log(`📊 Resultado do upload:`, {
        ok: response.ok,
        status: response.status,
        hasAudio: !!response.json?.audioUrl,
        fallbackMode: response.json?.status?.includes("SIMULAÇÃO"),
      });

      if (!response.ok) {
        const errorMsg =
          response.json?.resumo ?? "Erro ao processar arquivo na API";
        setError(`${ERROR_PREFIX}${errorMsg}`);
        setResult(response);
        return;
      }

      // Verificar se o áudio foi solicitado mas não gerado
      if (generateAudio && !response.json?.audioUrl && response.ok) {
        console.warn("⚠️ Áudio solicitado mas não foi gerado pela API");
        // Não é um erro crítico, apenas uma observação
      }

      setResult(response);

      // Log de sucesso para auditoria
      console.log("✅ Upload concluído com sucesso:", {
        fileName: file.name,
        hasAudio: !!response.json?.audioUrl,
        hasPdf: !!response.json?.pdfUrl,
        isFallback: response.json?.status?.includes("SIMULAÇÃO"),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_UNKNOWN;
      console.error("❌ Erro crítico no upload:", err);
      setError(`${ERROR_PREFIX}${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createDownloadUrl = (content: string, type: string) => {
    const blob = new Blob([content], { type });
    return URL.createObjectURL(blob);
  };

  const downloadFile = (url: string, filename: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const responseData = result?.json;
  const markdownHtmlMap: MarkdownHtmlMap = useMemo(() => {
    if (!responseData) {
      return {};
    }

    return getMarkdownHtmlMap(responseData);
  }, [responseData]);

  const statusHtml = markdownHtmlMap[RESPONSE_FIELD_STATUS];
  const resumoHtml = markdownHtmlMap[RESPONSE_FIELD_RESUMO];
  const textHtml = useMemo(() => {
    if (!responseData?.text) {
      return undefined;
    }

    return (
      markdownHtmlMap[RESPONSE_FIELD_TEXT] ??
      convertMarkdownToHtml(responseData.text)
    );
  }, [markdownHtmlMap, responseData]);

  const hasAudio = Boolean(responseData?.audioUrl);
  const hasFileUrl = Boolean(responseData?.fileUrl);
  const hasPdfUrl = Boolean(responseData?.pdfUrl);

  return (
    <>
      <h1 className="mb-4 text-center">{title}</h1>

      <form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <div className="mb-3">
          <label htmlFor="pdfFile" className="form-label">
            Arquivo PDF
          </label>
          <input
            ref={fileInputRef}
            className="form-control"
            type="file"
            id="pdfFile"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="generateAudio"
            checked={generateAudio}
            onChange={(e) => setGenerateAudio(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="generateAudio">
            Gerar áudio
          </label>
        </div>
        <div className="mb-3">
          <label htmlFor="voiceID" className="form-label">
            Voz para Síntese (ElevenLabs)
            {generateAudio && (
              <small className="text-muted ms-1">
                • Obrigatório quando áudio estiver marcado
              </small>
            )}
          </label>
          <select
            className="form-select"
            id="voiceID"
            value={voiceID}
            onChange={(e) => setVoiceID(e.target.value)}
            disabled={!generateAudio}
          >
            <option value="">
              {generateAudio
                ? "Selecione uma voz (obrigatório)"
                : "Selecione uma voz"}
            </option>
            <option value="oi8rgjIfLgJRsQ6rbZh3">
              👩 Feminino - Português Brasileiro
            </option>
            <option value="fcJDpjLCtoGvTUQmNdkr">
              👨 Masculino - Português Brasileiro
            </option>
            <option value="7s3YtmzXx3fjwUtedUN0">
              🎭 Neutro - Profissional
            </option>
          </select>
          {generateAudio && !voiceID && (
            <div className="form-text text-warning">
              <i className="fas fa-exclamation-triangle me-1"></i>
              Por favor, selecione uma voz para gerar o áudio da análise.
            </div>
          )}
        </div>
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Analisando...
                <span
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              </>
            ) : (
              "Analisar"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4">
          <div className="alert alert-danger">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">❌ {error}</div>
              {result && (
                <button
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={() => {
                    setError(null);
                    setResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                    setFile(null);
                  }}
                >
                  🔄 Tentar Novamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {result && result.ok && responseData && (
        <div className="mt-4">
          {/* Fallback Mode Indicator */}
          {responseData.status?.includes("SIMULAÇÃO") && (
            <div className="alert alert-warning mb-4">
              <div className="d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <div className="flex-grow-1">
                  <strong>⚠️ Modo Fallback Ativo</strong>
                  <div className="small">
                    A API de diagnóstico não está disponível. Este resultado é
                    uma simulação local para demonstração. Conecte-se à API para
                    obter análises reais.
                  </div>
                </div>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => {
                    // Tentar novamente com a API
                    setError(null);
                    setResult(null);
                    // Trigger form submission programmatically
                    const form = document.querySelector("form");
                    if (form) {
                      const event = new Event("submit", {
                        bubbles: true,
                        cancelable: true,
                      });
                      form.dispatchEvent(event);
                    }
                  }}
                >
                  🔄 Tentar API
                </button>
              </div>
            </div>
          )}

          <h2>Resultado da Análise</h2>

          <div className="mb-4">
            <h5>{SUMMARY_SECTION_TITLE}</h5>
            <div className="border rounded p-3 bg-light">
              <p className="fw-bold mb-2">{SUMMARY_CARD_LABEL}</p>
              <p className="mb-1">
                <strong>{STATUS_LABEL}</strong>{" "}
                <MarkdownContent
                  component="span"
                  text={responseData.status}
                  html={statusHtml}
                />
              </p>
              <MarkdownContent
                component="p"
                className="mb-0"
                text={responseData.resumo}
                html={resumoHtml}
              />
            </div>
          </div>

          <div className="mb-4">
            <h5>{ANALYSIS_CARD_TITLE}</h5>
            <div className="border rounded p-3 bg-light">
              <MarkdownContent
                text={responseData.text}
                html={textHtml}
                fallbackStyle={PRE_WRAP_STYLE}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="fas fa-file-pdf fa-3x text-danger mb-2"></i>
                  <h6 className="card-title">{ORIGINAL_CARD_TITLE}</h6>
                  <p className="card-text small">{ORIGINAL_CARD_DESCRIPTION}</p>
                  {hasFileUrl ? (
                    <a
                      className="btn btn-outline-primary btn-sm"
                      href={responseData.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-download me-1"></i>
                      {DOWNLOAD_ORIGINAL_LABEL}
                    </a>
                  ) : file ? (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        const url = URL.createObjectURL(file);
                        downloadFile(url, file.name);
                      }}
                    >
                      <i className="fas fa-download me-1"></i>
                      {DOWNLOAD_ORIGINAL_LABEL}
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled
                    >
                      <i className="fas fa-download me-1"></i>
                      {UNAVAILABLE_LABEL}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="fas fa-file-pdf fa-3x text-success mb-2"></i>
                  <h6 className="card-title">{ANALYSIS_CARD_TITLE}</h6>
                  <p className="card-text small">{ANALYSIS_CARD_DESCRIPTION}</p>
                  {hasPdfUrl ? (
                    <a
                      className="btn btn-outline-success btn-sm"
                      href={responseData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-file-download me-1"></i>
                      {DOWNLOAD_ANALYSIS_LABEL}
                    </a>
                  ) : (
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => {
                        const url = createDownloadUrl(
                          responseData.text,
                          "application/pdf",
                        );
                        downloadFile(url, `diagnostico-${Date.now()}.pdf`);
                      }}
                    >
                      <i className="fas fa-file-download me-1"></i>
                      {DOWNLOAD_ANALYSIS_LABEL}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="fas fa-volume-up fa-3x text-info mb-2"></i>
                  <h6 className="card-title">{AUDIO_CARD_TITLE}</h6>
                  <p className="card-text small">{AUDIO_CARD_DESCRIPTION}</p>
                  {hasAudio ? (
                    <a
                      className="btn btn-outline-warning btn-sm"
                      href={responseData.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-headphones me-1"></i>
                      {DOWNLOAD_AUDIO_LABEL}
                    </a>
                  ) : (
                    <button className="btn btn-outline-warning btn-sm" disabled>
                      <i className="fas fa-headphones me-1"></i>
                      {DOWNLOAD_AUDIO_NOT_AVAILABLE}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>{SUMMARY_CARD_LABEL}</strong>
              <ul className="mb-0 mt-2">
                <li>
                  {FILE_STATUS_LABEL}{" "}
                  {hasFileUrl ? AVAILABLE_LABEL : UNAVAILABLE_LABEL}
                </li>
                <li>
                  {PDF_STATUS_LABEL}{" "}
                  {hasPdfUrl ? AVAILABLE_LABEL : UNAVAILABLE_LABEL}
                </li>
                <li>
                  {AUDIO_STATUS_LABEL} {hasAudio ? YES_LABEL : NO_LABEL}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { Upload };
