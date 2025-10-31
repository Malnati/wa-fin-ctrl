import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticsService } from './diagnostics.service';
// import { OpenAiService } from '../openai/openai.service'; // Integração OpenAI desativada
import { TtsFactoryService } from '../tts/tts-factory.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { OcrService } from './ocr.service';
import { TextQualityAgent } from '../agents/text-quality.agent';
import { TextDiagnoseAgent } from '../agents/text-diagnose.agent';
import { PdfDiagnoseAgent } from '../agents/pdf-diagnose.agent';
import { ResultValidatorAgent } from '../agents/result-validator.agent';
import pdfParse from 'pdf-parse';
import { GoogleDriveService } from '../storage/google-drive.service';

jest.mock('pdf-parse');

/* describe('DiagnosticsService pre-diagnosis validation', () => {
  let service: DiagnosticsService;
  let openAiService: OpenAiService;
  let pdfGeneratorService: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosticsService,
        {
          provide: OpenAiService,
          useValue: {
            generateDiagnosis: jest.fn(),
            generateDiagnosisFromPdf: jest.fn(),
          },
        },
        {
          provide: TtsFactoryService,
          useValue: { synthesizeToFile: jest.fn() },
        },
        {
          provide: PdfGeneratorService,
          useValue: { generateDiagnosticPdf: jest.fn() },
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
            diagnose: jest.fn().mockResolvedValue('Diagnóstico do texto'),
          },
        },
        {
          provide: PdfDiagnoseAgent,
          useValue: {
            diagnose: jest.fn().mockResolvedValue('Diagnóstico do PDF'),
          },
        },
        {
          provide: ResultValidatorAgent,
          useValue: {
            isGood: jest.fn().mockReturnValue(true),
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
    openAiService = module.get<OpenAiService>(OpenAiService);
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService);
    (pdfParse as jest.Mock).mockResolvedValue({
      text: 'Hemoglobina 13 g/dL\nLeucocitos 5000',
    });
    (
      module.get<OcrService>(OcrService).isScannedPdf as jest.Mock
    ).mockResolvedValue(false);
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should resend PDF to LLM when pre-diagnosis is invalid', async () => {
    const mockFile = {
      originalname: 'report.pdf',
      mimetype: 'application/pdf',
      size: 2048,
      buffer: Buffer.from('PDFDATA'),
    } as Express.Multer.File;

    const badDiagnosis =
      'Este é um exemplo de análise feita por IA. O sistema analisou o conteúdo e identificou os seguintes pontos importantes.';
    const goodDiagnosis =
      'Hemoglobina 13 g/dL e Leucocitos 5000 estão dentro dos limites normais. Esta análise foi gerada automaticamente por inteligência artificial.';

    (openAiService.generateDiagnosis as jest.Mock)
      .mockResolvedValueOnce(badDiagnosis)
      .mockResolvedValueOnce(badDiagnosis);
    (openAiService.generateDiagnosisFromPdf as jest.Mock).mockResolvedValue(
      goodDiagnosis,
    );
    (pdfGeneratorService.generateDiagnosticPdf as jest.Mock).mockResolvedValue(
      'http://localhost:3333/diagnostico-1234567890.pdf',
    );

    const result = await service.submitDiagnostic(mockFile);

    expect(openAiService.generateDiagnosisFromPdf).toHaveBeenCalledTimes(1);
    expect(openAiService.generateDiagnosisFromPdf).toHaveBeenCalledWith(
      mockFile.buffer.toString('base64'),
    );
    expect(result.pdfSentRaw).toBe(true);
    expect(result.text).toBe(goodDiagnosis);
  });
}); */ // Integração OpenAI desativada
