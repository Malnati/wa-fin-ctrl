// api/src/onboarding/dto/onboarding.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class UserRegistrationDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Company name',
    example: 'MBRA Consultoria',
    required: false,
  })
  @IsOptional()
  @IsString()
  company?: string;
}

export class UserApprovalDto {
  @ApiProperty({
    description: 'Email of the user to approve',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Email or name of the admin who approved',
    example: 'admin@company.com',
  })
  @IsString()
  @IsNotEmpty()
  approvedBy!: string;
}

export class OnboardingResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Tracking ID for the operation',
    example: 'uuid-track-id-here',
  })
  trackId!: string;

  @ApiProperty({
    description: 'Response message',
    example: 'User registration processed successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Timestamp of the operation',
    example: '2025-10-20T15:30:00Z',
  })
  timestamp!: string;
}
