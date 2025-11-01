// src/diagnostics/diagnostics-pre-diagnosis.spec.ts
import { DiagnosticsService } from './diagnostics.service';
// import { OpenAiService } from '../openai/openai.service'; // Integração OpenAI desativada
import { PdfGeneratorService } from './pdf-generator.service';
import { OcrService } from './ocr.service';
import { TextQualityAgent } from '../agents/text-quality.agent';
import { TextDiagnoseAgent } from '../agents/text-diagnose.agent';
import { PdfDiagnoseAgent } from '../agents/pdf-diagnose.agent';
import { ResultValidatorAgent } from '../agents/result-validator.agent';

/* describe('DiagnosticsService - Pre Diagnosis', () => {
  let service: DiagnosticsService;
  let openAiService: jest.Mocked<OpenAiService>;

  beforeEach(() => {
    openAiService = {
      generateDiagnosis: jest
        .fn()
        .mockResolvedValue('Este é um exemplo de análise...'),
      generateDiagnosisFromPdf: jest
        .fn()
        .mockResolvedValue('Diagnóstico válido do PDF.'),
    } as any;

    const ttsService = {} as TtsFactoryService;
    const pdfGeneratorService = {} as PdfGeneratorService;
    const ocrService = {} as OcrService;

    // Mock dos agentes
    const textQuality = {
      isSufficient: jest.fn().mockReturnValue(false), // Força uso do PDF
    } as any;

    const textDiag = {
      diagnose: jest.fn().mockResolvedValue('Diagnóstico do texto'),
    } as any;

    const pdfDiag = {
      diagnose: jest.fn().mockResolvedValue('Diagnóstico do PDF'),
    } as any;

    const validator = {
      isGood: jest.fn().mockReturnValue(false), // Força revalidação
    } as any;

    const drive = {
      uploadBuffer: jest.fn().mockResolvedValue('https://drive.mock/test.pdf'),
    } as any;

    service = new DiagnosticsService(
      openAiService,
      ttsService,
      pdfGeneratorService,
      ocrService,
      textQuality,
      textDiag,
      pdfDiag,
      validator,
      drive,
    );

    jest.spyOn<any, any>(service, 'saveOriginalFile').mockResolvedValue({
      url: 'https://drive.mock/test.pdf',
      name: 'test.pdf',
    });

    jest.spyOn<any, any>(service, 'extractTextFromFile').mockResolvedValue({
      extractedText: 'Resultados de glicose 123 e colesterol',
      filename: 'file.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      isScanned: false,
    });

    jest
      .spyOn<any, any>(service, 'generatePdf')
      .mockResolvedValue('http://localhost/generated.pdf');
  });

  it('should fall back to PDF analysis when pre-diagnosis is generic', async () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 150,
      buffer: Buffer.from('dummy'),
    } as Express.Multer.File;

    const result = await service.submitDiagnostic(mockFile);

    expect(result.pdfSentRaw).toBe(true);
    expect(result.text).toBe('Diagnóstico do PDF');
  });
}); */ // Integração OpenAI desativada
