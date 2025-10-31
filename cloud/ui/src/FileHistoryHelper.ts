// ui/src/FileHistoryHelper.ts
import { API_BASE_URL } from "./constants/api";

export interface FileHistoryItem {
  token: string;
  originalName: string;
  customName?: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  description?: string;
  fileUrl: string;
  processed: boolean;
  analysisResult?: string;
  lastAnalyzedAt?: string;
}

export interface FileHistoryResponse {
  files: FileHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  timestamp: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  processedFiles: number;
  mimeTypeDistribution: Record<string, number>;
  uploadsPerDay: Record<string, number>;
  timestamp: string;
}

export interface FileHistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  mimeType?: string;
  dateFrom?: string;
  dateTo?: string;
}

const FILE_HISTORY_ENDPOINT = `${API_BASE_URL}/file-history`;

export async function getFileHistory(
  query: FileHistoryQuery = {},
): Promise<FileHistoryResponse> {
  const searchParams = new URLSearchParams();

  if (query.page) searchParams.set("page", query.page.toString());
  if (query.limit) searchParams.set("limit", query.limit.toString());
  if (query.search) searchParams.set("search", query.search);
  if (query.mimeType) searchParams.set("mimeType", query.mimeType);
  if (query.dateFrom) searchParams.set("dateFrom", query.dateFrom);
  if (query.dateTo) searchParams.set("dateTo", query.dateTo);

  const url = searchParams.toString()
    ? `${FILE_HISTORY_ENDPOINT}?${searchParams}`
    : FILE_HISTORY_ENDPOINT;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file history: ${response.statusText}`);
  }

  return response.json();
}

export async function getFileStats(): Promise<FileStats> {
  const response = await fetch(`${FILE_HISTORY_ENDPOINT}/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch file statistics: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteFile(
  token: string,
): Promise<{ message: string; token: string; timestamp: string }> {
  const response = await fetch(`${FILE_HISTORY_ENDPOINT}/${token}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to delete file (${response.status}): ${response.statusText}`,
    );
  }

  return response.json();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMimeTypeIcon(mimeType: string): string {
  if (mimeType.startsWith("application/pdf")) return "📄";
  if (mimeType.startsWith("text/")) return "📝";
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.includes("javascript")) return "📜";
  return "📁";
}
