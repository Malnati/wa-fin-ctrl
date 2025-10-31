// api/src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MOCK_USERS_COUNT } from './constants/auth.constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse: AuthResponseDto = {
    access_token: 'mock.jwt.token',
    token_type: 'Bearer',
    expires_in: 3600,
    user: {
      id: 'usr_test_001',
      email: 'test@example.com',
      name: 'Usuário de Teste',
      picture: 'https://example.com/avatar.jpg',
      email_verified: true,
    },
    success: true,
    timestamp: '2024-10-18T22:07:29.359Z',
    request_id: 'req_test_123',
  };

  const mockAuthService = {
    authenticate: jest.fn(),
    getAuthServiceStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      const authRequest: AuthRequestDto = {
        credential: 'valid.credential.token',
        clientId: 'test-client-id',
        context: 'test',
      };

      jest
        .spyOn(authService, 'authenticate')
        .mockResolvedValue(mockAuthResponse);

      const result = await controller.authenticate(authRequest);

      expect(authService.authenticate).toHaveBeenCalledWith(authRequest);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle authentication failure', async () => {
      const authRequest: AuthRequestDto = {
        credential: 'invalid.credential.token',
      };

      const error = new UnauthorizedException(
        'Credencial Google inválida ou não reconhecida',
      );
      jest.spyOn(authService, 'authenticate').mockRejectedValue(error);

      await expect(controller.authenticate(authRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.authenticate).toHaveBeenCalledWith(authRequest);
    });

    it('should handle service errors', async () => {
      const authRequest: AuthRequestDto = {
        credential: 'test.credential.token',
      };

      const error = new Error('Service error');
      jest.spyOn(authService, 'authenticate').mockRejectedValue(error);

      await expect(controller.authenticate(authRequest)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getStatus', () => {
    it('should return service status', () => {
      const mockServiceStatus = {
        status: 'active',
        mockUsers: MOCK_USERS_COUNT,
        timestamp: '2024-10-18T22:07:29.359Z',
      };

      jest
        .spyOn(authService, 'getAuthServiceStatus')
        .mockReturnValue(mockServiceStatus);

      const result = controller.getStatus();

      expect(authService.getAuthServiceStatus).toHaveBeenCalled();
      expect(result).toEqual({
        service: 'auth-service',
        status: 'active',
        mockUsers: MOCK_USERS_COUNT,
        timestamp: '2024-10-18T22:07:29.359Z',
        version: '1.0.0',
        environment: 'test',
      });
    });

    it('should handle status service errors', () => {
      const error = new Error('Status service error');
      jest.spyOn(authService, 'getAuthServiceStatus').mockImplementation(() => {
        throw error;
      });

      expect(() => controller.getStatus()).toThrow('Status service error');
    });
  });
});
