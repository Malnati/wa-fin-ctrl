// api/src/auth/dto/auth-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AuthRequestDto {
  @ApiProperty({
    description: 'Google OAuth credential token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  credential!: string;

  @ApiProperty({
    description: 'Client ID for OAuth verification',
    example: '123456789-abcdef.apps.googleusercontent.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'Additional authentication context',
    example: 'chrome-extension',
    required: false,
  })
  @IsString()
  @IsOptional()
  context?: string;
}
