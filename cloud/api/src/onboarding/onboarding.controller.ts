// api/src/onboarding/onboarding.controller.ts
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  OnboardingService,
  UserRegistrationData,
  UserApprovalData,
} from './onboarding.service';
import {
  UserRegistrationDto,
  UserApprovalDto,
  OnboardingResponseDto,
} from './dto/onboarding.dto';

@ApiTags('User Onboarding')
@Controller('onboarding')
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle user registration',
    description:
      'Processes user registration and triggers welcome notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'User registration processed successfully',
    type: OnboardingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid registration data',
  })
  async registerUser(
    @Body() registrationDto: UserRegistrationDto,
  ): Promise<OnboardingResponseDto> {
    try {
      this.logger.log({
        action: 'user_registration_request',
        email: registrationDto.email,
        name: registrationDto.name,
      });

      const userData: UserRegistrationData = {
        email: registrationDto.email,
        name: registrationDto.name,
        company: registrationDto.company,
      };

      const result =
        await this.onboardingService.handleUserRegistration(userData);

      return {
        success: true,
        trackId: result.trackId,
        message:
          'User registration processed successfully. Welcome email sent.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to process user registration:', error);
      throw new BadRequestException(
        `Failed to process registration: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve user account',
    description: 'Approves a user account and triggers approval notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'User account approved successfully',
    type: OnboardingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid approval data',
  })
  async approveUser(
    @Body() approvalDto: UserApprovalDto,
  ): Promise<OnboardingResponseDto> {
    try {
      this.logger.log({
        action: 'user_approval_request',
        email: approvalDto.email,
        approvedBy: approvalDto.approvedBy,
      });

      const approvalData: UserApprovalData = {
        email: approvalDto.email,
        approvedBy: approvalDto.approvedBy,
        approvalDate: new Date(),
      };

      const result =
        await this.onboardingService.handleAccountApproval(approvalData);

      return {
        success: true,
        trackId: result.trackId,
        message: 'User account approved successfully. Approval email sent.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to approve user account:', error);
      throw new BadRequestException(
        `Failed to approve account: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Post('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send pending account notification',
    description: 'Sends a notification about pending account status',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending notification sent successfully',
    type: OnboardingResponseDto,
  })
  async sendPendingNotification(
    @Body() body: { email: string },
  ): Promise<OnboardingResponseDto> {
    try {
      this.logger.log({
        action: 'pending_notification_request',
        email: body.email,
      });

      const result = await this.onboardingService.handleAccountPending(
        body.email,
      );

      return {
        success: true,
        trackId: result.trackId,
        message: 'Pending account notification sent successfully.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to send pending notification:', error);
      throw new BadRequestException(
        `Failed to send notification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Post('diagnostic-ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send diagnostic ready notification',
    description: 'Notifies user that their diagnostic is ready',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic ready notification sent successfully',
    type: OnboardingResponseDto,
  })
  async sendDiagnosticReadyNotification(
    @Body() body: { email: string; diagnosticId: string },
  ): Promise<OnboardingResponseDto> {
    try {
      this.logger.log({
        action: 'diagnostic_ready_notification_request',
        email: body.email,
        diagnosticId: body.diagnosticId,
      });

      const result = await this.onboardingService.handleDiagnosticReady(
        body.email,
        body.diagnosticId,
      );

      return {
        success: true,
        trackId: result.trackId,
        message: 'Diagnostic ready notification sent successfully.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to send diagnostic ready notification:', error);
      throw new BadRequestException(
        `Failed to send notification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
