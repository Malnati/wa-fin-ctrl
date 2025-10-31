// api/src/modules/notify/notify.controller.ts
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotifyEmailDto, NotifyWhatsappDto } from './notify.dto';
import { NotifyService } from './notify.service';

@ApiTags('notify')
@Controller('notify')
export class NotifyController {
  private readonly logger = new Logger(NotifyController.name);

  constructor(private readonly notifyService: NotifyService) {}

  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mock email notification',
    description:
      'Recebe notificações por e-mail e registra internamente. Não integra com serviços de e-mail externos nesta fase.',
  })
  @ApiOperation({
    summary:
      'Mock: Envia notificação por e-mail (registro interno, sem envio real)',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitação registrada com sucesso.',
  })
  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Mock: Envia notificação por e-mail (registro interno, sem envio real)',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitação registrada com sucesso.',
  })
  async notifyEmail(@Body() body: NotifyEmailDto) {
    const entry = await this.notifyService.registerEmailNotification(body);
    this.logger.log(`POST /notify/email | payload=${JSON.stringify(body)}`);
    return { status: 'success', trackId: entry.trackId };
  }

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mock WhatsApp notification',
    description:
      'Recebe notificações WhatsApp e registra internamente. Não integra com provedores externos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitação registrada com sucesso.',
  })
  async notifyWhatsapp(@Body() body: NotifyWhatsappDto) {
    this.logger.log(`Recebida solicitação WhatsApp: ${JSON.stringify(body)}`);
    const entry = await this.notifyService.registerWhatsappNotification(body);
    return { status: 'success', trackId: entry.trackId };
  }
}
