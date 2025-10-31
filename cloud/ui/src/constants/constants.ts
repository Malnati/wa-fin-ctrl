// ui/src/constants/constants.ts

// Environment variable utility function for Vite projects
function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not defined. For UI project using Vite, ensure VITE_API_URL is set in your environment or .env file.`,
    );
  }
  return value;
}

// UploadHelper IndexedDB config from environment variables
export const UPLOAD_DB_NAME = getEnvVar("VITE_UPLOAD_DB_NAME");
export const UPLOAD_DB_VERSION = Number(getEnvVar("VITE_UPLOAD_DB_VERSION"));
export const UPLOAD_FILES_STORE = getEnvVar("VITE_UPLOAD_FILES_STORE");

// Vite env type augmentation for TypeScript (ambient declaration)
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_HTTPS_PROTOCOL: string;
    readonly VITE_COOKIE_PATH_ATTR: string;
    readonly VITE_COOKIE_SAME_SITE_ATTR: string;
    readonly VITE_COOKIE_DELETE_DATE: string;
    readonly VITE_COOKIE_MAX_AGE_MS: string;
    readonly VITE_AUTH_TOKEN_COOKIE_KEY: string;
    readonly VITE_USER_EMAIL_COOKIE_KEY: string;
    readonly VITE_USER_NAME_COOKIE_KEY: string;
    readonly VITE_USER_PICTURE_COOKIE_KEY: string;
    readonly VITE_LOCAL_STORAGE_AUTH_TOKEN_KEY: string;
    readonly VITE_LOCAL_STORAGE_USER_EMAIL_KEY: string;
    readonly VITE_LOCAL_STORAGE_USER_NAME_KEY: string;
    readonly VITE_LOCAL_STORAGE_USER_PICTURE_KEY: string;
    readonly VITE_BYPASS_DEFAULT_TOKEN: string;
    readonly VITE_BYPASS_DEFAULT_EMAIL: string;
    readonly VITE_BYPASS_DEFAULT_NAME: string;
    readonly VITE_UPLOAD_DB_NAME: string;
    readonly VITE_UPLOAD_DB_VERSION: string;
    readonly VITE_UPLOAD_FILES_STORE: string;
    // Company branding variables
    readonly VITE_COMPANY_NAME: string;
    readonly VITE_COMPANY_LOGO_URL: string;
    readonly VITE_COMPANY_TITLE: string;
    readonly VITE_COMPANY_DEVELOPED_BY: string;
    readonly VITE_COMPANY_COPYRIGHT: string;
    readonly VITE_COMPANY_REGISTRATION_DATE: string;
    readonly VITE_COMPANY_CONTACT_EMAIL: string;
    readonly VITE_COMPANY_CONTACT_PHONE: string;
    readonly VITE_COMPANY_CONTACT_ADDRESS: string;
    readonly VITE_COMPANY_WEBSITE: string;
    readonly VITE_COMPANY_FACEBOOK: string;
    readonly VITE_COMPANY_TWITTER: string;
    readonly VITE_COMPANY_GOOGLE: string;
    readonly VITE_COMPANY_INSTAGRAM: string;
    readonly VITE_COMPANY_LINKEDIN: string;
    readonly VITE_COMPANY_GITHUB: string;
    // White-label branding variables
    readonly VITE_WL_COMPANY_NAME: string;
    readonly VITE_WL_COMPANY_LOGO_URL: string;
    readonly VITE_WL_COMPANY_TITLE: string;
    readonly VITE_WL_COMPANY_DEVELOPED_BY: string;
    readonly VITE_WL_COMPANY_COPYRIGHT: string;
    readonly VITE_WL_COMPANY_REGISTRATION_DATE: string;
    readonly VITE_WL_COMPANY_CONTACT_EMAIL: string;
    readonly VITE_WL_COMPANY_CONTACT_PHONE: string;
    readonly VITE_WL_COMPANY_CONTACT_ADDRESS: string;
    readonly VITE_WL_COMPANY_WEBSITE: string;
    readonly VITE_WL_COMPANY_FACEBOOK: string;
    readonly VITE_WL_COMPANY_TWITTER: string;
    readonly VITE_WL_COMPANY_GOOGLE: string;
    readonly VITE_WL_COMPANY_INSTAGRAM: string;
    readonly VITE_WL_COMPANY_LINKEDIN: string;
    readonly VITE_WL_COMPANY_GITHUB: string;
    // File History variables
    readonly VITE_FILE_HISTORY_DEFAULT_TITLE: string;
    readonly VITE_FILE_HISTORY_ITEMS_PER_PAGE: string;
    readonly VITE_FILE_HISTORY_MAX_PAGINATION_BUTTONS: string;
    readonly VITE_AVATAR_PLACEHOLDER_URL: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Login/session constants from environment variables (no defaults)
export const HTTPS_PROTOCOL = getEnvVar("VITE_HTTPS_PROTOCOL");
export const COOKIE_PATH_ATTR = getEnvVar("VITE_COOKIE_PATH_ATTR");
export const COOKIE_SAME_SITE_ATTR = getEnvVar("VITE_COOKIE_SAME_SITE_ATTR");
export const COOKIE_DELETE_DATE = getEnvVar("VITE_COOKIE_DELETE_DATE");
export const COOKIE_MAX_AGE_MS = Number(getEnvVar("VITE_COOKIE_MAX_AGE_MS"));
export const AUTH_TOKEN_COOKIE_KEY = getEnvVar("VITE_AUTH_TOKEN_COOKIE_KEY");
export const USER_EMAIL_COOKIE_KEY = getEnvVar("VITE_USER_EMAIL_COOKIE_KEY");
export const USER_NAME_COOKIE_KEY = getEnvVar("VITE_USER_NAME_COOKIE_KEY");
export const USER_PICTURE_COOKIE_KEY = getEnvVar(
  "VITE_USER_PICTURE_COOKIE_KEY",
);
export const LOCAL_STORAGE_AUTH_TOKEN_KEY = getEnvVar(
  "VITE_LOCAL_STORAGE_AUTH_TOKEN_KEY",
);
export const LOCAL_STORAGE_USER_EMAIL_KEY = getEnvVar(
  "VITE_LOCAL_STORAGE_USER_EMAIL_KEY",
);
export const LOCAL_STORAGE_USER_NAME_KEY = getEnvVar(
  "VITE_LOCAL_STORAGE_USER_NAME_KEY",
);
export const LOCAL_STORAGE_USER_PICTURE_KEY = getEnvVar(
  "VITE_LOCAL_STORAGE_USER_PICTURE_KEY",
);
export const BYPASS_DEFAULT_TOKEN = getEnvVar("VITE_BYPASS_DEFAULT_TOKEN");
export const BYPASS_DEFAULT_EMAIL = getEnvVar("VITE_BYPASS_DEFAULT_EMAIL");
export const BYPASS_DEFAULT_NAME = getEnvVar("VITE_BYPASS_DEFAULT_NAME");
/**
 * Returns the API base URL from environment variables for the UI project.
 *
 * Environment Variable Mapping:
 * - API Project (Node.js): process.env.API_BASE_URL
 * - UI Project (Vite): import.meta.env.VITE_API_URL ← THIS PROJECT
 * - Extension Project (Vite): import.meta.env.VITE_API_URL
 *
 * All projects export this value as the same constant name: API_BASE_URL
 * This ensures a single source of truth while respecting environment-specific naming conventions.
 *
 * No hard-coded fallback is allowed. All configuration must come from env.
 */
export function getApiBaseUrl(): string {
  return getEnvVar("VITE_API_URL");
}

/**
 * The standardized API base URL constant used across all projects.
 * This is the single source of truth for the API endpoint URL.
 */
export const API_BASE_URL = getApiBaseUrl();

// Branding constants from environment variables
export const COMPANY_NAME = getEnvVar("VITE_COMPANY_NAME");
export const COMPANY_LOGO_URL = getEnvVar("VITE_COMPANY_LOGO_URL");
export const COMPANY_TITLE = getEnvVar("VITE_COMPANY_TITLE");
export const COMPANY_DEVELOPED_BY = getEnvVar("VITE_COMPANY_DEVELOPED_BY");
export const COMPANY_COPYRIGHT = getEnvVar("VITE_COMPANY_COPYRIGHT");
export const COMPANY_REGISTRATION_DATE = getEnvVar(
  "VITE_COMPANY_REGISTRATION_DATE",
);
export const COMPANY_CONTACT_EMAIL = getEnvVar("VITE_COMPANY_CONTACT_EMAIL");
export const COMPANY_CONTACT_PHONE = getEnvVar("VITE_COMPANY_CONTACT_PHONE");
export const COMPANY_CONTACT_ADDRESS = getEnvVar(
  "VITE_COMPANY_CONTACT_ADDRESS",
);
export const COMPANY_WEBSITE = getEnvVar("VITE_COMPANY_WEBSITE");
export const COMPANY_FACEBOOK = getEnvVar("VITE_COMPANY_FACEBOOK");
export const COMPANY_TWITTER = getEnvVar("VITE_COMPANY_TWITTER");
export const COMPANY_GOOGLE = getEnvVar("VITE_COMPANY_GOOGLE");
export const COMPANY_INSTAGRAM = getEnvVar("VITE_COMPANY_INSTAGRAM");
export const COMPANY_LINKEDIN = getEnvVar("VITE_COMPANY_LINKEDIN");
export const COMPANY_GITHUB = getEnvVar("VITE_COMPANY_GITHUB");

// White-label branding constants from environment variables
export const WL_COMPANY_NAME = getEnvVar("VITE_WL_COMPANY_NAME");
export const WL_COMPANY_LOGO_URL = getEnvVar("VITE_WL_COMPANY_LOGO_URL");
export const WL_COMPANY_TITLE = getEnvVar("VITE_WL_COMPANY_TITLE");
export const WL_COMPANY_DEVELOPED_BY = getEnvVar(
  "VITE_WL_COMPANY_DEVELOPED_BY",
);
export const WL_COMPANY_COPYRIGHT = getEnvVar("VITE_WL_COMPANY_COPYRIGHT");
export const WL_COMPANY_REGISTRATION_DATE = getEnvVar(
  "VITE_WL_COMPANY_REGISTRATION_DATE",
);
export const WL_COMPANY_CONTACT_EMAIL = getEnvVar(
  "VITE_WL_COMPANY_CONTACT_EMAIL",
);
export const WL_COMPANY_CONTACT_PHONE = getEnvVar(
  "VITE_WL_COMPANY_CONTACT_PHONE",
);
export const WL_COMPANY_CONTACT_ADDRESS = getEnvVar(
  "VITE_WL_COMPANY_CONTACT_ADDRESS",
);
export const WL_COMPANY_WEBSITE = getEnvVar("VITE_WL_COMPANY_WEBSITE");
export const WL_COMPANY_FACEBOOK = getEnvVar("VITE_WL_COMPANY_FACEBOOK");
export const WL_COMPANY_TWITTER = getEnvVar("VITE_WL_COMPANY_TWITTER");
export const WL_COMPANY_GOOGLE = getEnvVar("VITE_WL_COMPANY_GOOGLE");
export const WL_COMPANY_INSTAGRAM = getEnvVar("VITE_WL_COMPANY_INSTAGRAM");
export const WL_COMPANY_LINKEDIN = getEnvVar("VITE_WL_COMPANY_LINKEDIN");
export const WL_COMPANY_GITHUB = getEnvVar("VITE_WL_COMPANY_GITHUB");

// LGPD Onboarding Constants
export const ONBOARDING_STEPS = {
  WELCOME: "welcome",
  CONSENT: "consent",
  PERMISSIONS: "permissions",
  COMPLETE: "complete",
} as const;

export const ONBOARDING_STEP_NAMES = {
  [ONBOARDING_STEPS.WELCOME]: "Boas-vindas",
  [ONBOARDING_STEPS.CONSENT]: "Consentimento LGPD",
  [ONBOARDING_STEPS.PERMISSIONS]: "Permissões",
  [ONBOARDING_STEPS.COMPLETE]: "Concluído",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ONBOARDING_PROGRESS: "yagnostic_onboarding_progress",
  CONSENT_DATA: "yagnostic_consent_data",
  USER_APPROVAL_STATUS: "yagnostic_approval_status",
} as const;

// Approval Status Values
export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// File Upload Constants
export const SUPPORTED_FILE_TYPES = [
  ".pdf",
  ".txt",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
// File History constants from environment variables
export const FILE_HISTORY_DEFAULT_TITLE = getEnvVar(
  "VITE_FILE_HISTORY_DEFAULT_TITLE",
);
export const FILE_HISTORY_ITEMS_PER_PAGE = Number(
  getEnvVar("VITE_FILE_HISTORY_ITEMS_PER_PAGE"),
);
export const FILE_HISTORY_MAX_PAGINATION_BUTTONS = Number(
  getEnvVar("VITE_FILE_HISTORY_MAX_PAGINATION_BUTTONS"),
);
export const AVATAR_PLACEHOLDER_URL = getEnvVar("VITE_AVATAR_PLACEHOLDER_URL");
