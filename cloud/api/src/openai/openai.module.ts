// src/openai/openai.module.ts
import { Module } from '@nestjs/common';
// import { OpenAiService } from './openai.service'; // Integração OpenAI desativada

@Module({
  providers: [
    // OpenAiService, // Integração OpenAI desativada
  ],
  exports: [
    // OpenAiService, // Integração OpenAI desativada
  ],
})
export class OpenAiModule {}
