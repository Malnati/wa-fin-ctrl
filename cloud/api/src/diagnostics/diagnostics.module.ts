// src/diagnostics/diagnostics.module.ts
import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { OcrService } from './ocr.service';
import { PaddleOcrService } from './paddle-ocr.service';
// import { OpenAiModule } from '../openai/openai.module'; // Integração OpenAI desativada
import { TtsModule } from '../tts/tts.module';
import { AgentsModule } from '../agents/agents.module';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { FileHistoryModule } from '../file-history/file-history.module';

@Module({
  imports: [
    // OpenAiModule, // Integração OpenAI desativada
    TtsModule,
    AgentsModule,
    OpenRouterModule,
    FileHistoryModule,
  ],
  controllers: [DiagnosticsController],
  providers: [
    DiagnosticsService,
    PdfGeneratorService,
    OcrService,
    PaddleOcrService,
  ],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}
