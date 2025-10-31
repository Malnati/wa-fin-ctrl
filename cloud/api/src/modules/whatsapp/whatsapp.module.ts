// api/src/modules/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { OpenRouterModule } from '../../openrouter/openrouter.module';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [OpenRouterModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
