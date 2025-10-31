// api/src/auth/auth.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from './auth.module';
import {
  MOCK_USERS_COUNT,
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
} from './constants/auth.constants';

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth', () => {
    it('should authenticate with valid Google credential', async () => {
      const mockPayload = { email: 'usuario.demo@yagnostic.local' };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        'base64',
      );
      const mockCredential = `header.${encodedPayload}.signature`;

      const authRequest = {
        credential: mockCredential,
        clientId: 'test-client-id',
        context: 'integration-test',
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.token_type).toBe('Bearer');
      expect(response.body.expires_in).toBe(3600);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(DEMO_USER_EMAIL);
      expect(response.body.user.name).toBe(DEMO_USER_NAME);
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.request_id).toMatch(/^req_/);
    });

    it('should return 400 for missing credential', async () => {
      const authRequest = {
        clientId: 'test-client-id',
        context: 'integration-test',
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(400);

      expect(response.body.message).toContain('credential should not be empty');
    });

    it('should return 400 for empty credential', async () => {
      const authRequest = {
        credential: '',
        clientId: 'test-client-id',
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(400);

      expect(response.body.message).toContain('credential should not be empty');
    });

    it('should work with minimal payload (only credential)', async () => {
      // Create a proper JWT format with valid payload
      const mockPayload = { email: DEMO_USER_EMAIL };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        'base64',
      );
      const mockCredential = `header.${encodedPayload}.signature`;

      const authRequest = {
        credential: mockCredential,
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(DEMO_USER_EMAIL); // Default user
    });

    it('should authenticate different mock users based on credential content', async () => {
      const mockPayload = { email: 'admin@yagnostic.local' };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        'base64',
      );
      const mockCredential = `header.${encodedPayload}.signature`;

      const authRequest = {
        credential: mockCredential,
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(200);

      expect(response.body.user.email).toBe('admin@yagnostic.local');
      expect(response.body.user.name).toBe('Administrador Sistema');
    });

    it('should return 401 for malformed credentials without payload segment', async () => {
      const authRequest = {
        credential: 'foo',
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(401);

      expect(response.body.message).toBe(
        'Credencial Google inválida ou não reconhecida',
      );
    });

    it('should return 401 for malformed credentials with empty payload segment', async () => {
      const authRequest = {
        credential: 'header..signature',
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(401);

      expect(response.body.message).toBe(
        'Credencial Google inválida ou não reconhecida',
      );
    });

    it('should return 401 for malformed credentials with invalid base64 payload', async () => {
      const authRequest = {
        credential: 'header.invalid-base64-!@#$.signature',
      };

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(authRequest)
        .expect(401);

      expect(response.body.message).toBe(
        'Credencial Google inválida ou não reconhecida',
      );
    });
  });

  describe('GET /auth/status', () => {
    it('should return auth service status', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/status')
        .expect(200);

      expect(response.body.service).toBe('auth-service');
      expect(response.body.status).toBe('active');
      expect(response.body.mockUsers).toBe(MOCK_USERS_COUNT);
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.environment).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
