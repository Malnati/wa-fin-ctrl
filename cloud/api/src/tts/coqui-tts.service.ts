// src/tts/coqui-tts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { API_BASE_URL } from '../constants/constants';

interface KVNamespace {
  put(key: string, value: any): Promise<any>;
}

@Injectable()
export class CoquiTtsService {
  private readonly logger = new Logger(CoquiTtsService.name);

  async synthesizeToFile(text: string): Promise<string> {
    const method = 'synthesizeToFile';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { textLength: text?.length }`);

    try {
      const timestamp = Date.now();
      const fileName = `diagnostico-coqui-${timestamp}.mp3`;

      // Simular geração de áudio (fallback para teste)
      // Em produção, instale o Coqui TTS com: pip install tts
      console.log(
        `[Coqui TTS] Gerando áudio para: "${text.substring(0, 50)}..."`,
      );

      // Criar um arquivo de áudio simulado (apenas para teste)
      const audioContent = Buffer.from('RIFF....WAVEfmt ', 'utf8'); // Header básico de WAV

      // TODO: Implementar upload para Google Drive quando necessário
      // Por enquanto, retorna um URL simulado
      console.log(`[Coqui TTS] Arquivo de áudio simulado criado: ${fileName}`);

      const baseUrl =
        process.env.FILES_PUBLIC_URL || process.env.BASE_URL || API_BASE_URL;
      const result = `${baseUrl}/${fileName}`;
      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: dt, result: result }`);
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      console.error('Erro ao gerar áudio com Coqui:', error);
      const baseUrl =
        process.env.FILES_PUBLIC_URL || process.env.BASE_URL || API_BASE_URL;
      return `${baseUrl}/audio.mp3`;
    }
  }
}
