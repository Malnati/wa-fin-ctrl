// test/e2e/diagnostics-flow.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { DiagnosticsService } from '../../src/diagnostics/diagnostics.service';
import { AgentsModule } from '../../src/agents/agents.module';
import { OpenAiService } from '../../src/openai/openai.service';
import { TtsFactoryService } from '../../src/tts/tts-factory.service';
import { PdfGeneratorService } from '../../src/diagnostics/pdf-generator.service';
import { OcrService } from '../../src/diagnostics/ocr.service';

class OpenAiServiceMock {
  generateDiagnosis = async (t: string) =>
    t.includes('fail')
      ? 'Análise realizada com sucesso. Este é um exemplo de demonstração.'
      : 'Observa-se "Hemoglobina 13.5 g/dL" com valores acima do esperado.';
  generateDiagnosisFromPdf = async (_b64: string) =>
    'Com base em "Leucócitos 12.1", há indício de processo infeccioso leve.';
}

class TtsFactoryServiceMock {}
class PdfGeneratorServiceMock {}
class OcrServiceMock {}

describe('E2E Diagnostics Flow', () => {
  it('usa texto quando suficiente e valida; se inválido ou insuficiente, cai para PDF', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AgentsModule],
      providers: [
        DiagnosticsService,
        { provide: TtsFactoryService, useClass: TtsFactoryServiceMock },
        { provide: PdfGeneratorService, useClass: PdfGeneratorServiceMock },
        { provide: OcrService, useClass: OcrServiceMock },
      ],
    })
      .overrideProvider(OpenAiService)
      .useClass(OpenAiServiceMock)
      .compile();

    const svc = moduleRef.get(DiagnosticsService);
    const file = {
      buffer: Buffer.from('pdf'),
      originalname: 'a.pdf',
      mimetype: 'application/pdf',
    } as any;

    const resp1 = await svc.handle(file, 'Hemoglobina 13.5 g/dL\n...');
    expect(resp1.status).toBe('OK');
    expect(typeof resp1.diagnostico).toBe('string');

    const resp2 = await svc.handle(file, 'abc');
    expect(resp2.diagnostico).toMatch(/Leucócitos/);

    const resp3 = await svc.handle(file, 'fail Hemoglobina 13.5 g/dL\n...');
    expect(resp3.diagnostico).toMatch(/Leucócitos/);
  });
});
