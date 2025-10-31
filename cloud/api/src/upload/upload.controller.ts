// api/src/upload/upload.controller.ts
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
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UploadService, FileMetadata } from './upload.service';
import { UploadRequestDto } from './dto/upload-request.dto';
import { UploadResponseDto } from './dto/upload-response.dto';

const FORWARDED_PROTO_HEADER = 'x-forwarded-proto';
const FORWARDED_HOST_HEADER = 'x-forwarded-host';
const HOST_HEADER = 'host';
const HEADER_VALUE_SEPARATOR = ',';
const URL_PROTOCOL_SEPARATOR = '://';
const DEFAULT_REQUEST_PROTOCOL = 'http';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({
    summary: 'Upload de arquivo PDF',
    description: `
    Endpoint para upload e armazenamento de arquivos PDF.
    
    Funcionalidades:
    - Aceita apenas arquivos PDF (máximo 10MB)
    - Gera token único de identificação para cada arquivo
    - Armazena metadados localmente
    - Retorna informações completas do upload
    - Não requer autenticação
    - Não integra com Google Drive
    
    Casos de uso:
    - Upload de relatórios médicos
    - Armazenamento de documentos para processamento posterior
    - Integração com fluxos de análise de PDF
    
    O token retornado pode ser usado para:
    - Referenciar o arquivo em outros endpoints
    - Recuperar metadados do arquivo
    - Construir URLs de acesso ao arquivo
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivo PDF com metadados opcionais',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF (obrigatório, máximo 10MB)',
        },
        customName: {
          type: 'string',
          description: 'Nome personalizado para o arquivo (opcional)',
          example: 'relatório-exames-2025.pdf',
        },
        description: {
          type: 'string',
          description: 'Descrição ou notas sobre o arquivo (opcional)',
          example: 'Exames laboratoriais do paciente João Silva - Outubro 2025',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivo enviado e armazenado com sucesso',
    type: UploadResponseDto,
    schema: {
      example: {
        status: 'OK',
        token: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        originalName: 'exames.pdf',
        fileSize: 1024576,
        mimeType: 'application/pdf',
        uploadDate: '2025-10-18T22:15:30.000Z',
        fileUrl:
          'http://localhost:3333/uploads/upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-1729288530000.pdf',
        description: 'Exames laboratoriais do paciente',
        metadata: {
          checksum: 'abc123def456789',
          customName: 'relatório-exames-2025.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Erro de validação - arquivo inválido, muito grande ou não é PDF',
    schema: {
      example: {
        statusCode: 400,
        message: 'Apenas arquivos PDF são permitidos neste endpoint',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande (máximo 10MB)',
    schema: {
      example: {
        statusCode: 413,
        message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB',
        error: 'Payload Too Large',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('customName') customName?: string,
    @Body('description') description?: string,
    @Req() req?: Request,
  ): Promise<UploadResponseDto> {
    const method = 'upload';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { originalName: ${file?.originalname}, size: ${file?.size}, mimeType: ${file?.mimetype}, customName: ${customName}, hasDescription: ${!!description} }`,
    );

    try {
      const requestBaseUrl = this.resolveRequestBaseUrl(req);
      const result = await this.uploadService.uploadFile(
        file,
        customName,
        description,
        requestBaseUrl,
      );

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, token: ${result.token}, fileSize: ${result.fileSize} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  @Get('metadata/:token')
  @ApiOperation({
    summary: 'Recuperar metadados de um arquivo por token',
    description: `
    Recupera os metadados completos de um arquivo previamente carregado usando seu token.
    
    Retorna informações como:
    - Nome original do arquivo
    - Tamanho e tipo MIME
    - Data do upload
    - Checksum MD5
    - Descrição personalizada (se fornecida)
    - URL pública do arquivo
    `,
  })
  @ApiParam({
    name: 'token',
    description: 'Token UUID do arquivo',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadados recuperados com sucesso',
    schema: {
      example: {
        token: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        originalName: 'exames.pdf',
        fileName:
          'upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-1729288530000.pdf',
        fileSize: 1024576,
        mimeType: 'application/pdf',
        uploadDate: '2025-10-18T22:15:30.000Z',
        checksum: 'abc123def456789',
        description: 'Exames laboratoriais do paciente',
        customName: 'relatório-exames-2025.pdf',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido fornecido',
  })
  @ApiResponse({
    status: 404,
    description: 'Arquivo não encontrado para o token fornecido',
  })
  async getMetadata(@Param('token') token: string): Promise<FileMetadata> {
    const method = 'getMetadata';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { token: ${token} }`);

    try {
      // Validate token format before processing
      if (!this.isValidToken(token)) {
        throw new BadRequestException(`Token inválido: ${token}`);
      }

      const metadata = await this.uploadService.getFileMetadata(token);

      if (!metadata) {
        throw new NotFoundException(
          `Arquivo não encontrado para o token: ${token}`,
        );
      }

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: ${dt}, token: ${token} }`);

      return metadata;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, token: ${token}, error: ${error instanceof Error ? error.message : String(error)} }`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
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

  private isValidToken(token: string): boolean {
    // Validate that token is a valid UUID format to prevent path injection
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }
}
