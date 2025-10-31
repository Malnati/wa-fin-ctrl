// api/src/modules/notify/notify.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
} from 'class-validator';

export class NotifyEmailDto {
  @ApiProperty({
    example: 'token-123',
    description: 'Token único da notificação para controle do front-end',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'profissional@clinica.com',
    description: 'Endereço de e-mail do destinatário da notificação',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'msg-123',
    description: 'ID opcional para rastreamento da mensagem',
    required: false,
  })
  @IsString()
  @IsOptional()
  id?: string;
}

export class NotifyWhatsappDto {
  @ApiProperty({
    example: 'token-123',
    description: 'Token único da notificação para controle do front-end',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: '+5511999999999',
    description:
      'Número de telefone do destinatário no formato +55 seguido de 11 dígitos',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+55\d{11}$/, {
    message: 'phone must follow the format +55XXXXXXXXXXX with 11 digits',
  })
  phone!: string;
}
