// src/tts/elevenlabs-tts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ElevenLabsTtsService } from './tts.service';
import axios from 'axios';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Mock das dependências
jest.mock('axios');
jest.mock('fs/promises');
jest.mock('fs');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;
const mockMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

// Mock da função isAxiosError
(mockAxios.isAxiosError as any) = jest.fn();

describe('ElevenLabsTtsService', () => {
  let service: ElevenLabsTtsService;

  beforeEach(async () => {
    // Mock das variáveis de ambiente
    process.env.TTS_PROVIDER_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevenLabsTtsService],
    }).compile();

    service = module.get<ElevenLabsTtsService>(ElevenLabsTtsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.TTS_PROVIDER_API_KEY;
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve usar voz personalizada quando ELEVENLABS_VOICE_ID está configurada', async () => {
    // Configurar voz personalizada
    process.env.ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevenLabsTtsService],
    }).compile();

    const customService =
      module.get<ElevenLabsTtsService>(ElevenLabsTtsService);

    const mockAudioBuffer = Buffer.from('mock-audio-data');
    const mockResponse = { data: mockAudioBuffer };

    mockAxios.post.mockResolvedValue(mockResponse);
    mockExistsSync.mockReturnValue(true);
    mockWriteFile.mockResolvedValue(undefined);

    await customService.synthesizeToFile('Texto de teste');

    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        text: 'Texto de teste',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
        },
        model_settings: {
          language: 'pt-BR',
        },
      },
      expect.any(Object),
    );

    // Limpar variável de ambiente
    delete process.env.ELEVENLABS_VOICE_ID;
  });

  it('deve lançar erro se TTS_PROVIDER_API_KEY não estiver configurada', () => {
    delete process.env.TTS_PROVIDER_API_KEY;
    expect(() => new ElevenLabsTtsService()).toThrow(
      'TTS_PROVIDER_API_KEY não está configurada no ambiente',
    );
  });

  it('deve lançar erro se o texto estiver vazio', async () => {
    await expect(service.synthesizeToFile('')).rejects.toThrow(
      'Texto não pode estar vazio',
    );
    await expect(service.synthesizeToFile('   ')).rejects.toThrow(
      'Texto não pode estar vazio',
    );
  });

  it('deve gerar áudio com sucesso', async () => {
    const mockAudioBuffer = Buffer.from('mock-audio-data');
    const mockResponse = { data: mockAudioBuffer };

    mockAxios.post.mockResolvedValue(mockResponse);
    mockExistsSync.mockReturnValue(true);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await service.synthesizeToFile('Texto de teste');

    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://api.elevenlabs.io/v1/text-to-speech/CstacWqMhJQlnfLPxRG4',
      {
        text: 'Texto de teste',
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
          'xi-api-key': 'test-api-key',
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      },
    );

    expect(result).toMatch(/http:\/\/localhost:3333\/diagnostico-\d+\.mp3/);
  });

  it('deve criar diretório public se não existir', async () => {
    const mockAudioBuffer = Buffer.from('mock-audio-data');
    const mockResponse = { data: mockAudioBuffer };

    mockAxios.post.mockResolvedValue(mockResponse);
    mockExistsSync.mockReturnValue(false);
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    await service.synthesizeToFile('Texto de teste');

    expect(mockMkdir).toHaveBeenCalledWith('public', { recursive: true });
  });

  it('deve lançar erro para chave de API inválida', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 401 },
      message: 'Request failed with status code 401',
    };

    mockAxios.post.mockRejectedValue(mockError);
    mockAxios.isAxiosError.mockReturnValue(true);

    await expect(service.synthesizeToFile('Texto de teste')).rejects.toThrow(
      'Chave da API ElevenLabs inválida',
    );
  });

  it('deve lançar erro para limite de requisições excedido', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 429 },
      message: 'Request failed with status code 429',
    };

    mockAxios.post.mockRejectedValue(mockError);
    mockAxios.isAxiosError.mockReturnValue(true);

    await expect(service.synthesizeToFile('Texto de teste')).rejects.toThrow(
      'Limite de requisições da API ElevenLabs excedido',
    );
  });

  it('deve lançar erro para timeout', async () => {
    const mockError = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded',
    };

    mockAxios.post.mockRejectedValue(mockError);
    mockAxios.isAxiosError.mockReturnValue(true);

    await expect(service.synthesizeToFile('Texto de teste')).rejects.toThrow(
      'Timeout na requisição para ElevenLabs',
    );
  });

  // Security tests for SSRF vulnerability fix
  describe('Segurança SSRF', () => {
    it('deve aceitar voiceID válido da allow-list', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');
      const mockResponse = { data: mockAudioBuffer };

      mockAxios.post.mockResolvedValue(mockResponse);
      mockExistsSync.mockReturnValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      // Usar um voiceID válido da allow-list
      const result = await service.synthesizeToFile(
        'Texto de teste',
        '21m00Tcm4TlvDq8ikWAM',
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toMatch(/http:\/\/localhost:3333\/diagnostico-\d+\.mp3/);
    });

    it('deve rejeitar voiceID inválido para prevenir SSRF', async () => {
      const invalidVoiceId = 'malicious-voice-id';

      await expect(
        service.synthesizeToFile('Texto de teste', invalidVoiceId),
      ).rejects.toThrow('VoiceID inválido ou não permitido');

      // Verificar que nenhuma requisição HTTP foi feita
      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('deve rejeitar voiceID com caracteres suspeitos para prevenir SSRF', async () => {
      const maliciousVoiceIds = [
        '../../../etc/passwd',
        'http://malicious.com/endpoint',
        'localhost:8080/admin',
        '../../internal-service',
        'file:///etc/hosts',
      ];

      for (const maliciousId of maliciousVoiceIds) {
        await expect(
          service.synthesizeToFile('Texto de teste', maliciousId),
        ).rejects.toThrow('VoiceID inválido ou não permitido');
      }

      // Verificar que nenhuma requisição HTTP foi feita
      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('deve funcionar normalmente sem voiceID (usar padrão da classe)', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');
      const mockResponse = { data: mockAudioBuffer };

      mockAxios.post.mockResolvedValue(mockResponse);
      mockExistsSync.mockReturnValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.synthesizeToFile('Texto de teste');

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/CstacWqMhJQlnfLPxRG4',
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toMatch(/http:\/\/localhost:3333\/diagnostico-\d+\.mp3/);
    });
  });
});
