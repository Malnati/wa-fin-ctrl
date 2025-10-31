// ui/src/shared/lib/ConsentHelper.ts

// Utility for managing LGPD consent state and persistence

import { API_BASE_URL } from "../../constants/api";

export interface ConsentData {
  dataProcessing: boolean;
  termsAndPrivacy: boolean;
  timestamp: string;
  userEmail?: string;
  version: string; // Version of the terms accepted
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  consent?: ConsentData;
  permissionsGranted: boolean;
  isComplete: boolean;
}

const CONSENT_STORAGE_KEY =
  import.meta.env.VITE_CONSENT_STORAGE_KEY || "yagnostic-lgpd-consent";
const ONBOARDING_STORAGE_KEY =
  import.meta.env.VITE_ONBOARDING_STORAGE_KEY ||
  "yagnostic-onboarding-progress";
const CONSENT_VERSION = import.meta.env.VITE_CONSENT_VERSION || "1.0.0"; // Version of current terms

/**
 * Save consent data to localStorage with LGPD compliance
 */
export function saveConsent(
  consent: Partial<ConsentData>,
  userEmail?: string,
): ConsentData {
  const consentData: ConsentData = {
    dataProcessing: consent.dataProcessing || false,
    termsAndPrivacy: consent.termsAndPrivacy || false,
    timestamp: new Date().toISOString(),
    userEmail: userEmail,
    version: CONSENT_VERSION,
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));

  // Also save to sessionStorage for redundancy
  sessionStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));

  return consentData;
}

/**
 * Save consent with immediate API synchronization
 */
export async function saveConsentWithSync(
  consent: Partial<ConsentData>,
  userEmail?: string,
): Promise<{ consentData: ConsentData; syncSuccess: boolean; error?: string }> {
  // First save locally
  const consentData = saveConsent(consent, userEmail);

  // Then sync with API
  const syncResult = await submitConsentToAPI(consentData);

  // If API sync fails, log but don't prevent the user from proceeding
  // The data is still saved locally and can be synced later
  return {
    consentData,
    syncSuccess: syncResult.success,
    error: syncResult.error,
  };
}

/**
 * Load consent data from localStorage
 */
export function loadConsent(): ConsentData | null {
  try {
    const storedConsent =
      localStorage.getItem(CONSENT_STORAGE_KEY) ||
      sessionStorage.getItem(CONSENT_STORAGE_KEY);

    if (!storedConsent) return null;

    const consent = JSON.parse(storedConsent) as ConsentData;

    // Validate consent data structure
    if (
      typeof consent.dataProcessing !== "boolean" ||
      typeof consent.termsAndPrivacy !== "boolean" ||
      !consent.timestamp
    ) {
      return null;
    }

    return consent;
  } catch (error) {
    console.error("Error loading consent data:", error);
    return null;
  }
}

/**
 * Check if user has valid consent
 */
export function hasValidConsent(): boolean {
  const consent = loadConsent();

  if (!consent) return false;

  // Check if both required consents are given
  if (!consent.dataProcessing || !consent.termsAndPrivacy) {
    return false;
  }

  // Check if consent version is current
  if (consent.version !== CONSENT_VERSION) {
    return false;
  }

  // Check if consent is not too old (optional - implement if needed)
  // const consentAge = Date.now() - new Date(consent.timestamp).getTime();
  // const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  // if (consentAge > maxAge) return false;

  return true;
}

/**
 * Clear consent data (for logout or consent withdrawal)
 */
export function clearConsent(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  sessionStorage.removeItem(CONSENT_STORAGE_KEY);
}

/**
 * Save onboarding progress
 */
