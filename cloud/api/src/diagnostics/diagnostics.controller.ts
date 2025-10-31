// src/diagnostics/diagnostics.controller.ts
import {
  Body,
  Controller,
  Logger,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticResponseDto } from './dto/diagnostic-response.dto';
import { AudioRequestDto } from './dto/audio-request.dto';
import { AudioResponseDto } from './dto/audio-response.dto';
import { Request } from 'express';

const FORWARDED_PROTO_HEADER = 'x-forwarded-proto';
const FORWARDED_HOST_HEADER = 'x-forwarded-host';
const HOST_HEADER = 'host';
const HEADER_VALUE_SEPARATOR = ',';
const URL_PROTOCOL_SEPARATOR = '://';
const DEFAULT_REQUEST_PROTOCOL = 'http';

@ApiTags('diagnostics')
@Controller('diagnostics')
export class DiagnosticsController {
  private readonly logger = new Logger(DiagnosticsController.name);

  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Post('submit')
  @ApiOperation({
    summary: 'Submeter arquivo para análise completa',
    description: `
    Fluxo completo de análise:
    1. Extrai texto do arquivo (PDF, TXT, JS, etc.)
    2. Gera análise usando IA (OpenAI GPT-3.5-turbo)
    3. Cria áudio da análise (ElevenLabs TTS) - OPCIONAL
    4. Retorna análise completa com áudio (se solicitado)
    
    Aceita apenas upload de arquivo via multipart/form-data.
    Campo obrigatório: file
    Campo opcional: generateAudio (boolean) - se true, gera áudio; se false ou não informado, não gera áudio
    Campo opcional: voiceID (string) - ID da voz do ElevenLabs (substitui ELEVENLABS_VOICE_ID se informado)
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivo para análise',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo para análise (PDF, TXT, JS, etc.)',
        },
        generateAudio: {
          type: 'boolean',
          description: 'Se deve gerar áudio da análise (padrão: false)',
          default: false,
        },
        voiceID: {
          type: 'string',
          description:
            'ID da voz do ElevenLabs (substitui ELEVENLABS_VOICE_ID se informado)',
          example: 'CstacWqMhJQlnfLPxRG4',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Análise completa gerada com sucesso',
    type: DiagnosticResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo não fornecido ou inválido',
  })
  @UseInterceptors(FileInterceptor('file'))
  async submit(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
        ],
        fileIsRequired: true,
      }),
    )
    file: any,
    @Body('generateAudio') generateAudio?: boolean,
    @Body('voiceID') voiceID?: string,
    @Req() req?: Request,
  ): Promise<DiagnosticResponseDto> {
    const method = 'submit';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { file: file ? { size: file.size, mimetype: file.mimetype, originalname: file.originalname } : null, generateAudio, voiceID, isScanned }`,
    );

    try {
      const requestBaseUrl = this.resolveRequestBaseUrl(req);
      const result = await this.diagnosticsService.submitDiagnostic(
        file,
        generateAudio,
        voiceID,
        requestBaseUrl,
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, resultType: typeof result }`,
      );
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }

  @Post('audio')
  @ApiOperation({
    summary: 'Gerar áudio a partir de texto',
    description: `
    Gera arquivo de áudio a partir de texto fornecido usando ElevenLabs TTS.
    
    Campo obrigatório: text
    Campo opcional: voiceID (usa ELEVENLABS_VOICE_ID se não informado)
    
    ⚠️  ATENÇÃO: Este endpoint gera custos na API ElevenLabs!
    `,
  })
  @ApiBody({
    description: 'Requisição para geração de áudio',
    type: AudioRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Áudio gerado com sucesso',
    type: AudioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Texto não fornecido ou inválido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro na geração de áudio',
  })
  async generateAudio(
    @Body() audioRequest: AudioRequestDto,
  ): Promise<AudioResponseDto> {
    const method = 'generateAudio';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { textLen: audioRequest.text?.length, voiceID: audioRequest.voiceID }`,
    );

    try {
      const result = await this.diagnosticsService.generateAudioFromText(
        audioRequest.text,
        audioRequest.voiceID,
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultType: typeof result }`,
      );
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${e instanceof Error ? e.stack : String(e)}, ${method} durationMs=${dt}`,
      );
      throw e;
    }
  }

  private resolveRequestBaseUrl(request?: Request): string | undefined {
    if (!request) {
      return undefined;
    }

    const forwardedProto = this.extractHeaderValue(
      request,
      FORWARDED_PROTO_HEADER,
    );
    const forwardedHost = this.extractHeaderValue(
      request,
      FORWARDED_HOST_HEADER,
    );
    const host =
      forwardedHost ||
      this.extractHeaderValue(request, HOST_HEADER) ||
      request.headers?.host;

    if (!host) {
      return undefined;
    }

    const protocol =
      forwardedProto || request.protocol || DEFAULT_REQUEST_PROTOCOL;

    return `${protocol}${URL_PROTOCOL_SEPARATOR}${host}`;
  }

  private extractHeaderValue(
    request: Request,
    headerName: string,
  ): string | undefined {
    const rawValue = request.get(headerName) || undefined;
    if (!rawValue) {
      return undefined;
    }

    const [firstValue] = rawValue.split(HEADER_VALUE_SEPARATOR);
    return firstValue?.trim() || undefined;
  }
}
