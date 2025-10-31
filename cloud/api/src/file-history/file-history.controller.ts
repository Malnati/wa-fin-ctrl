// api/src/file-history/file-history.controller.ts
import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileHistoryService } from './file-history.service';
import {
  FileHistoryQueryDto,
  FileHistoryResponseDto,
  FileStatsDto,
} from './dto/file-history.dto';
import {
  FILE_HISTORY_DEFAULT_PAGE_SIZE,
  FILE_HISTORY_MAX_PAGE_SIZE,
  API_BASE_URL,
} from '../constants/constants';

@ApiTags('file-history')
@Controller('file-history')
export class FileHistoryController {
  private readonly logger = new Logger(FileHistoryController.name);

  constructor(private readonly fileHistoryService: FileHistoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar histórico de arquivos',
    description: `
    Retorna uma lista paginada de todos os arquivos enviados para o sistema.
    
    Funcionalidades:
    - Paginação com controle de página e limite
    - Busca por nome do arquivo ou descrição
    - Filtros por tipo MIME e período de data
    - Ordenação por data de upload (mais recente primeiro)
    - Informações de análise quando disponível
    
    Casos de uso:
    - Visualizar histórico de uploads
    - Buscar arquivos específicos
    - Acompanhar status de processamento
    - Gerenciar arquivos antigos
    `,
  })
  @ApiQuery({
    name: 'page',
    description: 'Número da página (começando em 1)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: `Número de itens por página (máximo ${FILE_HISTORY_MAX_PAGE_SIZE})`,
    required: false,
    example: FILE_HISTORY_DEFAULT_PAGE_SIZE,
  })
  @ApiQuery({
    name: 'search',
    description: 'Busca por nome, nome personalizado ou descrição',
    required: false,
    example: 'relatório',
  })
  @ApiQuery({
    name: 'mimeType',
    description: 'Filtrar por tipo MIME específico',
    required: false,
    example: 'application/pdf',
  })
  @ApiQuery({
    name: 'dateFrom',
    description: 'Data de início do período (ISO 8601)',
    required: false,
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'dateTo',
    description: 'Data de fim do período (ISO 8601)',
    required: false,
    example: '2025-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de arquivos recuperada com sucesso',
    type: FileHistoryResponseDto,
    schema: {
      example: {
        files: [
          {
            token: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            originalName: 'exames.pdf',
            customName: 'relatório-exames-2025.pdf',
            fileSize: 1024576,
            mimeType: 'application/pdf',
            uploadDate: '2025-10-18T22:15:30.000Z',
            description: 'Exames laboratoriais do paciente João Silva',
            fileUrl: `${API_BASE_URL}/uploads/upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-1729288530000.pdf`,
            processed: true,
            analysisResult: 'Análise médica completa...',
            lastAnalyzedAt: '2025-10-18T22:16:45.000Z',
          },
        ],
        total: 25,
        page: 1,
        limit: FILE_HISTORY_DEFAULT_PAGE_SIZE,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
        timestamp: '2025-10-20T02:15:30.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de consulta inválidos',
  })
  async getFileHistory(
    @Query() query: FileHistoryQueryDto,
  ): Promise<FileHistoryResponseDto> {
    const method = 'getFileHistory';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { query: ${JSON.stringify(query)} }`);

    try {
      // Validate query parameters
      if (query.page && query.page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (
        query.limit &&
        (query.limit < 1 || query.limit > FILE_HISTORY_MAX_PAGE_SIZE)
      ) {
        throw new BadRequestException(
          `Limit must be between 1 and ${FILE_HISTORY_MAX_PAGE_SIZE}`,
        );
      }

      if (query.dateFrom && query.dateTo) {
        const fromDate = new Date(query.dateFrom);
        const toDate = new Date(query.dateTo);
        if (fromDate > toDate) {
          throw new BadRequestException('dateFrom must be before dateTo');
        }
      }

      const result = await this.fileHistoryService.getFileHistory(query);

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, total: ${result.total}, page: ${result.page} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas dos arquivos',
    description: `
    Retorna estatísticas consolidadas sobre todos os arquivos no sistema.
    
    Informações incluídas:
    - Número total de arquivos e tamanho total
    - Quantidade de arquivos processados/analisados
    - Distribuição por tipo MIME
    - Gráfico de uploads por dia (últimos 30 dias)
    
    Casos de uso:
    - Dashboard de administração
    - Relatórios de uso do sistema
    - Monitoramento de atividade
    - Análise de padrões de upload
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas recuperadas com sucesso',
    type: FileStatsDto,
    schema: {
      example: {
        totalFiles: 25,
        totalSize: 52428800,
        processedFiles: 20,
        mimeTypeDistribution: {
          'application/pdf': 20,
          'text/plain': 3,
          'application/javascript': 2,
        },
        uploadsPerDay: {
          '2025-10-19': 5,
          '2025-10-18': 8,
          '2025-10-17': 2,
        },
        timestamp: '2025-10-20T02:15:30.000Z',
      },
    },
  })
  async getFileStats(): Promise<FileStatsDto> {
    const method = 'getFileStats';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      const result = await this.fileHistoryService.getFileStats();

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, totalFiles: ${result.totalFiles} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  @Delete(':token')
  @ApiOperation({
    summary: 'Excluir arquivo do histórico',
    description: `
    Remove um arquivo do sistema usando seu token único.
    
    Ações realizadas:
    - Remove metadados do arquivo do histórico
    - Tenta excluir o arquivo físico do armazenamento
    - Remove análises associadas (se existirem)
    
    ⚠️ ATENÇÃO: Esta ação é irreversível!
    
    Casos de uso:
    - Limpeza de arquivos antigos
    - Remoção de dados sensíveis
    - Gerenciamento de espaço em disco
    - Conformidade com LGPD (direito ao esquecimento)
    `,
  })
  @ApiParam({
    name: 'token',
    description: 'Token UUID do arquivo a ser excluído',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo excluído com sucesso',
    schema: {
      example: {
        message: 'Arquivo excluído com sucesso',
        token: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        timestamp: '2025-10-20T02:15:30.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Arquivo não encontrado',
  })
  async deleteFile(
    @Param('token') token: string,
  ): Promise<{ message: string; token: string; timestamp: string }> {
    const method = 'deleteFile';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { token: ${token} }`);

    try {
      // Validate token format
      if (!this.isValidToken(token)) {
        throw new BadRequestException(`Token inválido: ${token}`);
      }

      await this.fileHistoryService.deleteFile(token);

      const result = {
        message: 'Arquivo excluído com sucesso',
        token,
        timestamp: new Date().toISOString(),
      };

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: ${dt}, token: ${token} }`);

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, token: ${token}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  private isValidToken(token: string): boolean {
    // Validate that token is a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }
}
