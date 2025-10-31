// api/src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import {
  MOCK_USERS_COUNT,
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  TEST_USER_EMAIL,
} from './constants/auth.constants';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('authenticates successfully with a valid credential payload', async () => {
      const payload = { email: DEMO_USER_EMAIL };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        'base64',
      );
      const credential = `header.${encodedPayload}.signature`;

      const request: AuthRequestDto = {
        credential,
        clientId: 'test-client-id',
        context: 'unit-test',
      };

      const result = await service.authenticate(request);

      expect(result.success).toBe(true);
      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe(3600);
      expect(result.user.email).toBe(DEMO_USER_EMAIL);
      expect(result.user.name).toBe(DEMO_USER_NAME);
      expect(result.request_id).toMatch(/^req_/);
      expect(result.timestamp).toBeDefined();
    });

    it('selects deterministic mock user when payload decoding fails', async () => {
      // Create a credential with proper JWT format but invalid JSON payload
      const invalidJsonPayload = Buffer.from('{"email":invalid-json}').toString(
        'base64',
      );
      const request: AuthRequestDto = {
        credential: `header.${invalidJsonPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when credential is empty', async () => {
      const request: AuthRequestDto = {
        credential: '   ',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for malformed credentials without payload segment', async () => {
      const request: AuthRequestDto = {
        credential: 'foo',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for malformed credentials with empty payload segment', async () => {
      const request: AuthRequestDto = {
        credential: 'header..signature',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for malformed credentials with invalid base64 payload', async () => {
      const request: AuthRequestDto = {
        credential: 'header.invalid-base64-!@#$.signature',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('generates unique request ids per authentication', async () => {
      // Create proper JWT format credentials
      const payload = { email: TEST_USER_EMAIL };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        'base64',
      );
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      const first = await service.authenticate(request);
      const second = await service.authenticate(request);

      expect(first.request_id).not.toBe(second.request_id);
    });

    it('generates a JWT-like token structure', async () => {
      // Create proper JWT format credentials
      const payload = { email: TEST_USER_EMAIL };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        'base64',
      );
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      const result = await service.authenticate(request);
      const parts = result.access_token.split('.');

      expect(parts).toHaveLength(3);
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload_parsed = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString(),
      );

      expect(header.alg).toBe('HS256');
      expect(header.typ).toBe('JWT');
      expect(payload_parsed.email).toBeDefined();
      expect(payload_parsed.sub).toBeDefined();
      expect(payload_parsed.exp).toBeGreaterThan(payload_parsed.iat);
    });
  });

  describe('getAuthServiceStatus', () => {
    it('returns current mock status metadata', () => {
      const status = service.getAuthServiceStatus();

      expect(status.status).toBe('active');
      expect(status.mockUsers).toBe(MOCK_USERS_COUNT);
      expect(status.timestamp).toBeDefined();
    });
  });
});
