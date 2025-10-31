// api/src/upload/dto/upload-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Status do upload',
    example: 'OK',
  })
  status!: string;

  @ApiProperty({
    description: 'Token interno de identificação do arquivo',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  token!: string;

  @ApiProperty({
    description: 'Nome original do arquivo',
    example: 'documento.pdf',
  })
  originalName!: string;

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
    description: 'Data e hora do upload',
    example: '2025-10-18T22:15:30.000Z',
  })
  uploadDate!: string;

  @ApiProperty({
    description: 'URL pública para acesso ao arquivo',
    example:
      'http://localhost:3333/files/f47ac10b-58cc-4372-a567-0e02b2c3d479.pdf',
  })
  fileUrl!: string;

  @ApiProperty({
    description: 'Descrição personalizada do arquivo (se fornecida)',
    example: 'Relatório médico do paciente João Silva',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Metadados adicionais do arquivo',
    example: {
      checksum: 'abc123def456',
      pages: 5,
      version: '1.0',
    },
    required: false,
  })
  metadata?: Record<string, any>;
}
