// src/tts/tts.module.ts
import { Module } from '@nestjs/common';
import { ElevenLabsTtsService } from './tts.service';
import { GcpTtsService } from './gcp-tts.service';
import { CoquiTtsService } from './coqui-tts.service';
import { TtsFactoryService } from './tts-factory.service';

@Module({
  providers: [
    ElevenLabsTtsService,
    GcpTtsService,
    CoquiTtsService,
    TtsFactoryService,
  ],
  exports: [TtsFactoryService],
})
export class TtsModule {}
