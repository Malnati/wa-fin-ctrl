// ui/src/ApprovalHelper.ts
import {
  API_BASE_URL,
  STORAGE_KEYS,
  APPROVAL_STATUS,
} from "./constants/constants";

export interface ApprovalResponse {
  status: keyof typeof APPROVAL_STATUS;
  message?: string;
  lastUpdated?: string;
}

const APPROVAL_STATUS_ENTRIES = Object.entries(APPROVAL_STATUS) as Array<
  [
    keyof typeof APPROVAL_STATUS,
    (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS],
  ]
>;

export function normalizeApprovalStatus(
  status?: string | null,
): keyof typeof APPROVAL_STATUS {
  if (!status) {
    return "PENDING";
  }

  const normalized = status.toUpperCase() as keyof typeof APPROVAL_STATUS;
  if (normalized in APPROVAL_STATUS) {
    return normalized;
  }

  const fallback = APPROVAL_STATUS_ENTRIES.find(
    ([, value]) => value === status.toLowerCase(),
  );

  return fallback?.[0] ?? "PENDING";
}

/**
 * Check user approval status from API
 * For now, we'll simulate the approval check since the API endpoint doesn't exist yet
 */
export async function checkApprovalStatus(
  userEmail?: string,
): Promise<ApprovalResponse> {
  try {
    // Try to get approval status from API
    // This endpoint will be implemented in the future
    const response = await fetch(`${API_BASE_URL}/approval/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add auth headers when available
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: normalizeApprovalStatus(data.status),
        message: data.message,
        lastUpdated: data.lastUpdated,
      };
    }
  } catch {
    console.warn("⚠️ Approval API not available, using demo mode");
  }

  // Fallback: simulate approval status based on demo user
  if (userEmail === "usuario.demo@yagnostic.local") {
    return {
      status: "APPROVED",
      message: "Demo user automatically approved",
      lastUpdated: new Date().toISOString(),
    };
  }

  // For development, check localStorage for simulated approval status
  const savedStatus = localStorage.getItem(STORAGE_KEYS.USER_APPROVAL_STATUS);
  if (savedStatus) {
    try {
      const parsed = JSON.parse(savedStatus) as ApprovalResponse;
      return {
        ...parsed,
        status: normalizeApprovalStatus(parsed.status),
      };
    } catch (e) {
      console.warn("Failed to parse saved approval status:", e);
    }
  }

  // Default to pending for new users
  return {
    status: "PENDING",
    message: "Aguardando aprovação administrativa",
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Update approval status (for demo/testing purposes)
 */
export function setApprovalStatus(
  status: keyof typeof APPROVAL_STATUS,
  message?: string,
): void {
  const approvalData: ApprovalResponse = {
    status: normalizeApprovalStatus(status),
    message,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEYS.USER_APPROVAL_STATUS,
    JSON.stringify(approvalData),
  );
}

/**
 * Clear approval status from localStorage
 */
export function clearApprovalStatus(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_APPROVAL_STATUS);
}

/**
 * Check if user has approval to access the application
 */
export function isApproved(approvalStatus: ApprovalResponse): boolean {
  return approvalStatus.status === "APPROVED";
}
