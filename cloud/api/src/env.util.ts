// src/env.util.ts

export function validateEnv(): void {
  const missing: string[] = [];

  if (!process.env.OPENROUTER_API_KEY) {
    missing.push('OPENROUTER_API_KEY');
  }

  [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_REFRESH_TOKEN',
  ].forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(
      `Erro: variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  console.log('✅ Validação de ambiente concluída.');
}
