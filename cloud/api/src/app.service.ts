// src/app.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  healthCheck() {
    const method = 'healthCheck';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      const result = { status: 'ok', timestamp: new Date().toISOString() };
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
}
