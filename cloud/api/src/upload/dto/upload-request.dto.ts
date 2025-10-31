// api/src/upload/dto/upload-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo PDF para upload',
  })
  file!: any;

  @ApiProperty({
    description: 'Nome personalizado para o arquivo (opcional)',
    example: 'meu-documento.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({
    description: 'Descrição ou notas sobre o arquivo (opcional)',
    example: 'Relatório médico do paciente João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
