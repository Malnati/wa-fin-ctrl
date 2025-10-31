// test/agents/result-validator.agent.spec.ts
import { ResultValidatorAgent } from '../../src/agents/result-validator.agent';

describe('ResultValidatorAgent', () => {
  const agent = new ResultValidatorAgent();

  it('recusa diagnóstico genérico', () => {
    const bad =
      'Análise realizada com sucesso. Este é um exemplo de demonstração.';
    expect(agent.isGood(bad, {})).toBe(false);
  });

  it('aceita diagnóstico com citação e opinião', () => {
    const good =
      'Observa-se "Hemoglobina 13.5 g/dL" com valores acima do esperado, sugerindo investigação.';
    expect(agent.isGood(good, {})).toBe(true);
  });
});
