// api/src/auth/auth.security.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';

describe('AuthService - Security Tests', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Malformed Credentials Security Tests', () => {
    it('should reject null credentials', async () => {
      const request: AuthRequestDto = {
        credential: null as any,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject undefined credentials', async () => {
      const request: AuthRequestDto = {
        credential: undefined as any,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject empty string credentials', async () => {
      const request: AuthRequestDto = {
        credential: '',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject whitespace-only credentials', async () => {
      const request: AuthRequestDto = {
        credential: '   \t\n   ',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with insufficient segments', async () => {
      const request: AuthRequestDto = {
        credential: 'header.payload', // Missing signature
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with too many segments', async () => {
      const request: AuthRequestDto = {
        credential: 'header.payload.signature.extra',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with empty payload segment', async () => {
      const request: AuthRequestDto = {
        credential: 'header..signature',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with whitespace-only payload segment', async () => {
      const payloadSegment = Buffer.from('   ').toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${payloadSegment}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Injection Attack Security Tests', () => {
    it('should reject SQL injection attempts in credentials', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const request: AuthRequestDto = {
        credential: sqlInjection,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject XSS injection attempts in credentials', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const request: AuthRequestDto = {
        credential: xssPayload,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject path traversal attempts in credentials', async () => {
      const pathTraversal = '../../etc/passwd';
      const request: AuthRequestDto = {
        credential: pathTraversal,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with malicious JSON payload', async () => {
      const maliciousPayload = '{"__proto__":{"isAdmin":true}}';
      const encodedPayload = Buffer.from(maliciousPayload).toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with constructor pollution attempt', async () => {
      const pollutionPayload = '{"constructor":{"prototype":{"isAdmin":true}}}';
      const encodedPayload = Buffer.from(pollutionPayload).toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Oversized Payload Security Tests', () => {
    it('should handle oversized credential payloads safely', async () => {
      const oversizedCredential = 'x'.repeat(10000);
      const request: AuthRequestDto = {
        credential: oversizedCredential,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle oversized JSON payload in base64', async () => {
      const oversizedPayload = '{"data":"' + 'x'.repeat(5000) + '"}';
      const encodedPayload = Buffer.from(oversizedPayload).toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Invalid Base64 Security Tests', () => {
    it('should reject credentials with invalid base64 characters', async () => {
      const request: AuthRequestDto = {
        credential: 'header.invalid-base64-!@#$.signature',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with malformed base64 padding', async () => {
      const request: AuthRequestDto = {
        credential: 'header.invalidbase64==extra.signature',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Binary and Control Character Security Tests', () => {
    it('should reject credentials with null bytes', async () => {
      const credentialWithNullBytes = 'header\x00payload\x00signature';
      const request: AuthRequestDto = {
        credential: credentialWithNullBytes,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with control characters', async () => {
      const credentialWithControlChars = 'header\x01\x02\x03.payload.signature';
      const request: AuthRequestDto = {
        credential: credentialWithControlChars,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with unicode control characters', async () => {
      const credentialWithUnicodeControl =
        'header\u200B\u200C.payload.signature';
      const request: AuthRequestDto = {
        credential: credentialWithUnicodeControl,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Invalid JSON Security Tests', () => {
    it('should reject credentials with invalid JSON in payload', async () => {
      const invalidJson = '{"email": invalid-json}';
      const encodedPayload = Buffer.from(invalidJson).toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with incomplete JSON objects', async () => {
      const incompleteJson = '{"email": "test@example.com"';
      const encodedPayload = Buffer.from(incompleteJson).toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject credentials with deeply nested JSON', async () => {
      // Create deeply nested object that could cause stack overflow
      const deepObject = createDeeplyNestedJson(1000);

      const encodedPayload = Buffer.from(deepObject).toString('base64');
      const request: AuthRequestDto = {
        credential: `header.${encodedPayload}.signature`,
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  function createDeeplyNestedJson(depth: number): string {
    let deepObject = '{"a":';
    for (let i = 0; i < depth; i++) {
      deepObject += '{"b":';
    }
    deepObject += '"value"';
    for (let i = 0; i < depth; i++) {
      deepObject += '}';
    }
    deepObject += '}';
    return deepObject;
  }

  describe('Error Response Security Tests', () => {
    it('should not leak sensitive information in error messages', async () => {
      const request: AuthRequestDto = {
        credential: 'invalid-credential',
      };

      await expect(service.authenticate(request)).rejects.toThrow(
        UnauthorizedException,
      );

      // Additional verification for error message content
      try {
        await service.authenticate(request);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'Credencial Google inválida ou não reconhecida',
        );
        // Ensure error message doesn't contain sensitive debug information
        expect(error.message).not.toContain('JWT');
        expect(error.message).not.toContain('base64');
        expect(error.message).not.toContain('decode');
        expect(error.message).not.toContain('JSON');
      }
    });

    it('should use consistent error messages for different invalid inputs', async () => {
      const invalidCredentials = [
        '',
        'invalid',
        'header.invalid.signature',
        null,
        undefined,
        '   ',
      ];

      const errorMessages = [];

      for (const credential of invalidCredentials) {
        try {
          await service.authenticate({ credential } as AuthRequestDto);
        } catch (error) {
          errorMessages.push(error.message);
        }
      }

      // All error messages should be the same to prevent information leakage
      const uniqueMessages = [...new Set(errorMessages)];
      expect(uniqueMessages).toHaveLength(1);
      expect(uniqueMessages[0]).toBe(
        'Credencial Google inválida ou não reconhecida',
      );
    });
  });

  const RAPID_REQUEST_COUNT = 10;

  describe('Rate Limiting Preparation Tests', () => {
    it('should handle multiple rapid authentication requests', async () => {
      const request: AuthRequestDto = {
        credential: 'invalid-credential',
      };

      // Test that the service can handle multiple rapid requests without crashing
      const promises = Array(RAPID_REQUEST_COUNT)
        .fill(0)
        .map(() => service.authenticate(request).catch((e) => e));

      const results = await Promise.all(promises);

      // All should fail with UnauthorizedException
      results.forEach((result) => {
        expect(result).toBeInstanceOf(UnauthorizedException);
      });
    });
  });
});
