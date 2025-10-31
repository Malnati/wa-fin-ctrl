// api/src/notifications/dto/notifications.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEmail,
  IsOptional,
  IsIn,
  IsObject,
  ValidateNested,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationContextDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiProperty({
    description: 'User name',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({
    description: 'Company/brand name',
    example: 'MBRA',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    description: 'Dashboard URL for user access',
    example: 'https://yagnostic.mbra.com.br/dashboard',
    required: false,
  })
  @IsOptional()
  @IsString()
  dashboardUrl?: string;

  @ApiProperty({
    description: 'Admin panel URL',
    example: 'https://yagnostic.mbra.com.br/admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  adminUrl?: string;

  @ApiProperty({
    description: 'Registration date',
    example: '2025-10-20T15:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  registrationDate?: string;

  // Allow additional dynamic properties
  [key: string]: any;
}

export class TriggerNotificationDto {
  @ApiProperty({
    description: 'Notification event type',
    enum: [
      'user_registered',
      'account_approved',
      'account_pending',
      'diagnostic_ready',
      'admin_notification',
    ],
    example: 'user_registered',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'user_registered',
    'account_approved',
    'account_pending',
    'diagnostic_ready',
    'admin_notification',
  ])
  event!:
    | 'user_registered'
    | 'account_approved'
    | 'account_pending'
    | 'diagnostic_ready'
    | 'admin_notification';

  @ApiProperty({
    description: 'List of recipient email addresses',
    example: ['user@example.com', 'admin@company.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  recipients!: string[];

  @ApiProperty({
    description: 'Context variables for template replacement',
    type: NotificationContextDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationContextDto)
  context!: NotificationContextDto;
}

export class WhatsAppNotificationDto {
  @ApiProperty({
    description: 'Phone number in Brazilian format (+55XXXXXXXXXXX)',
    example: '+5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+55\d{10,11}$/, {
    message:
      'Phone must be in Brazilian format: +55XXXXXXXXXX or +55XXXXXXXXXXX',
  })
  phone!: string;

  @ApiProperty({
    description: 'Message content to send',
    example: 'Sua conta foi aprovada! Acesse a plataforma para começar.',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({
    description: 'Optional context for message templating',
    type: NotificationContextDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationContextDto)
  context?: NotificationContextDto;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Tracking ID for the notification',
    example: 'uuid-track-id-here',
  })
  trackId!: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Notification sent successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Timestamp of the operation',
    example: '2025-10-20T15:30:00Z',
  })
  timestamp!: string;
}

export class NotificationHistoryDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 'uuid-notification-id',
  })
  id!: string;

  @ApiProperty({
    description: 'Notification type',
    enum: ['email', 'whatsapp'],
    example: 'email',
  })
  type!: 'email' | 'whatsapp';

  @ApiProperty({
    description: 'Template ID used',
    example: 'onboarding-welcome',
  })
  templateId!: string;

  @ApiProperty({
    description: 'List of recipients',
    example: ['user@example.com'],
  })
  recipients!: string[];

  @ApiProperty({
    description: 'Notification status',
    enum: ['pending', 'sent', 'failed'],
    example: 'sent',
  })
  status!: 'pending' | 'sent' | 'failed';

  @ApiProperty({
    description: 'Timestamp when notification was sent',
    example: '2025-10-20T15:30:00Z',
    required: false,
  })
  sentAt?: string;

  @ApiProperty({
    description: 'Error message if failed',
    example: 'SMTP connection failed',
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Tracking ID',
    example: 'uuid-track-id',
  })
  trackId!: string;
}
