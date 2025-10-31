// cloud/ui/src/constants/constants.ts

const API_URL_ENV_KEY = "VITE_API_URL" as const;
const UI_DOCUMENT_TITLE_VALUE =
  "WA Fin Ctrl — Relatórios Financeiros Processados";
const ERROR_ENVIRONMENT_VARIABLE_MESSAGE =
  "Variável de ambiente obrigatória ausente: ";

function getEnvVar(key: string): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`${ERROR_ENVIRONMENT_VARIABLE_MESSAGE}${key}`);
  }

  return value;
}

export const API_BASE_URL = getEnvVar(API_URL_ENV_KEY);
export const UI_DOCUMENT_TITLE = UI_DOCUMENT_TITLE_VALUE;

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
