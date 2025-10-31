// src/config/api-key.validator.ts
export function validateApiKeys(): void {
  const missing: string[] = [];
  if (!process.env.OPENROUTER_API_KEY) {
    missing.push('OPENROUTER_API_KEY');
  }
  if (!process.env.TTS_PROVIDER_API_KEY) {
    missing.push('TTS_PROVIDER_API_KEY');
  }

  if (missing.length > 0) {
    console.error(
      `Erro: variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
    );
    process.exit(1);
  }
}
