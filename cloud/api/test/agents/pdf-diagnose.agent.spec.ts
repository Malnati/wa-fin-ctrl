// test/agents/pdf-diagnose.agent.spec.ts
import { PdfDiagnoseAgent } from '../../src/agents/pdf-diagnose.agent';

class OpenAiServiceMock {
  generateDiagnosisFromPdf = async (_b64: string) => 'diag:pdf';
}

describe('PdfDiagnoseAgent', () => {
  it('usa OpenAiService.generateDiagnosisFromPdf com o arquivo', async () => {
    const agent = new PdfDiagnoseAgent(new OpenAiServiceMock() as any);
    const out = await agent.diagnose({ buffer: Buffer.from('x') } as any);
    expect(out).toBe('diag:pdf');
  });
});
