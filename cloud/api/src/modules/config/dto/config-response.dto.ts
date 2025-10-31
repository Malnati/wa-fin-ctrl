// api/src/modules/config/dto/config-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

const GOOGLE_CLIENT_ID_DESCRIPTION =
  'Identificador do cliente Google para autenticação OAuth.';
const ALLOWED_ORIGINS_DESCRIPTION =
  'Lista de origens permitidas para autenticação via frontend.';

export class ConfigResponseDto {
  @ApiProperty({
    description: GOOGLE_CLIENT_ID_DESCRIPTION,
    type: String,
    example: '1234567890-abcdefgh.apps.googleusercontent.com',
  })
  googleClientId!: string;

  @ApiProperty({
    description: ALLOWED_ORIGINS_DESCRIPTION,
    type: [String],
    example: ['http://localhost:4444'],
  })
  allowedOrigins!: string[];
}
