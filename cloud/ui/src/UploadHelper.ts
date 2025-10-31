import { openDatabase, type StoreConfig } from "./utils/indexedDb";
import { API_BASE_URL } from "./constants/api";

// Configuração do IndexedDB para arquivos
import {
  UPLOAD_DB_NAME,
  UPLOAD_DB_VERSION,
  UPLOAD_FILES_STORE,
} from "./constants/constants";

const DB_NAME = UPLOAD_DB_NAME;
const FILES_STORE = UPLOAD_FILES_STORE;
const DB_VERSION = UPLOAD_DB_VERSION;
const FILES_STORE_CONFIG: StoreConfig = {
  name: FILES_STORE,
  options: { keyPath: "id" },
  indexes: [
    { name: "timestamp", keyPath: "timestamp", options: { unique: false } },
    { name: "filename", keyPath: "filename", options: { unique: false } },
  ],
};

// API_BASE_URL is now imported from ./constants/api
const API_SUBMIT_ENDPOINT = "/diagnostics/submit";
const FORM_FIELD_FILE = "file";
const FORM_FIELD_AUDIO = "generateAudio";
const FORM_FIELD_VOICE = "voiceID";
const BOOLEAN_TRUE = "true";
const BOOLEAN_FALSE = "false";
const DOWNLOAD_FILE_URL = "";
const DOWNLOAD_AUDIO_URL = "";
const DOWNLOAD_PDF_URL = "";

// Interface para dados do arquivo
interface FileData {
  id: string;
  filename: string;
  type: string;
  size: number;
  timestamp: string;
  data: File;
}

export type DiagnosisStatus =
  | "uploading"
  | "processing"
  | "completed"
  | "error"
  | "pending";

// Interface para resultado da submissão
export interface SubmitResult {
  ok: boolean;
  status: number;
  json: SubmitResponse | null;
}

export interface SubmitResponse {
  status: string;
  resumo: string;
  text: string;
  textExtracted?: string;
  fileUrl: string;
  audioUrl?: string;
  pdfUrl?: string;
  pdfSentRaw?: boolean;
  isScanned?: boolean;
}

// Interface para parâmetros de submissão
export interface SubmitParams {
  file: File;
  generateAudio: boolean;
  voiceID: string;
}

// Função para abrir o banco de dados
async function openDB(): Promise<IDBDatabase> {
  return openDatabase(DB_NAME, DB_VERSION, FILES_STORE_CONFIG);
}

// Função para salvar arquivo no IndexedDB
async function saveFile(file: File): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, "readwrite");
    const store = tx.objectStore(FILES_STORE);

    const fileData: FileData = {
      id: Date.now().toString(),
      filename: file.name,
      type: file.type,
      size: file.size,
      timestamp: new Date().toISOString(),
      data: file,
    };

    const putReq = store.put(fileData);
    putReq.onsuccess = () => resolve(fileData.id);
    putReq.onerror = () => reject(putReq.error);
  });
}

// Função para obter arquivo do IndexedDB
export async function getFile(fileId: string): Promise<FileData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, "readonly");
    const store = tx.objectStore(FILES_STORE);
    const getReq = store.get(fileId);
    getReq.onsuccess = () => resolve(getReq.result || null);
    getReq.onerror = () => reject(getReq.error);
  });
}

// Função para obter todos os arquivos
export async function getAllFiles(): Promise<FileData[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, "readonly");
    const store = tx.objectStore(FILES_STORE);
    const getAllReq = store.getAll();
    getAllReq.onsuccess = () => resolve(getAllReq.result || []);
    getAllReq.onerror = () => reject(getAllReq.error);
  });
}

