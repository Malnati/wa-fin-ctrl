// api/src/modules/whatsapp/whatsapp.controller.ts
import {
  BadRequestException,
  Controller,
  HttpStatus,
  Logger,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { relative } from 'node:path';
import type { Express } from 'express';
import { WhatsappService } from './whatsapp.service';
import { WaZipProcessedFileDto } from './dto/wa-zip-response.dto';

const MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const ZIP_FILE_TYPE_REGEX = /(zip)$/i;
const JSON_RELATIVE_BASE = process.cwd();

@ApiTags('whatsapp')
@Controller()
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('wa-zip')
  @ApiOperation({
    summary: 'Processar ZIP de conversas do WhatsApp',
    description:
      'Recebe um arquivo ZIP exportado do WhatsApp, extrai comprovantes (PDFs e imagens), envia cada arquivo ao OpenRouter e persiste o texto OCR em JSON.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload do arquivo ZIP contendo conversas e mídias do WhatsApp',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo ZIP exportado do WhatsApp (máximo 50MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Lista de arquivos encaminhados ao OpenRouter, incluindo o caminho relativo dos JSONs gerados.',
    type: WaZipProcessedFileDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Quando o arquivo não é um ZIP válido ou não contém comprovantes em PDF/Imagem.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_ZIP_SIZE_BYTES },
    }),
  )
  async processZip(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: ZIP_FILE_TYPE_REGEX })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ): Promise<WaZipProcessedFileDto[]> {
    const method = 'processZip';
    const t0 = Date.now();

    if (!file) {
      throw new BadRequestException('Arquivo ZIP obrigatório não foi enviado.');
    }

    this.logger.log(
      `${method} ENTER, { originalName: ${file.originalname}, size: ${file.size} }`,
    );

    try {
      const results = await this.whatsappService.processZip(file);
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, processed: ${results.length} }`,
      );
      return results.map((result) => ({
        origem: result.origem,
        jsonPath: this.toRelativePath(result.jsonPath),
      }));
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  private toRelativePath(targetPath: string): string {
    return relative(JSON_RELATIVE_BASE, targetPath);
  }
}
