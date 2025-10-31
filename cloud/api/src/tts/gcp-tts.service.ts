// src/tts/gcp-tts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { API_BASE_URL } from '../constants/constants';

@Injectable()
export class GcpTtsService {
  private readonly logger = new Logger(GcpTtsService.name);
  private readonly client = new TextToSpeechClient();

  async synthesizeToFile(text: string): Promise<string> {
    const method = 'synthesizeToFile';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { textLength: text?.length }`);

    try {
      const timestamp = Date.now();
      const fileName = `diagnostico-gcp-${timestamp}.mp3`;
      const publicDir = 'public';
      const filePath = join(publicDir, fileName);

      if (!existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
      }

      const [response] = await this.client.synthesizeSpeech({
        input: { text },
        voice: { languageCode: 'pt-BR' },
        audioConfig: { audioEncoding: 'MP3' },
      });

      await writeFile(filePath, response.audioContent as Buffer);

      const result = `${API_BASE_URL}/${fileName}`;
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, result: result, savedPath: filePath }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      console.error('Erro ao gerar áudio com GCP:', error);
      return `${API_BASE_URL}/audio.mp3`;
    }
  }
}
