// Mensagens e prefixos de notificação de email
export const MESSAGE_PREFIX = getEnvVar('MESSAGE_PREFIX');
export const SUCCESS_MESSAGE = getEnvVar('SUCCESS_MESSAGE');
// api/src/constants/constants.ts

// Environment variable utility function for Node.js projects
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not defined. ` +
        `Please ensure this variable is properly configured in your docker-compose.yml file. ` +
        `For development, you can use 'docker-compose up' or set up your local environment ` +
        `according to the env.example file.`,
    );
  }
  return value;
}

/**
 * Returns the API base URL from environment variables for the API project.
 *
 * Environment Variable Mapping:
 * - API Project (Node.js): process.env.API_BASE_URL
 * - UI Project (Vite): import.meta.env.VITE_API_URL
 * - Extension Project (Vite): import.meta.env.VITE_API_URL
 *
 * All projects export this value as the same constant name: API_BASE_URL
 * This ensures a single source of truth while respecting environment-specific naming conventions.
 *
 * No hard-coded fallback is allowed. All configuration must come from env.
 */
export function getApiBaseUrl(): string {
  return getEnvVar('API_BASE_URL');
}

/**
 * The standardized API base URL constant used across all projects.
 * This is the single source of truth for the API endpoint URL.
 */
export const API_BASE_URL = getApiBaseUrl();

// File History Configuration constants from environment variables
export const FILE_HISTORY_METADATA_FILE_NAME = getEnvVar(
  'FILE_HISTORY_METADATA_FILE_NAME',
);
export const FILE_HISTORY_STORAGE_DIR = getEnvVar('FILE_HISTORY_STORAGE_DIR');
export const FILE_HISTORY_UPLOADS_DIR = getEnvVar('FILE_HISTORY_UPLOADS_DIR');
export const FILE_HISTORY_CACHE_TTL = Number(
  getEnvVar('FILE_HISTORY_CACHE_TTL'),
);
export const FILE_HISTORY_DEFAULT_PAGE_SIZE = Number(
  getEnvVar('FILE_HISTORY_DEFAULT_PAGE_SIZE'),
);
export const FILE_HISTORY_MAX_PAGE_SIZE = Number(
  getEnvVar('FILE_HISTORY_MAX_PAGE_SIZE'),
);

// Upload Service Configuration constants from environment variables
export const UPLOAD_METADATA_STORAGE_DIR = getEnvVar(
  'UPLOAD_METADATA_STORAGE_DIR',
);
