// Caminho relativo ao projeto: src/agents/text-quality.agent.ts
import { Injectable } from '@nestjs/common';

export interface TextQualityOptions {
  minLength?: number;
  minNumericLinesPct?: number;
}

@Injectable()
export class TextQualityAgent {
  isSufficient(text: string, opts: TextQualityOptions = {}): boolean {
    try {
      const minLength = opts.minLength ?? 300;
      if (!text || text.trim().length < minLength) return false;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return false;

      const numericLines = lines.filter((l) => /\d/.test(l)).length;
      const pct = (numericLines / lines.length) * 100;
      const minPct = opts.minNumericLinesPct ?? 5;
      return pct >= minPct;
    } catch (error) {
      console.error('TextQualityAgent.isSufficient error:', error);
      return false;
    }
  }
}