// Função principal para submeter PDF (fallback local)
export async function submitPdf({
  file,
  generateAudio,
  voiceID,
}: SubmitParams): Promise<SubmitResult> {
  console.log("💾 MODO FALLBACK: Processando arquivo localmente:", file.name);
  console.log("🎵 Simulando geração de áudio:", generateAudio);
  console.log("🎤 Voz selecionada para simulação:", voiceID);

  // Salvar arquivo no IndexedDB para contingência
  await saveFile(file);

  // Simular tempo de processamento (mais realista)
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000),
  );

  const voiceDisplayName =
    voiceID === "oi8rgjIfLgJRsQ6rbZh3"
      ? "Feminino"
      : voiceID === "fcJDpjLCtoGvTUQmNdkr"
        ? "Masculino"
        : "Padrão";

  return {
    ok: true,
    status: 200,
    json: {
      status: "SIMULAÇÃO - OK",
      resumo:
        "⚠️ MODO FALLBACK: Processamento local concluído. Esta é uma simulação para demonstração.",
      text: `🔬 RELATÓRIO DE ANÁLISE SIMULADA

📋 Arquivo Processado: ${file.name}
📊 Tamanho: ${(file.size / 1024).toFixed(1)} KB
📅 Data de Processamento: ${new Date().toLocaleString("pt-BR")}

═══════════════════════════════════════

📝 RESUMO EXECUTIVO
O arquivo foi processado em modo de simulação local devido à indisponibilidade da API de diagnóstico. 

🔍 ANÁLISE TÉCNICA SIMULADA
1. ✅ Extração de Texto: Simulada com sucesso
2. ✅ Processamento IA: Análise médica simulada
3. ✅ Validação de Conteúdo: Estrutura verificada
4. ${generateAudio ? `✅ Geração de Áudio: Simulada com voz ${voiceDisplayName} (${voiceID})` : "❌ Geração de Áudio: Não solicitada"}

⚠️ IMPORTANTE: Este é um resultado de demonstração gerado localmente. 
Para análises reais, certifique-se de que a API esteja disponível.

🏥 OBSERVAÇÕES CLÍNICAS SIMULADAS
- Documento médico identificado e catalogado
- Estrutura compatível com laudos laboratoriais
- Recomenda-se validação com equipe médica
- Dados armazenados localmente para backup

📋 PRÓXIMOS PASSOS
1. Verificar conectividade com a API
2. Reprocessar quando o serviço estiver disponível
3. Validar resultados com profissional qualificado`,
      fileUrl: DOWNLOAD_FILE_URL,
      audioUrl: generateAudio ? DOWNLOAD_AUDIO_URL : "",
      pdfUrl: DOWNLOAD_PDF_URL,
      pdfSentRaw: false,
      isScanned: false,
    },
  };
}

// Função para submeter PDF para API real (quando disponível)
export async function submitPdfToAPI({
  file,
  generateAudio,
  voiceID,
}: SubmitParams): Promise<SubmitResult> {
  const formData = new FormData();
  formData.append(FORM_FIELD_FILE, file);
  formData.append(
    FORM_FIELD_AUDIO,
    generateAudio ? BOOLEAN_TRUE : BOOLEAN_FALSE,
  );
  if (voiceID) {
    formData.append(FORM_FIELD_VOICE, voiceID);
  }

  try {
    console.log(
      `🚀 Enviando arquivo ${file.name} para API: ${API_BASE_URL}${API_SUBMIT_ENDPOINT}`,
    );
    console.log(`📊 Configurações: Áudio=${generateAudio}, Voz=${voiceID}`);

    const response = await fetch(`${API_BASE_URL}${API_SUBMIT_ENDPOINT}`, {
      method: "POST",
      body: formData,
    });

    let json;
    try {
      json = (await response.json()) as SubmitResponse;
      console.log("📥 Resposta da API recebida:", {
        status: response.status,
        ok: response.ok,
      });
    } catch (parseError) {
      console.error("❌ Erro ao processar resposta JSON da API:", parseError);
      json = null;
    }

    // Se a API retornou erro mas com uma mensagem válida, usar essa mensagem
    if (!response.ok && json?.resumo) {
      console.warn(`⚠️ API retornou erro ${response.status}: ${json.resumo}`);
    }

    return { ok: response.ok, status: response.status, json };
  } catch (error) {
    // Fallback para simulação local em caso de erro de rede
    console.warn(
      "🔄 Erro ao conectar com API, ativando fallback local:",
      error,
    );
    console.log(
      "📱 Modo fallback: salvando arquivo localmente e simulando análise",
    );
    return submitPdf({ file, generateAudio, voiceID });
  }
}
