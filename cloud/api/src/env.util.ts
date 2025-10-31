// src/env.util.ts

export function validateEnv(): void {
  const missing: string[] = [];

  if (!process.env.OPENROUTER_API_KEY) {
    missing.push('OPENROUTER_API_KEY');
  }

  const provider = (process.env.TTS_PROVIDER || 'google').toLowerCase();
  if (provider === 'google') {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      missing.push('GOOGLE_APPLICATION_CREDENTIALS');
    }
  } else if (provider === 'elevenlabs') {
    if (!process.env.TTS_PROVIDER_API_KEY) {
      missing.push('TTS_PROVIDER_API_KEY');
    }
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
