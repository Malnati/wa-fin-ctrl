// src/tts/tts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ElevenLabsTtsService } from './tts.service';
import axios from 'axios';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock do fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

// Mock do fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('ElevenLabsTtsService', () => {
  let service: ElevenLabsTtsService;

  beforeEach(async () => {
    process.env.TTS_PROVIDER_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevenLabsTtsService],
    }).compile();

    service = module.get<ElevenLabsTtsService>(ElevenLabsTtsService);
  });

  afterEach(() => {
    delete process.env.TTS_PROVIDER_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('synthesizeToFile', () => {
    it('should generate audio file successfully', async () => {
      const testText = 'Este é um teste de síntese de voz.';
      const mockAudioBuffer = Buffer.from('mock audio data');

      // Mock da resposta da API ElevenLabs
      mockedAxios.post.mockResolvedValue({
        data: mockAudioBuffer,
      });

      // Mock do fs.existsSync para simular que o diretório existe
      const { existsSync } = require('fs');
      existsSync.mockReturnValue(true);

      const result = await service.synthesizeToFile(testText);

      expect(result).toMatch(/^http:\/\/localhost:3333\/diagnostico-\d+\.mp3$/);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/CstacWqMhJQlnfLPxRG4',
        {
          text: testText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.7,
          },
          model_settings: {
            language: 'pt-BR',
          },
        },
        {
          headers: {
            'xi-api-key': process.env.TTS_PROVIDER_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 30000,
        },
      );
    });

    it('should throw error on API failure', async () => {
      const testText = 'Este é um teste de síntese de voz.';

      // Mock de erro da API
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.synthesizeToFile(testText)).rejects.toThrow(
        'Erro ao gerar áudio: API Error',
      );
    });
  });
});
