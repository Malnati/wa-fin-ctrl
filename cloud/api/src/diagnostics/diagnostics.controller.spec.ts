// src/diagnostics/diagnostics.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticResponseDto } from './dto/diagnostic-response.dto';
import { Request } from 'express';

describe('DiagnosticsController', () => {
  let controller: DiagnosticsController;
  let service: DiagnosticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosticsController],
      providers: [
        {
          provide: DiagnosticsService,
          useValue: {
            submitDiagnostic: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiagnosticsController>(DiagnosticsController);
    service = module.get<DiagnosticsService>(DiagnosticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submit', () => {
    it('should return diagnostic result for text file', async () => {
      const mockFile = {
        originalname: 'test.js',
        mimetype: 'text/javascript',
        size: 1024,
        buffer: Buffer.from('console.log("Hello World");'),
      } as Express.Multer.File;

      const expectedResult: DiagnosticResponseDto = {
        status: 'OK',
        resumo: 'O arquivo foi analisado com sucesso.',
        text: 'Análise simulado para test.js',
        textExtracted: 'console.log("Hello World");',
        fileUrl: 'http://localhost:3333/test-1234567890.js',
        audioUrl: 'http://localhost:3333/diagnostico-1234567890.mp3',
        isScanned: false,
      };

      jest.spyOn(service, 'submitDiagnostic').mockResolvedValue(expectedResult);

      const mockRequest = {
        get: jest.fn((header: string) =>
          header === 'host' ? 'localhost:3333' : undefined,
        ),
        protocol: 'http',
        headers: { host: 'localhost:3333' },
      } as unknown as Request;

      const result = await controller.submit(
        mockFile,
        undefined,
        undefined,
        mockRequest,
      );

      expect(result).toEqual(expectedResult);
      expect(service.submitDiagnostic).toHaveBeenCalledWith(
        mockFile,
        undefined,
        undefined,
        'http://localhost:3333',
      );
    });

    it('should return diagnostic result for PDF file', async () => {
      const mockFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('PDF content'),
      } as Express.Multer.File;

      const expectedResult: DiagnosticResponseDto = {
        status: 'OK',
        resumo: 'PDF analisado com sucesso.',
        text: 'Análise simulado para document.pdf',
        textExtracted: 'PDF content',
        fileUrl: 'http://localhost:3333/document-1234567890.pdf',
        audioUrl: 'http://localhost:3333/diagnostico-1234567890.mp3',
        pdfUrl: 'http://localhost:3333/relatorio-1234567890.pdf',
        isScanned: false,
      };

      jest.spyOn(service, 'submitDiagnostic').mockResolvedValue(expectedResult);

      const mockRequest = {
        get: jest.fn((header: string) =>
          header === 'host' ? 'localhost:3333' : undefined,
        ),
        protocol: 'http',
        headers: { host: 'localhost:3333' },
      } as unknown as Request;

      const result = await controller.submit(
        mockFile,
        undefined,
        undefined,
        mockRequest,
      );

      expect(result).toEqual(expectedResult);
      expect(service.submitDiagnostic).toHaveBeenCalledWith(
        mockFile,
        undefined,
        undefined,
        'http://localhost:3333',
      );
    });

    it('should handle empty file', async () => {
      const mockFile = {
        originalname: 'empty.txt',
        mimetype: 'text/plain',
        size: 0,
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const expectedResult: DiagnosticResponseDto = {
        status: 'OK',
        resumo: 'O arquivo foi analisado com sucesso.',
        text: 'Análise simulado para empty.txt',
        textExtracted: '',
        fileUrl: 'http://localhost:3333/empty-1234567890.txt',
        audioUrl: 'http://localhost:3333/audio.mp3',
        isScanned: false,
      };

      jest.spyOn(service, 'submitDiagnostic').mockResolvedValue(expectedResult);

      const mockRequest = {
        get: jest.fn((header: string) =>
          header === 'host' ? 'localhost:3333' : undefined,
        ),
        protocol: 'http',
        headers: { host: 'localhost:3333' },
      } as unknown as Request;

      const result = await controller.submit(
        mockFile,
        undefined,
        undefined,
        mockRequest,
      );

      expect(result).toEqual(expectedResult);
      expect(service.submitDiagnostic).toHaveBeenCalledWith(
        mockFile,
        undefined,
        undefined,
        'http://localhost:3333',
      );
    });

    it('should resolve base URL from forwarded headers', async () => {
      const mockFile = {
        originalname: 'forwarded.pdf',
        mimetype: 'application/pdf',
        size: 1234,
        buffer: Buffer.from('forwarded'),
      } as Express.Multer.File;

      const expectedResult: DiagnosticResponseDto = {
        status: 'OK',
        resumo: 'PDF analisado com sucesso.',
        text: 'Diagnóstico gerado com base em cabeçalhos encaminhados.',
        fileUrl: 'https://app.example.com/forwarded.pdf',
        pdfUrl: 'https://app.example.com/relatorio-123.pdf',
        pdfSentRaw: true,
      } as DiagnosticResponseDto;

      jest.spyOn(service, 'submitDiagnostic').mockResolvedValue(expectedResult);

      const mockRequest = {
        get: jest.fn((header: string) => {
          if (header === 'x-forwarded-proto') {
            return 'https';
          }
          if (header === 'x-forwarded-host') {
            return 'app.example.com';
          }
          if (header === 'host') {
            return 'localhost:3333';
          }
          return undefined;
        }),
        protocol: 'http',
        headers: { host: 'localhost:3333' },
      } as unknown as Request;

      const result = await controller.submit(
        mockFile,
        undefined,
        undefined,
        mockRequest,
      );

      expect(result).toEqual(expectedResult);
      expect(service.submitDiagnostic).toHaveBeenCalledWith(
        mockFile,
        undefined,
        undefined,
        'https://app.example.com',
      );
      expect(mockRequest.get).toHaveBeenCalledWith('x-forwarded-proto');
      expect(mockRequest.get).toHaveBeenCalledWith('x-forwarded-host');
    });
  });
});
