// Caminho relativo ao projeto: src/app.controller.ts
import { Controller, Get, Logger, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Response } from 'express';
import { AUTHORIZED_DOMAINS } from './config';
import { DomainsResponse } from './types/domain.types';

@Controller()
@ApiTags('app')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck() {
    const method = 'healthCheck';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      const result = this.appService.healthCheck();
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultType: typeof result }`,
      );
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }

  @Get('config')
  getConfig() {
    const method = 'getConfig';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      // Usar credenciais das variáveis de ambiente
      const clientId = process.env.GOOGLE_CLIENT_ID;

      // Parse allowed origins from environment variable
      const allowedOriginsStr =
        process.env.AUTHORIZED_DOMAINS || process.env.ALLOWED_ORIGINS;
      let allowedOrigins: string[] = [];

      if (allowedOriginsStr) {
        try {
          // Try parsing as JSON array first
          allowedOrigins = JSON.parse(allowedOriginsStr);
        } catch {
          // If not JSON, split by comma
          allowedOrigins = allowedOriginsStr
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
        }
      }

      this.logger.log(
        `${method} GOOGLE_CLIENT_ID from env: ${clientId ? clientId.substring(0, 20) + '...' : 'undefined'}`,
      );
      this.logger.log(
        `${method} ALLOWED_ORIGINS: [${allowedOrigins.join(', ')}]`,
      );

      const result = {
        googleClientId: clientId || null,
        allowedOrigins: allowedOrigins,
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, hasClientId: !!result.googleClientId, originsCount: ${result.allowedOrigins.length} }`,
      );
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }

  @Get('debug/env')
  getDebugEnv() {
    const method = 'getDebugEnv';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      const result = {
        nodeEnv: process.env.NODE_ENV,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasGoogleRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
        hasGoogleRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
        hasOpenRouterApiKey: !!process.env.OPENROUTER_API_KEY,
        timestamp: new Date().toISOString(),
      };

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: dt }`);
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }

  @Get('setup-instructions')
  getSetupInstructions(@Res() res: Response) {
    const method = 'getSetupInstructions';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      res.redirect('/setup-instructions.html');
      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: dt }`);
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }

  @Get('domain')
  @ApiOperation({
    summary: 'Lista domínios corporativos autorizados',
    description:
      'Retorna a lista de domínios autorizados para uso com a extensão Chrome',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de domínios retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        domains: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              domain: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              active: { type: 'boolean' },
              type: {
                type: 'string',
                enum: ['corporate', 'development', 'test'],
              },
            },
          },
        },
        total: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getDomains(): DomainsResponse {
    const method = 'getDomains';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      // Filtrar apenas domínios ativos
      const activeDomains = AUTHORIZED_DOMAINS.filter(
        (domain) => domain.active,
      );

      const result: DomainsResponse = {
        domains: activeDomains,
        total: activeDomains.length,
        timestamp: new Date().toISOString(),
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, totalDomains: ${result.total} }`,
      );
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }
}
