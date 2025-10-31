// test/agents/text-diagnose.agent.spec.ts
import { TextDiagnoseAgent } from '../../src/agents/text-diagnose.agent';

class OpenAiServiceMock {
  generateDiagnosis = async (t: string) => `diag:${t.length}`;
}

describe('TextDiagnoseAgent', () => {
  it('usa OpenAiService.generateDiagnosis com o texto', async () => {
    const agent = new TextDiagnoseAgent(new OpenAiServiceMock() as any);
    const out = await agent.diagnose('abc');
    expect(out).toBe('diag:3');
  });
});
