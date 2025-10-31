// Consent controller for LGPD API endpoints

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Req,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ConsentService } from './consent.service';
import {
  ConsentSubmissionDto,
  ConsentValidationResponseDto,
} from './dto/consent.dto';
import { ConsentEntity } from './entities/consent.entity';

@Controller('consent')
@ApiTags('consent')
export class ConsentController {
  private readonly logger = new Logger(ConsentController.name);

  constructor(private readonly consentService: ConsentService) {}

  @Post('submit')
  @ApiOperation({
    summary: 'Submit user consent for LGPD compliance',
    description:
      'Records user consent for data processing and terms acceptance',
  })
  @ApiResponse({
    status: 201,
    description: 'Consent successfully recorded',
    type: ConsentEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid consent data',
  })
  async submitConsent(
    @Body() consentData: ConsentSubmissionDto,
    @Req() request: Request,
  ): Promise<ConsentEntity> {
    const method = 'submitConsent';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${consentData.userEmail}`);

    try {
      // Extract client information for audit
      const ipAddress =
        request.ip ||
        request.connection.remoteAddress ||
        (request.headers['x-forwarded-for'] as string);
      const userAgent = request.headers['user-agent'];

      const consent = await this.consentService.submitConsent(
        consentData,
        ipAddress,
        userAgent,
      );

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT - Consent recorded - durationMs: ${dt}`);

      return consent;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );

      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to record consent',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('validate/:userEmail')
  @ApiOperation({
    summary: 'Validate user consent status',
    description:
      'Checks if user has valid, current consent for data processing',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent validation result',
    type: ConsentValidationResponseDto,
  })
  async validateConsent(
    @Param('userEmail') userEmail: string,
  ): Promise<ConsentValidationResponseDto> {
    const method = 'validateConsent';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${userEmail}`);

    try {
      const validation = await this.consentService.validateConsent(userEmail);

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT - hasValidConsent: ${validation.hasValidConsent} - durationMs: ${dt}`,
      );

      return validation;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );

      throw new HttpException(
        'Failed to validate consent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history/:userEmail')
  @ApiOperation({
    summary: 'Get consent history for user',
    description: 'Returns consent history for audit purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent history',
    type: [ConsentEntity],
  })
  async getConsentHistory(
    @Param('userEmail') userEmail: string,
  ): Promise<ConsentEntity[]> {
    const method = 'getConsentHistory';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${userEmail}`);

    try {
      const history = await this.consentService.getConsentHistory(userEmail);

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT - Found ${history.length} records - durationMs: ${dt}`,
      );

      return history;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );

      throw new HttpException(
        'Failed to retrieve consent history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('revoke/:userEmail')
  @ApiOperation({
    summary: 'Revoke user consent',
    description: 'Allows user to withdraw consent (LGPD compliance)',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent successfully revoked',
  })
  @ApiResponse({
    status: 404,
    description: 'No consent found to revoke',
  })
  async revokeConsent(
    @Param('userEmail') userEmail: string,
  ): Promise<{ success: boolean; message: string }> {
    const method = 'revokeConsent';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${userEmail}`);

    try {
      const success = await this.consentService.revokeConsent(userEmail);

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT - success: ${success} - durationMs: ${dt}`,
      );

      if (!success) {
        throw new HttpException(
          'No consent found to revoke',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Consent successfully revoked',
      };
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to revoke consent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('version')
  @ApiOperation({
    summary: 'Get current consent version',
    description: 'Returns the current version of terms and privacy policy',
  })
  @ApiResponse({
    status: 200,
    description: 'Current consent version',
  })
  async getCurrentVersion(): Promise<{ version: string }> {
    return {
      version: this.consentService.getCurrentVersion(),
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Consent service health check',
    description: 'Returns health status of consent service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
  })
  async healthCheck() {
    return await this.consentService.healthCheck();
  }
}
