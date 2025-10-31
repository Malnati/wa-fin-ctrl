// src/tts/tts-factory.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { GcpTtsService } from './gcp-tts.service';
import { CoquiTtsService } from './coqui-tts.service';
import { ElevenLabsTtsService } from './tts.service';

@Injectable()
export class TtsFactoryService {
  private readonly logger = new Logger(TtsFactoryService.name);

  constructor(
    private readonly gcpService: GcpTtsService,
    private readonly coquiService: CoquiTtsService,
    private readonly elevenLabsService: ElevenLabsTtsService,
  ) {}

  private get provider(): string {
    return (process.env.TTS_PROVIDER || 'google').toLowerCase();
  }

  async synthesizeToFile(text: string, voiceID?: string): Promise<string> {
    const method = 'synthesizeToFile';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { textLength: text?.length, voiceID, provider: this.provider }`,
    );

    try {
      let result: string;

      switch (this.provider) {
        case 'coqui':
          result = await this.coquiService.synthesizeToFile(text);
          break;
        case 'elevenlabs':
          result = await this.elevenLabsService.synthesizeToFile(text, voiceID);
          break;
        case 'google':
        default:
          result = await this.gcpService.synthesizeToFile(text);
          break;
      }

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, result: result, provider: this.provider }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}, provider: ${this.provider}`,
      );
      throw error;
    }
  }
}
