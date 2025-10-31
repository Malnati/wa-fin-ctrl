// src/email/email-notify.controller.ts
import {
  Controller,
  Post,
  Body,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotifyEmailDto, EmailNotifyResponseDto } from './dto/email-notify.dto';
import {
  API_BASE_URL,
  MESSAGE_PREFIX,
  SUCCESS_MESSAGE,
} from '../constants/constants';

let messageCounter = 0;

@ApiTags('Email Notifications')
@Controller('notify')
export class EmailNotifyController {
  private readonly logger = new Logger(EmailNotifyController.name);

  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar notificação por e-mail (Mock)',
    description:
      'Registra solicitações de e-mail e retorna sucesso imediato. Não integra com Gmail nesta fase.',
  })
  @ApiResponse({
    status: 200,
    description: SUCCESS_MESSAGE,
    type: EmailNotifyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async notifyByEmail(
    @Body() request: NotifyEmailDto,
  ): Promise<EmailNotifyResponseDto> {
    const timestamp = new Date().toISOString();
    const mensagemId =
      request.id || `${MESSAGE_PREFIX}${Date.now()}-${++messageCounter}`;

    // Log estruturado para rastreabilidade completa
    this.logger.log({
      action: 'email_notification_request',
      mensagemId,
      timestamp,
      request: {
        destinatarios: request.destinatarios,
        assunto: request.assunto,
        corpoLength: request.corpo.length,
        id: request.id,
      },
      metadata: {
        destinatariosCount: request.destinatarios.length,
        hasCustomId: !!request.id,
        endpointUrl: `${API_BASE_URL}/notify/email`,
      },
    });

    // Simular processamento mock
    const logTemplate = process.env.EMAIL_NOTIFY_LOG_TEMPLATE;
    if (logTemplate) {
      const logMsg = logTemplate
        .replace(/\$\{mensagemId\}/g, mensagemId)
        .replace(/\$\{destinatarios\}/g, request.destinatarios.join(', '))
        .replace(/\$\{assunto\}/g, request.assunto);
      this.logger.log(logMsg);
    }

    if (!SUCCESS_MESSAGE)
      throw new Error('SUCCESS_MESSAGE env variable is required');
    const response: EmailNotifyResponseDto = {
      sucesso: true,
      mensagemId,
      timestamp,
      destinatariosProcessados: request.destinatarios.length,
      mensagem: SUCCESS_MESSAGE,
    };

    // Log da resposta para auditoria
    this.logger.log({
      action: 'email_notification_response',
      mensagemId,
      timestamp,
      response,
    });

    return response;
  }
}
