// Caminho relativo ao projeto: src/agents/result-validator.agent.ts
import { Injectable } from '@nestjs/common';

export interface ValidateCtx {
  textExtracted?: string | null;
  file?: Express.Multer.File | null;
}

@Injectable()
export class ResultValidatorAgent {
  isGood(diagnosis: string, _ctx: ValidateCtx): boolean {
    try {
      if (!diagnosis || typeof diagnosis !== 'string') return false;

      const tooGeneric =
        /exemplo de demonstra(ç|c)ão|processado com sucesso|an(á|a)lise realizada com sucesso/i.test(
          diagnosis,
        );

      const hasQuoteFromPdf =
        /["“][^”"']{10,}["”]/.test(diagnosis) ||
        /(?:Hb|Hemo|Hema|RDW|Leuc|Plaq)/i.test(diagnosis);
      const hasOpinions =
        /(acima|abaixo|elevado|reduzido|alerta|recomenda|sugere)/i.test(
          diagnosis,
        );

      if (tooGeneric) return false;
      if (!hasQuoteFromPdf) return false;
      if (!hasOpinions) return false;

      return true;
    } catch (error) {
      console.error('ResultValidatorAgent.isGood error:', error);
      return false;
    }
  }
}
