// src/agents/agents.module.ts
import { Global, Module } from '@nestjs/common';
// import { OpenAiModule } from '../openai/openai.module'; // Integração OpenAI desativada
import { TextQualityAgent } from './text-quality.agent';
import { TextDiagnoseAgent } from './text-diagnose.agent';
import { PdfDiagnoseAgent } from './pdf-diagnose.agent';
import { ResultValidatorAgent } from './result-validator.agent';

@Global()
@Module({
  imports: [
    // OpenAiModule, // Integração OpenAI desativada
  ],
  providers: [
    TextQualityAgent,
    TextDiagnoseAgent,
    PdfDiagnoseAgent,
    ResultValidatorAgent,
  ],
  exports: [
    TextQualityAgent,
    TextDiagnoseAgent,
    PdfDiagnoseAgent,
    ResultValidatorAgent,
  ],
})
export class AgentsModule {}