export function saveOnboardingProgress(progress: OnboardingProgress): void {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
  sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Load onboarding progress
 */
export function loadOnboardingProgress(): OnboardingProgress | null {
  try {
    const storedProgress =
      localStorage.getItem(ONBOARDING_STORAGE_KEY) ||
      sessionStorage.getItem(ONBOARDING_STORAGE_KEY);

    if (!storedProgress) return null;

    return JSON.parse(storedProgress) as OnboardingProgress;
  } catch (error) {
    console.error("Error loading onboarding progress:", error);
    return null;
  }
}

/**
 * Clear onboarding progress
 */
export function clearOnboardingProgress(): void {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(): boolean {
  const progress = loadOnboardingProgress();

  if (!progress) return false;

  return (
    progress.isComplete && hasValidConsent() && progress.permissionsGranted
  );
}

/**
 * Check if navigation should be blocked until onboarding completion
 * Used to enforce LGPD compliance before allowing access to main application
 */
export function shouldBlockNavigation(): boolean {
  return !isOnboardingComplete();
}

/**
 * Get onboarding status with detailed information
 */
export function getOnboardingStatus(): {
  isComplete: boolean;
  hasValidConsent: boolean;
  permissionsGranted: boolean;
  currentStep: number;
  completedSteps: number[];
  blockingIssues: string[];
} {
  const progress = loadOnboardingProgress();
  const validConsent = hasValidConsent();

  const blockingIssues: string[] = [];

  if (!progress) {
    blockingIssues.push("Onboarding not started");
  } else {
    if (!validConsent) {
      blockingIssues.push("LGPD consent required");
    }
    if (!progress.permissionsGranted) {
      blockingIssues.push("Permissions not granted");
    }
    if (!progress.isComplete) {
      blockingIssues.push("Onboarding steps incomplete");
    }
  }

  return {
    isComplete: isOnboardingComplete(),
    hasValidConsent: validConsent,
    permissionsGranted: progress?.permissionsGranted || false,
    currentStep: progress?.currentStep || 1,
    completedSteps: progress?.completedSteps || [],
    blockingIssues,
  };
}

/**
 * Initialize onboarding progress
 */
export function initializeOnboardingProgress(): OnboardingProgress {
  const progress: OnboardingProgress = {
    currentStep: 1,
    completedSteps: [],
    permissionsGranted: false,
    isComplete: false,
  };

  saveOnboardingProgress(progress);
  return progress;
}

/**
 * Update onboarding step
 */
export function updateOnboardingStep(
  step: number,
  completed: boolean = false,
): void {
  const progress = loadOnboardingProgress() || initializeOnboardingProgress();

  progress.currentStep = step;

  if (completed && !progress.completedSteps.includes(step)) {
    progress.completedSteps.push(step);
  }

  // Check if all steps are completed
  const requiredSteps = [1, 2, 3]; // Welcome, Consent, Permissions
  const allStepsCompleted = requiredSteps.every((s) =>
    progress.completedSteps.includes(s),
  );

  if (allStepsCompleted && hasValidConsent()) {
    progress.isComplete = true;
  }

  saveOnboardingProgress(progress);
}

/**
 * Mark permissions as granted
 */
export function markPermissionsGranted(): void {
  const progress = loadOnboardingProgress() || initializeOnboardingProgress();
  progress.permissionsGranted = true;
  updateOnboardingStep(3, true);
  saveOnboardingProgress(progress);
}

/**
 * Send consent data to API for audit logging with retry mechanism
 */
export async function submitConsentToAPI(
  consent: ConsentData,
  retries: number = 3,
): Promise<{ success: boolean; error?: string }> {
  const MAX_RETRIES = retries;
  let lastError: string = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/consent/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Consent-Version": CONSENT_VERSION,
        },
        body: JSON.stringify({
          dataProcessing: consent.dataProcessing,
          termsAndPrivacy: consent.termsAndPrivacy,
          userEmail: consent.userEmail,
          timestamp: consent.timestamp,
          version: consent.version,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Consent successfully submitted to API", responseData);
        return { success: true };
      } else {
        const errorText = await response.text();
        lastError = `API Error ${response.status}: ${errorText}`;

        // Don't retry on client errors (400-499)
        if (response.status >= 400 && response.status < 500) {
          break;
        }
      }
    } catch (error) {
      lastError = `Network error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Wait before retrying (exponential backoff)
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error(
    `Failed to submit consent to API after ${MAX_RETRIES} attempts:`,
    lastError,
  );
  return { success: false, error: lastError };
}

/**
 * Validate user consent with API
 */
export async function validateConsentWithAPI(
  userEmail: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/consent/validate/${encodeURIComponent(userEmail)}`,
    );
    const data = await response.json();

    return data.hasValidConsent || false;
  } catch (error) {
    console.error("Failed to validate consent with API:", error);
    return false;
  }
}
