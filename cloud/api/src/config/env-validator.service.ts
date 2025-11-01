import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvValidatorService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Aguardar um pouco para garantir que todas as configurações foram carregadas
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    console.log('🔍 Validando configuração de ambiente...');

    const missing: string[] = [];
    const warnings: string[] = [];

    // Verificar variáveis obrigatórias
    const requiredVars = [
      'OPENROUTER_API_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI',
    ];

    requiredVars.forEach((key) => {
      if (!this.configService.get(`env.${this.getConfigKey(key)}`)) {
        missing.push(key);
      }
    });

    // Verificar variáveis importantes com avisos
    const importantVars = [
      'GOOGLE_APPLICATION_CREDENTIALS',
      'GOOGLE_REFRESH_TOKEN',
    ];

    importantVars.forEach((key) => {
      if (!this.configService.get(`env.${this.getConfigKey(key)}`)) {
        warnings.push(key);
      }
    });

    // Exibir resultados
    if (missing.length > 0) {
      console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
      missing.forEach((key) => console.error(`   - ${key}`));
      throw new Error('Variáveis de ambiente obrigatórias não definidas');
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Variáveis importantes não definidas:');
      warnings.forEach((key) => console.warn(`   - ${key}`));
    }

    // Verificar configurações específicas
    this.validateGoogleCredentials();
    this.validateRateLimiting();

    console.log('✅ Validação de ambiente concluída com sucesso!');
  }

  private getConfigKey(envKey: string): string {
    const mapping: Record<string, string> = {
      OPENROUTER_API_KEY: 'openrouterApiKey',
      GOOGLE_CLIENT_ID: 'googleClientId',
      GOOGLE_CLIENT_SECRET: 'googleClientSecret',
      GOOGLE_REDIRECT_URI: 'googleRedirectUri',
      GOOGLE_APPLICATION_CREDENTIALS: 'googleApplicationCredentials',
      GOOGLE_REFRESH_TOKEN: 'googleRefreshToken',
    };

    return mapping[envKey] || envKey.toLowerCase();
  }

  private validateGoogleCredentials(): void {
    const credentialsPath = this.configService.get(
      'env.googleApplicationCredentials',
    );

    if (credentialsPath) {
      try {
        const fs = require('fs');
        if (fs.existsSync(credentialsPath)) {
          console.log(
            '✅ Arquivo de credenciais Google encontrado:',
            credentialsPath,
          );
        } else {
          console.warn(
            '⚠️  Arquivo de credenciais Google não encontrado:',
            credentialsPath,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(
          '⚠️  Erro ao verificar arquivo de credenciais Google:',
          errorMessage,
        );
      }
    }
  }

  private validateRateLimiting(): void {
    const llmLimit = this.configService.get('env.nginxRateLimitLlm');
    const generalLimit = this.configService.get('env.nginxRateLimitGeneral');

    console.log('📊 Rate Limiting configurado:');
    console.log(`   - LLM: ${llmLimit}`);
    console.log(`   - Geral: ${generalLimit}`);
  }
}
