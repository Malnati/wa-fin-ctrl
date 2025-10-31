// src/diagnostics/dto/diagnostic-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DiagnosticResponseDto {
  @ApiProperty({
    description: 'Status da análise',
    example: 'OK',
  })
  status!: string;

  @ApiProperty({
    description: 'Resumo da análise',
    example: 'O arquivo foi analisado com sucesso.',
  })
  resumo!: string;

  @ApiProperty({
    description: 'Texto da análise',
    example: 'Análise simulado para script.js',
  })
  text!: string;

  @ApiProperty({
    description: 'Texto extraído do arquivo (PDF, TXT, etc.)',
    example: 'Conteúdo extraído do arquivo...',
    required: false,
  })
  textExtracted?: string;

  @ApiProperty({
    description: 'URL do arquivo original enviado',
    example: 'http://localhost:3333/arquivo-1690000000000.txt',
  })
  fileUrl!: string;

  @ApiProperty({
    description:
      'URL do arquivo de áudio gerado dinamicamente (apenas se generateAudio=true)',
    example: 'http://localhost:3333/diagnostico-1690000000000.mp3',
    required: false,
  })
  audioUrl?: string;

  @ApiProperty({
    description:
      'URL do relatório em PDF gerado dinamicamente (apenas para arquivos PDF)',
    example: 'http://localhost:3333/relatorio-1690000000000.pdf',
    required: false,
  })
  pdfUrl?: string;

  @ApiProperty({
    description:
      'Indica se o PDF foi enviado diretamente ao modelo para análise',
    example: false,
    required: false,
  })
  pdfSentRaw?: boolean;

  @ApiProperty({
    description: 'Indica se o documento foi identificado como escaneado',
    example: false,
    required: false,
  })
  isScanned?: boolean;
}
