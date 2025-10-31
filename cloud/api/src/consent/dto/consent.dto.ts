// DTOs for consent management

import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class ConsentDto {
  @IsBoolean()
  @IsNotEmpty()
  dataProcessing!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  termsAndPrivacy!: boolean;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsNotEmpty()
  version!: string;
}

export class ConsentSubmissionDto {
  @IsBoolean()
  @IsNotEmpty()
  dataProcessing!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  termsAndPrivacy!: boolean;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class ConsentValidationResponseDto {
  @IsBoolean()
  @IsNotEmpty()
  hasValidConsent!: boolean;

  @IsString()
  @IsOptional()
  consentDate?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}
