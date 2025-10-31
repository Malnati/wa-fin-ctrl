// src/email/dto/email-notify.dto.ts
import {
  IsEmail,
  IsString,
  IsArray,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * NotifyEmailDto - The canonical DTO for email notification requests.
 * This is the single source of truth used across the application.
 * Imported by both email and notify modules to ensure API consistency.
 */
export class NotifyEmailDto {
  @ApiProperty({
    description: 'Lista de destinatários do e-mail',
    example: ['user@example.com', 'admin@company.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  destinatarios!: string[];

  @ApiProperty({
    description: 'Assunto do e-mail',
    example: 'Notificação importante do sistema',
  })
  @IsString()
  @IsNotEmpty()
  assunto!: string;

  @ApiProperty({
    description: 'Corpo da mensagem do e-mail',
    example: 'Esta é uma notificação automática do sistema...',
  })
  @IsString()
  @IsNotEmpty()
  corpo!: string;

  @ApiProperty({
    description: 'ID opcional para rastreamento da mensagem',
    example: 'msg-123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  id?: string;
}

export class EmailNotifyResponseDto {
  @ApiProperty({
    description: 'Status do envio',
    example: true,
  })
  sucesso!: boolean;

  @ApiProperty({
    description: 'ID único da mensagem para rastreamento',
    example: 'msg-1729288000123',
  })
  mensagemId!: string;

  @ApiProperty({
    description: 'Timestamp do processamento',
    example: '2024-10-18T22:06:10.596Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Número de destinatários processados',
    example: 2,
  })
  destinatariosProcessados!: number;

  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Notificação processada com sucesso (modo mock)',
  })
  mensagem!: string;
}
