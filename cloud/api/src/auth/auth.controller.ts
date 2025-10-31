// api/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Logger,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MOCK_USERS_COUNT } from './constants/auth.constants';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticar usuário via Google OAuth',
    description:
      'Endpoint mock para autenticação usando credenciais Google OAuth. Retorna JWT e dados do usuário para desenvolvimento e testes.',
  })
  @ApiBody({
    description: 'Credenciais de autenticação Google OAuth',
    type: AuthRequestDto,
    examples: {
      'google-oauth': {
        summary: 'Exemplo com credencial Google',
        description: 'Payload típico de autenticação Google OAuth',
        value: {
          credential:
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzdWFyaW8uZGVtb0B5YWdub3N0aWMubG9jYWwiLCJuYW1lIjoiVXN1XHUwMGUxcmlvIERlbW8iLCJzdWIiOiIxMjM0NTY3ODkwIn0.mock-signature',
          clientId: '123456789-abcdef.apps.googleusercontent.com',
          context: 'chrome-extension',
        },
      },
      minimal: {
        summary: 'Exemplo mínimo',
        description: 'Apenas a credencial obrigatória',
        value: {
          credential:
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIn0.signature',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticação realizada com sucesso',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos ou malformados',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'credential should not be empty',
            'credential must be a string',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credencial Google inválida ou não reconhecida',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example: 'Credencial Google inválida ou não reconhecida',
        },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async authenticate(
    @Body() authRequest: AuthRequestDto,
  ): Promise<AuthResponseDto> {
    const method = 'authenticate';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { context: ${authRequest.context || 'unknown'}, hasClientId: ${!!authRequest.clientId} }`,
    );

    try {
      const result = await this.authService.authenticate(authRequest);

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, success: ${result.success}, requestId: ${result.request_id} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Status do serviço de autenticação',
    description:
      'Retorna informações sobre o status e configuração do serviço de autenticação mock.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status do serviço de autenticação',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string', example: 'auth-service' },
        status: { type: 'string', example: 'active' },
        mockUsers: { type: 'number', example: MOCK_USERS_COUNT },
        timestamp: { type: 'string', example: '2024-10-18T22:07:29.359Z' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  getStatus() {
    const method = 'getStatus';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      // Get dynamic status from auth service
      const serviceStatus = this.authService.getAuthServiceStatus();

      const result = {
        service: 'auth-service',
        status: serviceStatus.status,
        mockUsers: serviceStatus.mockUsers,
        timestamp: serviceStatus.timestamp,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, status: ${result.status} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }
}
