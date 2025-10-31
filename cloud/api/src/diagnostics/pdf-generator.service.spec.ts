// src/diagnostics/pdf-generator.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Mock das funções do fs
jest.mock('fs/promises');
jest.mock('fs');

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDiagnosticPdf', () => {
    let createPdfSpy: jest.SpyInstance;

    beforeEach(() => {
      createPdfSpy = jest
        .spyOn(service as any, 'createPdfFromDiagnosis')
        .mockResolvedValue(undefined);
    });

    afterEach(() => {
      createPdfSpy.mockRestore();
    });

    it('should generate PDF with dynamic filename', async () => {
      const mockExistsSync = existsSync as jest.MockedFunction<
        typeof existsSync
      >;
      const mockMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
      const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

      mockExistsSync.mockReturnValue(false);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const diagnosis = 'Análise: Arquivo PDF com conteúdo técnico.';
      const filename = 'document.pdf';
      const mockOriginalFile = { originalname: filename };
      const customBaseUrl = 'https://example.com';

      const result = await service.generateDiagnosticPdf(
        diagnosis,
        mockOriginalFile,
        { baseUrl: customBaseUrl },
      );

      // Verificar se o diretório foi criado
      expect(mockMkdir).toHaveBeenCalledWith('public', { recursive: true });

      // Verificar se os arquivos foram escritos
      expect(mockWriteFile).toHaveBeenCalledTimes(1); // HTML
      expect(createPdfSpy).toHaveBeenCalledTimes(1);

      // Verificar se a URL retornada tem o formato correto
      expect(result).toMatch(/^https:\/\/example.com\/relatorio-\d+\.pdf$/);
    });

    it('should handle existing public directory', async () => {
      const mockExistsSync = existsSync as jest.MockedFunction<
        typeof existsSync
      >;
      const mockMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
      const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

      mockExistsSync.mockReturnValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      const diagnosis = 'Análise: Arquivo PDF com conteúdo técnico.';
      const filename = 'document.pdf';
      const mockOriginalFile = { originalname: filename };

      const result = await service.generateDiagnosticPdf(
        diagnosis,
        mockOriginalFile,
      );

      // Verificar que mkdir não foi chamado
      expect(mockMkdir).not.toHaveBeenCalled();

      // Verificar se os arquivos foram escritos
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(createPdfSpy).toHaveBeenCalledTimes(1);

      // Verificar se a URL retornada tem o formato correto
      expect(result).toMatch(/^http:\/\/localhost:3333\/relatorio-\d+\.pdf$/);
    });

    it('should handle write file error gracefully', async () => {
      const mockExistsSync = existsSync as jest.MockedFunction<
        typeof existsSync
      >;
      const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

      mockExistsSync.mockReturnValue(true);
      mockWriteFile.mockRejectedValue(new Error('Write error'));

      const diagnosis = 'Análise: Arquivo PDF com conteúdo técnico.';
      const filename = 'document.pdf';
      const mockOriginalFile = { originalname: filename };

      const result = await service.generateDiagnosticPdf(
        diagnosis,
        mockOriginalFile,
      );

      // Verificar que retorna URL padrão em caso de erro
      expect(result).toBe('http://localhost:3333/relatorio.pdf');
    });

    it('should generate HTML content with correct structure', async () => {
      const mockExistsSync = existsSync as jest.MockedFunction<
        typeof existsSync
      >;
      const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

      mockExistsSync.mockReturnValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      const diagnosis =
        'Análise: Arquivo PDF com conteúdo técnico.\nSegunda linha.';
      const filename = 'document.pdf';
      const mockOriginalFile = { originalname: filename };

      await service.generateDiagnosticPdf(diagnosis, mockOriginalFile);

      // Verificar se o HTML foi gerado com o conteúdo correto
      const htmlCall = mockWriteFile.mock.calls.find((call) =>
        call[0].toString().includes('.html'),
      );

      expect(htmlCall).toBeDefined();
      if (htmlCall) {
        const htmlContent = htmlCall[1] as string;

        expect(htmlContent).toContain('Relatório de Análise');
        expect(htmlContent).toContain('document.pdf');
        expect(htmlContent).toContain(
          'Análise: Arquivo PDF com conteúdo técnico.',
        );
        expect(htmlContent).toContain('<br>'); // Quebras de linha convertidas
      }
    });

    it('should escape HTML in diagnosis', async () => {
      const mockExistsSync = existsSync as jest.MockedFunction<
        typeof existsSync
      >;
      const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

      mockExistsSync.mockReturnValue(true);
      mockWriteFile.mockResolvedValue(undefined);

      const diagnosis = '<script>alert("x")</script>\nLine & more';
      const filename = 'document.pdf';
      const mockOriginalFile = { originalname: filename };

      await service.generateDiagnosticPdf(diagnosis, mockOriginalFile);

      const htmlCall = mockWriteFile.mock.calls.find((call) =>
        call[0].toString().includes('.html'),
      );

      expect(htmlCall).toBeDefined();
      if (htmlCall) {
        const htmlContent = htmlCall[1] as string;
        expect(htmlContent).toContain(
          '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>Line &amp; more',
        );
        expect(htmlContent).not.toContain('<script>');
      }
    });
  });
});
