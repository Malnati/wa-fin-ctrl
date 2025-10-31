// Caminho relativo ao projeto: src/tts/tts.service.ts
import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { API_BASE_URL } from '../constants/constants';

const LOCAL_BASE_URL = `${API_BASE_URL}/`;

@Injectable()
export class ElevenLabsTtsService {
  private readonly logger = new Logger(ElevenLabsTtsService.name);
  private readonly apiKey: string;
  private readonly voiceId: string;
  private readonly modelId = 'eleven_multilingual_v2';

  // Allow-list of valid voice IDs
  private static readonly VALID_VOICE_IDS = [
    '7s3YtmzXx3fjwUtedUN0', // Brasileira Helena (padrão)
    'uOjV7aFQoCQBSZxYyOds', // Brasileiro Joel (português)
  ];

  constructor() {
    const apiKey = process.env.TTS_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new Error('TTS_PROVIDER_API_KEY não está configurada no ambiente');
    }
    this.apiKey = apiKey;

    // Usar voz Brasileiro Joel (português) por padrão, mas permitir configuração via variável de ambiente
    const envVoiceId =
      process.env.ELEVENLABS_VOICE_ID || 'uOjV7aFQoCQBSZxYyOds';

    // SSRF Mitigation: Only allow known voice IDs
    if (!ElevenLabsTtsService.VALID_VOICE_IDS.includes(envVoiceId)) {
      throw new Error('ELEVENLABS_VOICE_ID inválido ou não permitido');
    }
    this.voiceId = envVoiceId;
  }

  async synthesizeToFile(text: string, voiceID?: string): Promise<string> {
    const method = 'synthesizeToFile';
    const t0 = Date.now();

    // eslint-disable-next-line prettier/prettier
    this.logger.log(
      `${method} ENTER, textLength: ${text?.length}, voiceID: ${voiceID}, defaultVoiceId: ${this.voiceId}`,
    );

    let responseData = undefined;

    try {
      if (!text || text.trim().length === 0) {
        const dt = Date.now() - t0;
        this.logger.error(
          `${method} ERROR, { durationMs: ${dt}, error: 'Texto não pode estar vazio', solution: 'forneça texto para síntese' }`,
        );
        throw new Error('Texto não pode estar vazio');
      }

      // Usar voiceID fornecido ou o padrão da classe
      let finalVoiceID = this.voiceId;

      // SSRF Mitigation: Validate voiceID parameter against allow-list if provided
      if (voiceID) {
        if (!ElevenLabsTtsService.VALID_VOICE_IDS.includes(voiceID)) {
          const dt = Date.now() - t0;
          this.logger.error(
            `${method} ERROR, { durationMs: ${dt}, error: 'VoiceID ${voiceID} inválido ou não permitido', solution: 'utilize um ID presente na lista de vozes permitidas' }`,
          );
          throw new Error(`VoiceID ${voiceID} inválido ou não permitido`);
        }
        finalVoiceID = voiceID;
      }

      const timestamp = Date.now();
      const fileName = `diagnostico-${timestamp}.mp3`;
      const publicDir = 'public';
      const filePath = join(publicDir, fileName);

      // Criar diretório public se não existir
      if (!existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
      }
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceID}`;
      this.logger.log(`${method}: enviando requisição para ElevenLabs ${url}`);
      // Chamada à API ElevenLabs
      const response = await axios.post(
        url,
        {
          text: text.trim(),
          model_id: this.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.7,
          },
          // Configuração para português brasileiro
          model_settings: {
            language: 'pt-BR',
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30 segundos de timeout
        },
      );
      responseData = response.data;
      await writeFile(filePath, responseData);
      this.logger.log(`${method}: áudio gerado com sucesso ${fileName}`);

      const result = `${LOCAL_BASE_URL}${fileName}`;
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, result: ${result}, savedPath: ${filePath}, voiceID: ${finalVoiceID} }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: falha ao gerar áudio com ElevenLabs. Causa: API indisponível ou parâmetros inválidos. Solução: verifique chave e conectividade. durationMs=${dt} ERROR: ${JSON.stringify(error)} Response: ${responseData}`,
        error instanceof Error ? error : new Error(String(error)),
      );

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // eslint-disable-next-line prettier/prettier
          throw new Error(
            `Chave da API ElevenLabs inválida [401 Unauthorized] ${this.apiKey}, verifique o crédito da sua conta na ElevenLabs.`,
          );
        } else if (error.response?.status === 429) {
          // eslint-disable-next-line prettier/prettier
          throw new Error(
            `Limite de requisições da API ElevenLabs excedido [429 Too Many Requests] ${this.apiKey}`,
          );
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout na requisição para ElevenLabs');
        }
      }

      throw new Error(
        `Erro ao gerar áudio: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
