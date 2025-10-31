// ui/src/DashboardMetricsHelper.ts
// Helper for dashboard metrics synchronization and real-time updates

export interface DiagnosticMetrics {
  totalDiagnostics: number;
  successfulDiagnostics: number;
  failedDiagnostics: number;
  processingDiagnostics: number;
  todayUploads: number;
  averageProcessingTime: string;
  successRate: number;
  lastUpdate: string;
}

export interface DiagnosticItem {
  id: string;
  fileName: string;
  fileType: "pdf" | "audio" | "text";
  status: "uploading" | "processing" | "completed" | "error";
  uploadDate: Date;
  fileUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  errorMessage?: string;
  progress: number;
  processingStartTime?: number;
  processingEndTime?: number;
}

const METRICS_STORAGE_KEY = "yagnostic-dashboard-metrics";
const QUEUE_STORAGE_KEY = "yagnostic-diagnosis-queue";

/**
 * Calculate metrics from current diagnostic queue
 */
export function calculateMetrics(
  diagnosticQueue: DiagnosticItem[],
): DiagnosticMetrics {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayItems = diagnosticQueue.filter(
    (item) => new Date(item.uploadDate) >= today,
  );

  const completedItems = diagnosticQueue.filter(
    (item) =>
      item.status === "completed" &&
      item.processingStartTime &&
      item.processingEndTime,
  );

  const averageProcessingTime =
    completedItems.length > 0
      ? completedItems.reduce((acc, item) => {
          const processingTime =
            (item.processingEndTime! - item.processingStartTime!) / 1000;
          return acc + processingTime;
        }, 0) / completedItems.length
      : 0;

  const totalDiagnostics = diagnosticQueue.length;
  const successfulDiagnostics = diagnosticQueue.filter(
    (item) => item.status === "completed",
  ).length;
  const failedDiagnostics = diagnosticQueue.filter(
    (item) => item.status === "error",
  ).length;
  const processingDiagnostics = diagnosticQueue.filter(
    (item) => item.status === "uploading" || item.status === "processing",
  ).length;

  return {
    totalDiagnostics,
    successfulDiagnostics,
    failedDiagnostics,
    processingDiagnostics,
    todayUploads: todayItems.length,
    averageProcessingTime: `${Math.round((averageProcessingTime / 60) * 10) / 10} min`,
    successRate:
      totalDiagnostics > 0
        ? Math.round((successfulDiagnostics / totalDiagnostics) * 100 * 10) / 10
        : 0,
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * Save metrics to localStorage
 */
export function saveMetrics(metrics: DiagnosticMetrics): void {
  try {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.error("Error saving metrics:", error);
  }
}

/**
 * Load metrics from localStorage
 */
export function loadMetrics(): DiagnosticMetrics | null {
  try {
    const stored = localStorage.getItem(METRICS_STORAGE_KEY);
    if (!stored) return null;

    return JSON.parse(stored) as DiagnosticMetrics;
  } catch (error) {
    console.error("Error loading metrics:", error);
    return null;
  }
}

/**
 * Save diagnostic queue with timestamps
 */
export function saveDiagnosticQueue(queue: DiagnosticItem[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

    // Update metrics when queue changes
    const metrics = calculateMetrics(queue);
    saveMetrics(metrics);
  } catch (error) {
    console.error("Error saving diagnostic queue:", error);
  }
}

/**
 * Load diagnostic queue from localStorage
 */
export function loadDiagnosticQueue(): DiagnosticItem[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!stored) return [];

    const queue = JSON.parse(stored) as DiagnosticItem[];

    // Convert date strings back to Date objects
    return queue.map((item) => ({
      ...item,
      uploadDate: new Date(item.uploadDate),
    }));
  } catch (error) {
    console.error("Error loading diagnostic queue:", error);
    return [];
  }
}

/**
 * Sync metrics with API
 */
export async function syncMetricsWithAPI(
  metrics: DiagnosticMetrics,
  retries: number = 2,
): Promise<{ success: boolean; error?: string }> {
  const MAX_RETRIES = retries;
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch("/diagnostics/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metrics),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        lastError = `API Error ${response.status}: ${errorText}`;

        // Don't retry on client errors
        if (response.status >= 400 && response.status < 500) {
          break;
        }
      }
    } catch (error) {
      lastError = `Network error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Wait before retrying
    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  console.warn(`Failed to sync metrics with API:`, lastError);
  return { success: false, error: lastError };
}

/**
 * Retry a failed diagnostic item
 */
export async function retryDiagnostic(
  itemId: string,
  originalFile?: File,
): Promise<{ success: boolean; error?: string }> {
  console.log(`Retrying diagnostic ${itemId}`);
  if (!originalFile) {
    return {
      success: false,
      error: "Arquivo original não disponível para nova tentativa",
    };
  }

  try {
    // Simulate retry - in real implementation this would call the API
    const formData = new FormData();
    formData.append("file", originalFile);

    const response = await fetch("/diagnostics/retry", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      await response.json(); // Parse response for potential future use
      return { success: true };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `Erro ${response.status}: ${errorText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Share diagnostic result via email
 */
export async function shareDiagnostic(
  itemId: string,
  email: string,
  message?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!email.trim()) {
    return { success: false, error: "Email é obrigatório" };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Email inválido" };
  }

  try {
    const response = await fetch("/diagnostics/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId,
        email,
        message: message || "Compartilhamento de resultado de diagnóstico",
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `Erro ${response.status}: ${errorText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro de rede",
    };
  }
}

/**
 * Get real-time processing status from API
 */
export async function getProcessingStatus(itemId: string): Promise<{
  status: DiagnosticItem["status"];
  progress: number;
  error?: string;
} | null> {
  try {
    const response = await fetch(`/diagnostics/status/${itemId}`);

    if (response.ok) {
      return await response.json();
    } else {
      console.warn(`Failed to get status for ${itemId}: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.warn(`Network error getting status for ${itemId}:`, error);
    return null;
  }
}
