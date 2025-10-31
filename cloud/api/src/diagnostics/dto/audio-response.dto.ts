// src/diagnostics/dto/audio-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AudioResponseDto {
  @ApiProperty({
    description: 'Status da geração de áudio',
    example: 'OK',
  })
  status!: string;

  @ApiProperty({
    description: 'URL do arquivo de áudio gerado',
    example: 'http://localhost:3333/diagnostico-1234567890.mp3',
  })
  audioUrl!: string;

  @ApiProperty({
    description: 'ID da voz utilizada para geração',
    example: 'CstacWqMhJQlnfLPxRG4',
  })
  voiceID!: string;

  @ApiProperty({
    description: 'Texto que foi convertido em áudio',
    example: 'Este é um texto de exemplo para conversão em áudio.',
  })
  text!: string;

  @ApiProperty({
    description: 'Mensagem de sucesso ou erro',
    example: 'Áudio gerado com sucesso!',
  })
  message!: string;
}
