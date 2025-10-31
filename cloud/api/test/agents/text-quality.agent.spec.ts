// test/agents/text-quality.agent.spec.ts
import { TextQualityAgent } from '../../src/agents/text-quality.agent';

describe('TextQualityAgent', () => {
  const agent = new TextQualityAgent();

  it('retorna false para texto curto', () => {
    expect(agent.isSufficient('abc', { minLength: 10 })).toBe(false);
  });

  it('retorna true para texto longo com alguns números', () => {
    const text = 'Hemoglobina 13.5\nLeucócitos 7.2\nValor normal\nOutro texto';
    expect(
      agent.isSufficient(text, { minLength: 10, minNumericLinesPct: 10 }),
    ).toBe(true);
  });
});
