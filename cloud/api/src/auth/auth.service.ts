// api/src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomUUID, createHmac } from 'node:crypto';
import { AuthRequestDto } from './dto/auth-request.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import {
  JWT_SECRET_MOCK,
  TOKEN_EXPIRATION_SECONDS,
  MOCK_USERS,
  MOCK_USERS_COUNT,
} from './constants/auth.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async authenticate(authRequest: AuthRequestDto): Promise<AuthResponseDto> {
    const method = 'authenticate';
    const t0 = Date.now();
    const requestId = this.generateRequestId();

    this.logger.log(
      `${method} ENTER, { requestId: ${requestId}, context: ${authRequest.context || 'unknown'} }`,
    );

    try {
      const mockUserData = this.extractMockUserFromCredential(
        authRequest.credential,
      );

      if (!mockUserData) {
        const errorMessage = 'Credencial Google inválida ou não reconhecida';
        this.logger.warn(
          `${method} AUTHENTICATION_FAILED, { requestId: ${requestId}, reason: 'invalid_credential' }`,
        );
        throw new UnauthorizedException(errorMessage);
      }

      const authResponse: AuthResponseDto = {
        access_token: this.generateMockJWT(mockUserData),
        token_type: 'Bearer',
        expires_in: TOKEN_EXPIRATION_SECONDS,
        user: mockUserData,
        success: true,
        timestamp: new Date().toISOString(),
        request_id: requestId,
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, requestId: ${requestId}, userId: ${mockUserData.id}, userEmail: ${mockUserData.email} }`,
      );

      return authResponse;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, requestId: ${requestId}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  private extractMockUserFromCredential(credential: string): UserDto | null {
    const method = 'extractMockUserFromCredential';

    try {
      if (!credential || credential.trim() === '') {
        this.logger.debug(`${method} Empty credential provided`);
        return null;
      }

      const segments = credential.split('.');

      // JWT must have exactly 3 segments (header.payload.signature)
      if (segments.length !== 3) {
        this.logger.debug(
          `${method} Invalid JWT format: expected 3 segments, got ${segments.length}`,
        );
        return null;
      }

      const base64Payload = segments[1];

      // Payload segment must not be empty
      if (!base64Payload || base64Payload.trim() === '') {
        this.logger.debug(`${method} Empty payload segment`);
        return null;
      }

      let mockUser: UserDto | null = null;

      try {
        const decodedPayload = Buffer.from(base64Payload, 'base64').toString();
        const payload = JSON.parse(decodedPayload);

        if (payload.email) {
          mockUser =
            MOCK_USERS.find((user) => user.email === payload.email) ||
            this.selectMockUserByValue(payload.email);
        } else {
          // Use deterministic selection if no email in payload
          mockUser = this.selectMockUserByValue(credential);
        }
      } catch (decodeError) {
        this.logger.debug(
          `${method} Payload decode failed: ${decodeError instanceof Error ? decodeError.message : 'unknown error'}`,
        );
        return null;
      }

      this.logger.debug(
        `${method} Mock user selected: ${mockUser?.email || 'none'}`,
      );
      return mockUser;
    } catch (error) {
      this.logger.error(
        `${method} Error extracting user data: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private selectMockUserByValue(value: string): UserDto {
    const normalized = value || '';
    const hash = Array.from(normalized).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0,
    );
    const index = Math.abs(hash) % MOCK_USERS.length;
    return MOCK_USERS[index];
  }

  private generateMockJWT(user: UserDto): string {
    const method = 'generateMockJWT';

    try {
      const header = {
        alg: 'HS256',
        typ: 'JWT',
      };

      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        email_verified: user.email_verified,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_SECONDS,
        iss: 'yagnostic-api-mock',
        aud: 'yagnostic-client',
      };

      const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
        'base64url',
      );
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        'base64url',
      );
      const signature = createHmac('sha256', JWT_SECRET_MOCK)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

      const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
      this.logger.debug(`${method} Mock JWT generated for user: ${user.email}`);
      return jwt;
    } catch (error) {
      this.logger.error(
        `${method} Error generating JWT: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error('Falha ao gerar token de autenticação');
    }
  }

  private generateRequestId(): string {
    return `req_${randomUUID()}`;
  }

  getAuthServiceStatus(): {
    status: string;
    mockUsers: number;
    timestamp: string;
  } {
    return {
      status: 'active',
      mockUsers: MOCK_USERS_COUNT,
      timestamp: new Date().toISOString(),
    };
  }
}
