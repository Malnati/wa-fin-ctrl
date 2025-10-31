// api/src/diagnostics/integration-example.ts
/**
 * Example integration showing how to use the notification system
 * with the diagnostics module.
 *
 * This file demonstrates integration patterns but is not part of the main flow.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class DiagnosticsNotificationIntegration {
  private readonly logger = new Logger(DiagnosticsNotificationIntegration.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Example: Notify user when diagnostic is completed
   */
  async notifyDiagnosticComplete(
    userEmail: string,
    diagnosticId: string,
  ): Promise<void> {
    try {
      this.logger.log({
        action: 'diagnostic_completion_notification',
        userEmail,
        diagnosticId,
      });

      // Trigger notification that diagnostic is ready
      await this.onboardingService.handleDiagnosticReady(
        userEmail,
        diagnosticId,
      );

      this.logger.log({
        action: 'diagnostic_notification_sent',
        userEmail,
        diagnosticId,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send diagnostic completion notification:',
        error,
      );
      // Don't throw - notification failure shouldn't break the main flow
    }
  }

  /**
   * Example: Integration point for user registration from auth
   */
  async notifyNewUserRegistration(
    userEmail: string,
    userName?: string,
    company?: string,
  ): Promise<void> {
    try {
      this.logger.log({
        action: 'new_user_registration_notification',
        userEmail,
        userName,
      });

      // Trigger welcome notifications
      await this.onboardingService.handleUserRegistration({
        email: userEmail,
        name: userName,
        company: company,
      });

      this.logger.log({
        action: 'registration_notifications_sent',
        userEmail,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send user registration notifications:',
        error,
      );
      // Don't throw - notification failure shouldn't break the main flow
    }
  }

  /**
   * Example: Integration point for account approval from admin
   */
  async notifyAccountApproval(
    userEmail: string,
    approvedBy: string,
  ): Promise<void> {
    try {
      this.logger.log({
        action: 'account_approval_notification',
        userEmail,
        approvedBy,
      });

      // Trigger approval notification
      await this.onboardingService.handleAccountApproval({
        email: userEmail,
        approvedBy: approvedBy,
        approvalDate: new Date(),
      });

      this.logger.log({
        action: 'approval_notification_sent',
        userEmail,
      });
    } catch (error) {
      this.logger.error('Failed to send account approval notification:', error);
      // Don't throw - notification failure shouldn't break the main flow
    }
  }
}
