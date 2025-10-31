// api/src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzNDU2Nzg5YWJjZGVmIiwiZW1haWwiOiJ1c3VhcmlvLmRlbW9AeWFnbm9zdGljLmxvY2FsIiwibmFtZSI6IkpvXHUwMGUzbyBkYSBTaWx2YSIsImlhdCI6MTczNDU2Nzg5MCwiZXhwIjoxNzM0NTcxNDkwfQ.abc123def456',
  })
  access_token!: string;

  @ApiProperty({
    description: 'Token type (always Bearer for JWT)',
    example: 'Bearer',
  })
  token_type!: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expires_in!: number;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'usr_123456789abcdef',
      email: 'usuario.demo@yagnostic.local',
      name: 'João da Silva',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      email_verified: true,
    },
  })
  user!: UserDto;

  @ApiProperty({
    description: 'Authentication success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Authentication timestamp',
    example: '2024-10-18T22:07:29.359Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request correlation ID for tracking',
    example: 'req_123456789abcdef',
  })
  request_id!: string;
}
