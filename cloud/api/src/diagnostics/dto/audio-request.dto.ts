// src/diagnostics/dto/audio-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AudioRequestDto {
  @ApiProperty({
    description: 'Texto para ser convertido em áudio',
    example: 'Este é um texto de exemplo para conversão em áudio.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({
    description: 'Mantido para compatibilidade; ignorado porque o TTS está desativado.',
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  voiceID?: string;
}
