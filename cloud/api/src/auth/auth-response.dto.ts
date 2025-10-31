// api/src/auth/auth-response.dto.ts
export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    provider: string;
  };
  expiresIn!: number;
}
