// api/src/file-history/dto/file-history.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import {
  FILE_HISTORY_DEFAULT_PAGE_SIZE,
  FILE_HISTORY_MAX_PAGE_SIZE,
  API_BASE_URL,
} from '../../constants/constants';

export class FileHistoryQueryDto {
  @ApiProperty({
    description: 'Página para paginação (começando em 1)',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Número de itens por página',
    example: FILE_HISTORY_DEFAULT_PAGE_SIZE,
    required: false,
    minimum: 1,
    maximum: FILE_HISTORY_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Busca por nome do arquivo',
    example: 'relatório',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por tipo MIME',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({
    description: 'Data de início para filtro de período (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'Data de fim para filtro de período (ISO 8601)',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class FileHistoryItemDto {
  @ApiProperty({
    description: 'Token único do arquivo',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  token!: string;

  @ApiProperty({
    description: 'Nome original do arquivo',
    example: 'exames.pdf',
  })
  originalName!: string;

  @ApiProperty({
    description: 'Nome personalizado do arquivo (se fornecido)',
    example: 'relatório-exames-2025.pdf',
    required: false,
  })
  customName?: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1024576,
  })
  fileSize!: number;

  @ApiProperty({
    description: 'Tipo MIME do arquivo',
    example: 'application/pdf',
  })
  mimeType!: string;

  @ApiProperty({
    description: 'Data do upload',
    example: '2025-10-18T22:15:30.000Z',
  })
  uploadDate!: string;

  @ApiProperty({
    description: 'Descrição do arquivo (se fornecida)',
    example: 'Exames laboratoriais do paciente João Silva',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'URL pública do arquivo',
    example: `${API_BASE_URL}/uploads/upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-1729288530000.pdf`,
  })
  fileUrl!: string;

  @ApiProperty({
    description: 'Indica se o arquivo foi processado/analisado',
    example: false,
  })
  processed!: boolean;

  @ApiProperty({
    description: 'Resultado da última análise (se disponível)',
    required: false,
  })
  analysisResult?: string;

  @ApiProperty({
    description: 'Data da última análise',
    required: false,
  })
  lastAnalyzedAt?: string;
}

export class FileHistoryResponseDto {
  @ApiProperty({
    description: 'Lista de arquivos',
    type: [FileHistoryItemDto],
  })
  files!: FileHistoryItemDto[];

  @ApiProperty({
    description: 'Número total de arquivos (sem paginação)',
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Número de itens por página',
    example: FILE_HISTORY_DEFAULT_PAGE_SIZE,
  })
  limit!: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 3,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Indica se há próxima página',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Indica se há página anterior',
    example: false,
  })
  hasPrevPage!: boolean;

  @ApiProperty({
    description: 'Timestamp da consulta',
    example: '2025-10-20T02:15:30.000Z',
  })
  timestamp!: string;
}

export class FileStatsDto {
  @ApiProperty({
    description: 'Número total de arquivos',
    example: 25,
  })
  totalFiles!: number;

  @ApiProperty({
    description: 'Tamanho total dos arquivos em bytes',
    example: 52428800,
  })
  totalSize!: number;

  @ApiProperty({
    description: 'Número de arquivos processados',
    example: 20,
  })
  processedFiles!: number;

  @ApiProperty({
    description: 'Distribuição por tipo MIME',
    example: {
      'application/pdf': 20,
      'text/plain': 3,
      'application/javascript': 2,
    },
  })
  mimeTypeDistribution!: Record<string, number>;

  @ApiProperty({
    description: 'Uploads por dia (últimos 30 dias)',
    example: {
      '2025-10-19': 5,
      '2025-10-18': 8,
      '2025-10-17': 2,
    },
  })
  uploadsPerDay!: Record<string, number>;

  @ApiProperty({
    description: 'Timestamp da consulta',
    example: '2025-10-20T02:15:30.000Z',
  })
  timestamp!: string;
}
