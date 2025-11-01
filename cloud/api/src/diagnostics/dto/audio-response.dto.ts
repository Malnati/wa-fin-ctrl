// src/diagnostics/dto/audio-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AudioResponseDto {
  @ApiProperty({
    description: 'Status da geração de áudio',
    example: 'DISABLED',
  })
  status!: string;

  @ApiProperty({
    description: 'URL do arquivo de áudio gerado',
    example: '',
  })
  audioUrl!: string;

  @ApiProperty({
    description: 'ID da voz utilizada para geração',
    example: '',
  })
  voiceID!: string;

  @ApiProperty({
    description: 'Texto que foi convertido em áudio',
    example: 'Este é um texto de exemplo para conversão em áudio.',
  })
  text!: string;

  @ApiProperty({
    description: 'Mensagem de sucesso ou erro',
    example: 'Geração de áudio via TTS está desativada para este ambiente.',
  })
  message!: string;
}
