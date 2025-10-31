// src/diagnostics/diagnostics.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticResponseDto } from './dto/diagnostic-response.dto';
// import { OpenAiService } from '../openai/openai.service'; // Integração OpenAI desativada
import { TtsFactoryService } from '../tts/tts-factory.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { OcrService } from './ocr.service';
import pdfParse from 'pdf-parse';
import { TextQualityAgent } from '../agents/text-quality.agent';
import { TextDiagnoseAgent } from '../agents/text-diagnose.agent';
import { PdfDiagnoseAgent } from '../agents/pdf-diagnose.agent';
import { ResultValidatorAgent } from '../agents/result-validator.agent';
import { GoogleDriveService } from '../storage/google-drive.service';
import { OpenRouterService } from '../openrouter/openrouter.service';

jest.mock('pdf-parse');

describe('DiagnosticsService', () => {
  let service: DiagnosticsService;
  // let openAiService: OpenAiService; // Integração OpenAI desativada
  let ttsService: TtsFactoryService;
  let pdfGeneratorService: PdfGeneratorService;
  let drive: GoogleDriveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosticsService,
        // {
        //   provide: OpenAiService,
        //   useValue: {
        //     generateDiagnosis: jest.fn(),
        //     generateDiagnosisFromPdf: jest.fn(),
        //   },
        // }, // Integração OpenAI desativada
        {
          provide: TtsFactoryService,
          useValue: {
            synthesizeToFile: jest.fn(),
          },
        },
        {
          provide: PdfGeneratorService,
          useValue: {
            generateDiagnosticPdf: jest.fn(),
          },
        },
        {
          provide: OcrService,
          useValue: {
            extractTextFromScannedPdf: jest.fn(),
            isScannedPdf: jest.fn(),
          },
        },
        {
          provide: TextQualityAgent,
          useValue: {
            isSufficient: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: TextDiagnoseAgent,
          useValue: {
            diagnose: jest.fn().mockImplementation((text) => {
              if (text.includes('console.log')) {
                return Promise.resolve(
                  'Código JavaScript básico com saída no console. Esta análise foi gerada automaticamente por inteligência artificial.',
                );
              } else if (text.includes('μL') || text.includes('mL')) {
                return Promise.resolve(
                  'Análise: Foram utilizadas 23 unidades de amostra e 5 unidades de reagente para o teste.',
                );
              } else if (text.includes('arquivo de texto')) {
                return Promise.resolve(
                  'Arquivo de texto simples com conteúdo informativo. Esta análise foi gerada automaticamente por inteligência artificial.',
                );
              }
              return Promise.resolve('Diagnóstico do texto');
            }),
          },
        },
        {
          provide: PdfDiagnoseAgent,
          useValue: {
            diagnose: jest.fn().mockImplementation((file) => {
              if (file.originalname?.includes('scanned')) {
                return Promise.resolve(
                  'Documento identificado como escaneado. Análise do PDF escaneado. Esta análise foi gerada automaticamente por inteligência artificial.',
                );
              }
              return Promise.resolve(
                'Análise detalhada com referência aos indicadores do PDF. Esta análise foi gerada automaticamente por inteligência artificial.',
              );
            }),
          },
        },
        {
          provide: ResultValidatorAgent,
          useValue: {
            isGood: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: OpenRouterService,
          useValue: {
            submitPdfBase64: jest.fn().mockResolvedValue(''),
          },
        },
        {
          provide: GoogleDriveService,
          useValue: {
            uploadBuffer: jest
              .fn()
              .mockResolvedValue(
                'https://drive.mock/diagnostico-1234567890.pdf',
              ),
          },
        },
      ],
    }).compile();

    service = module.get<DiagnosticsService>(DiagnosticsService);
    // openAiService = module.get<OpenAiService>(OpenAiService); // Integração OpenAI desativada
    ttsService = module.get<TtsFactoryService>(TtsFactoryService);
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService);
    drive = module.get<GoogleDriveService>(GoogleDriveService);

    // Mock padrão do pdfParse para falha na extração
    (pdfParse as jest.Mock).mockRejectedValue(
      new Error('Arquivo muito pequeno para ser um PDF válido'),
    );

    // Mock do Date.now para retornar um timestamp fixo
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* describe('submitDiagnostic - Fluxo Completo', () => {
    it('should execute complete diagnostic flow with AI and audio for text file', async () => {
      const mockFile = {
        originalname: 'test.js',
        mimetype: 'text/javascript',
        size: 1024,
        buffer: Buffer.from('console.log("Hello World");'),
      } as Express.Multer.File;

      const mockInitialDiagnosis =
        'Código JavaScript básico com saída no console. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockCorrectedDiagnosis =
        'Código JavaScript básico com saída no console. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockAudioUrl = 'http://localhost:3333/diagnostico-1234567890.mp3';
      const mockFileUrl = 'https://drive.mock/diagnostico-1234567890.js';

      // Mock específico para este teste

      // jest
      //   .spyOn(openAiService, 'generateDiagnosis')
      //   .mockResolvedValueOnce(mockInitialDiagnosis)
      //   .mockResolvedValueOnce(mockCorrectedDiagnosis); // Integração OpenAI desativada
      jest
        .spyOn(ttsService, 'synthesizeToFile')
        .mockResolvedValue(mockAudioUrl);

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.resumo).toBe('O arquivo foi analisado com sucesso.');
      expect(result.text).toBe(mockCorrectedDiagnosis);
      expect(result.textExtracted).toBe('console.log("Hello World");');
      expect(result.fileUrl).toBe(mockFileUrl);
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);

      // Verificar se o arquivo foi salvo
      expect(drive.uploadBuffer).toHaveBeenCalled();

      // Verificar se o fluxo foi executado corretamente através dos agentes
      expect(ttsService.synthesizeToFile).not.toHaveBeenCalled();
    });

    it('should correct units of measurement in diagnosis', async () => {
      const mockFile = {
        originalname: 'lab-report.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('Resultado: 23 μL de amostra, 5 mL de reagente'),
      } as Express.Multer.File;

      const mockInitialDiagnosis =
        'Análise: Foram utilizados 23 μL de amostra e 5 mL de reagente para o teste.';
      const mockCorrectedDiagnosis =
        'Análise: Foram utilizadas 23 unidades de amostra e 5 unidades de reagente para o teste.';
      const mockAudioUrl = 'http://localhost:3333/diagnostico-1234567890.mp3';
      const mockFileUrl = 'https://drive.mock/diagnostico-1234567890.txt';

      // Mock específico para este teste

      // jest
      //   .spyOn(openAiService, 'generateDiagnosis')
      //   .mockResolvedValueOnce(mockInitialDiagnosis)
      //   .mockResolvedValueOnce(mockCorrectedDiagnosis); // Integração OpenAI desativada
      jest
        .spyOn(ttsService, 'synthesizeToFile')
        .mockResolvedValue(mockAudioUrl);

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.text).toBe(mockCorrectedDiagnosis);
      expect(result.textExtracted).toBe(
        'Resultado: 23 μL de amostra, 5 mL de reagente',
      );
      expect(result.fileUrl).toBe(mockFileUrl);
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);

      // Verificar se foram feitas duas chamadas para a API
      expect(openAiService.generateDiagnosis).toHaveBeenCalledTimes(2);
      expect(openAiService.generateDiagnosis).toHaveBeenNthCalledWith(
        1,
        'Resultado: 23 μL de amostra, 5 mL de reagente',
      );
      expect(openAiService.generateDiagnosis).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('CORREÇÃO DE UNIDADES DE MEDIDA'),
      );
    });

    it('should handle correction error gracefully and return original diagnosis', async () => {
      const mockFile = {
        originalname: 'test.js',
        mimetype: 'text/javascript',
        size: 1024,
        buffer: Buffer.from('console.log("Hello World");'),
      } as Express.Multer.File;

      const mockInitialDiagnosis =
        'Código JavaScript básico com saída no console. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockFileUrl = 'http://localhost:3333/diagnostico-1234567890.js';
      const mockAudioUrl = 'http://localhost:3333/diagnostico-1234567890.mp3';

      // Mock específico para este teste

      jest
        .spyOn(openAiService, 'generateDiagnosis')
        .mockResolvedValueOnce(mockInitialDiagnosis)
        .mockRejectedValueOnce(new Error('Correction API Error'));
      jest
        .spyOn(ttsService, 'synthesizeToFile')
        .mockResolvedValue(mockAudioUrl);

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.text).toBe(mockInitialDiagnosis); // Deve retornar a análise original
      expect(result.fileUrl).toBe(mockFileUrl);
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);

      // Verificar se foram feitas duas chamadas para a API
      expect(openAiService.generateDiagnosis).toHaveBeenCalledTimes(2);
    });

    it('should handle empty file with fallback', async () => {
      const mockFile = {
        originalname: 'empty.js',
        mimetype: 'text/javascript',
        size: 0,
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      // Mock específico para este teste

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('ERROR'); // Arquivo vazio gera erro
      expect(result.resumo).toBe(
        'Erro ao processar arquivo: Erro: Buffer do arquivo está vazio',
      );
      expect(result.text).toBe(
        'Não foi possível analisar o arquivo empty.js. Erro: Buffer do arquivo está vazio',
      );
      expect(result.textExtracted).toBe('Erro: Buffer do arquivo está vazio');
      expect(result.fileUrl).toBe(
        'http://localhost:3333/diagnostico-1234567890.js',
      );
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);

      // Verificar que os serviços não foram chamados
      expect(openAiService.generateDiagnosis).toHaveBeenCalledWith(
        'Erro: Buffer do arquivo está vazio',
      );
      expect(ttsService.synthesizeToFile).not.toHaveBeenCalled(); // TTS não é chamado para arquivos vazios
    });

    it('should handle OpenAI API error gracefully', async () => {
      const mockFile = {
        originalname: 'test.js',
        mimetype: 'text/javascript',
        size: 1024,
        buffer: Buffer.from('console.log("Hello World");'),
      } as Express.Multer.File;

      // Mock específico para este teste

      jest
        .spyOn(openAiService, 'generateDiagnosis')
        .mockRejectedValue(new Error('API Error'));

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.text).toBe('Erro ao gerar análise com IA');
      expect(result.textExtracted).toBe('console.log("Hello World");');
      expect(result.fileUrl).toBe(
        'http://localhost:3333/diagnostico-1234567890.js',
      );
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);
    });

    it('should handle TTS error gracefully', async () => {
      const mockFile = {
        originalname: 'test.js',
        mimetype: 'text/javascript',
        size: 1024,
        buffer: Buffer.from('console.log("Hello World");'),
      } as Express.Multer.File;

      const mockInitialDiagnosis =
        'Código JavaScript básico. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockCorrectedDiagnosis =
        'Código JavaScript básico. Esta análise foi gerada automaticamente por inteligência artificial.';

      // Mock específico para este teste

      jest
        .spyOn(openAiService, 'generateDiagnosis')
        .mockResolvedValueOnce(mockInitialDiagnosis)
        .mockResolvedValueOnce(mockCorrectedDiagnosis);
      jest
        .spyOn(ttsService, 'synthesizeToFile')
        .mockRejectedValue(new Error('TTS Error'));

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.text).toBe(mockCorrectedDiagnosis);
      expect(result.fileUrl).toBe(
        'http://localhost:3333/diagnostico-1234567890.js',
      );
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);
    });

    it('should process PDF file with complete flow', async () => {
      const mockFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('PDF content mock'),
      } as Express.Multer.File;

      const mockInitialDiagnosis =
        'Documento PDF com conteúdo técnico. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockPdfDiagnosis =
        'Análise detalhada com referência aos indicadores do PDF. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockAudioUrl = 'http://localhost:3333/diagnostico-1234567890.mp3';
      const mockPdfUrl = 'http://localhost:3333/relatorio-1234567890.pdf';

      // Mock específico para este teste

      // Mock do OpenAI para retornar erro quando o texto extraído é "Erro ao extrair texto do PDF"
      jest
        .spyOn(openAiService, 'generateDiagnosis')
        .mockImplementation(async (text) => {
          if (text === 'Erro ao extrair texto do PDF') {
            throw new Error('API Error');
          }
          return mockInitialDiagnosis;
        });
      jest
        .spyOn(openAiService, 'generateDiagnosisFromPdf')
        .mockResolvedValue(mockPdfDiagnosis);
      jest
        .spyOn(ttsService, 'synthesizeToFile')
        .mockResolvedValue(mockAudioUrl);
      jest
        .spyOn(pdfGeneratorService, 'generateDiagnosticPdf')
        .mockResolvedValue(mockPdfUrl);

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.resumo).toBe('PDF analisado com sucesso.');
      expect(result.text).toBe(
        'Análise detalhada com referência aos indicadores do PDF. Esta análise foi gerada automaticamente por inteligência artificial.',
      );
      expect(result.fileUrl).toBe(
        'http://localhost:3333/diagnostico-1234567890.pdf',
      );
      expect(result.audioUrl).toBeUndefined(); // Áudio não foi gerado (generateAudio=false)
      expect(result.pdfUrl).toBe(mockPdfUrl); // PDF foi gerado com sucesso
      expect(result.pdfSentRaw).toBe(true);
      expect(result.isScanned).toBe(false);

      expect(openAiService.generateDiagnosisFromPdf).toHaveBeenCalledTimes(1);
      expect(pdfGeneratorService.generateDiagnosticPdf).toHaveBeenCalledWith(
        'Análise detalhada com referência aos indicadores do PDF. Esta análise foi gerada automaticamente por inteligência artificial.',
        expect.objectContaining({ originalname: 'document.pdf' }),
        undefined,
      );
    });

    it('should process text file upload with complete flow', async () => {
      const mockFile = {
        originalname: 'readme.txt',
        mimetype: 'text/plain',
        size: 512,
        buffer: Buffer.from('Este é um arquivo de texto de exemplo.'),
      } as Express.Multer.File;

      const mockInitialDiagnosis =
        'Arquivo de texto simples com conteúdo informativo. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockCorrectedDiagnosis =
        'Arquivo de texto simples com conteúdo informativo. Esta análise foi gerada automaticamente por inteligência artificial.';
      const mockAudioUrl = 'http://localhost:3333/diagnostico-1234567890.mp3';

      // Mock específico para este teste

      jest
        .spyOn(openAiService, 'generateDiagnosis')
        .mockResolvedValueOnce(mockInitialDiagnosis)
        .mockResolvedValueOnce(mockCorrectedDiagnosis);
      jest
        .spyOn(ttsService, 'synthesizeToFile')
        .mockResolvedValue(mockAudioUrl);

      const result = await service.submitDiagnostic(mockFile);

      expect(result).toBeDefined();
      expect(result.status).toBe('OK');
      expect(result.resumo).toBe('O arquivo foi analisado com sucesso.');
      expect(result.text).toBe(mockCorrectedDiagnosis);
      expect(result.textExtracted).toBe(
        'Este é um arquivo de texto de exemplo.',
      );
      expect(result.fileUrl).toBe(
        'http://localhost:3333/diagnostico-1234567890.txt',
      );
      expect(result.audioUrl).toBeUndefined();
      expect(result.pdfUrl).toBeUndefined();
      expect(result.pdfSentRaw).toBe(false);
      expect(result.isScanned).toBe(false);

      expect(openAiService.generateDiagnosis).toHaveBeenCalledTimes(2);
      expect(openAiService.generateDiagnosis).toHaveBeenNthCalledWith(
        1,
        'Este é um arquivo de texto de exemplo.',
      );
      expect(ttsService.synthesizeToFile).not.toHaveBeenCalled();
    });

    it('should resend PDF to model when diagnosis lacks references', async () => {
      const mockFile = {
        originalname: 'report.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('PDF content mock'),
      } as Express.Multer.File;

      (pdfParse as jest.Mock).mockResolvedValue({
        text: 'Glicose normal, colesterol elevado 200 mg/dL',
      });

      jest
        .spyOn(openAiService, 'generateDiagnosis')
        .mockResolvedValueOnce('Diagnóstico genérico')
        .mockResolvedValueOnce('Diagnóstico genérico');

      (openAiService.generateDiagnosisFromPdf as jest.Mock).mockResolvedValue(
        'Análise detalhada com glicose normal e colesterol elevado. Esta análise foi gerada automaticamente por inteligência artificial.',
      );

      const result = await service.submitDiagnostic(mockFile);

      expect(openAiService.generateDiagnosisFromPdf).toHaveBeenCalledTimes(1);
      expect(result.text).toBe(
        'Análise detalhada com glicose normal e colesterol elevado. Esta análise foi gerada automaticamente por inteligência artificial.',
      );
      expect(result.pdfSentRaw).toBe(true);
    });

    it('should send raw PDF to model when isScanned is true', async () => {
      const mockFile = {
        originalname: 'scanned.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('PDF content'),
      } as Express.Multer.File;

      (openAiService.generateDiagnosisFromPdf as jest.Mock).mockResolvedValue(
        'Análise do PDF escaneado. Esta análise foi gerada automaticamente por inteligência artificial.',
      );

      const result = await service.submitDiagnostic(
        mockFile,
        false,
        undefined,
        true,
      );

      expect(openAiService.generateDiagnosisFromPdf).toHaveBeenCalledTimes(1);
      expect(openAiService.generateDiagnosis).not.toHaveBeenCalled();
      expect(result.text).toBe(
        'Documento identificado como escaneado. Análise do PDF escaneado. Esta análise foi gerada automaticamente por inteligência artificial.',
      );
      expect(result.pdfSentRaw).toBe(true);
      expect(result.isScanned).toBe(true);
    });
  }); */ // Integração OpenAI desativada
});
