// api/src/config/env.config.ts
import { registerAs } from '@nestjs/config';

// Environment variable utility function for required variables
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

// Utility for optional environment variables with explicit typing
function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

export default registerAs('env', () => ({
  // Configurações básicas
  port: parseInt(getEnvVar('PORT'), 10),
  nodeEnv: getEnvVar('NODE_ENV'),
  authorizedDomains: getOptionalEnvVar('AUTHORIZED_DOMAINS'),

  // OpenRouter Configuration
  openrouterApiKey: getOptionalEnvVar('OPENROUTER_API_KEY'),
  openrouterPdfModel: getEnvVar('OPENROUTER_PDF_MODEL'),
  openrouterPdfEngine: getEnvVar('OPENROUTER_PDF_ENGINE'),
  openrouterBaseUrl: getEnvVar('OPENROUTER_BASE_URL'),
  openrouterCookie: getOptionalEnvVar('OPENROUTER_COOKIE'),
  openrouterHttpReferer: getOptionalEnvVar('OPENROUTER_HTTP_REFERER'),
  openrouterAppTitle: getOptionalEnvVar('OPENROUTER_APP_TITLE'),

  // OpenAI Configuration
  openaiApiKey: getOptionalEnvVar('OPENAI_API_KEY'),

  // Google Cloud Configuration
  googleApplicationCredentials: getOptionalEnvVar(
    'GOOGLE_APPLICATION_CREDENTIALS',
  ),
  googleClientId: getOptionalEnvVar('GOOGLE_CLIENT_ID'),
  googleClientSecret: getOptionalEnvVar('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: getOptionalEnvVar('GOOGLE_REDIRECT_URI'),
  googleRefreshToken: getOptionalEnvVar('GOOGLE_REFRESH_TOKEN'),
  googleDriveFolderId: getOptionalEnvVar('GOOGLE_DRIVE_FOLDER_ID'),

  // NGINX Configuration
  nginxPort: parseInt(getEnvVar('NGINX_PORT'), 10),
  nginxRateLimitLlm: getEnvVar('NGINX_RATE_LIMIT_LLM'),
  nginxBurstLlm: parseInt(getEnvVar('NGINX_BURST_LLM'), 10),
  nginxRateLimitGeneral: getEnvVar('NGINX_RATE_LIMIT_GENERAL'),
  nginxBurstGeneral: parseInt(getEnvVar('NGINX_BURST_GENERAL'), 10),

  // Rate Limiting
  openaiRateLimit: getEnvVar('OPENAI_RATE_LIMIT'),

  // Storage Configuration
  filesPublicUrl: getOptionalEnvVar('FILES_PUBLIC_URL'),

  // Docker Configuration
  diagnosticsApiInternalPort: parseInt(
    getEnvVar('DIAGNOSTICS_API_INTERNAL_PORT'),
    10,
  ),
}));
