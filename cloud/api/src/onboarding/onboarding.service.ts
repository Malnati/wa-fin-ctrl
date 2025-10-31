// api/src/onboarding/onboarding.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notifications/notification.service';

export interface UserRegistrationData {
  email: string;
  name?: string;
  company?: string;
}

export interface UserApprovalData {
  email: string;
  approvedBy: string;
  approvalDate: Date;
}

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Handle user registration - triggers welcome notification
   */
  async handleUserRegistration(
    userData: UserRegistrationData,
  ): Promise<{ trackId: string }> {
    this.logger.log({
      action: 'user_registration',
      email: userData.email,
      company: userData.company,
    });

    try {
      // Trigger welcome notification to user
      const userNotification =
        await this.notificationService.triggerNotification({
          event: 'user_registered',
          recipients: [userData.email],
          context: {
            userEmail: userData.email,
            userName: userData.name,
            companyName:
              userData.company || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME,
            registrationDate: new Date().toISOString(),
            dashboardUrl: process.env.DASHBOARD_URL,
          },
        });

      // Trigger admin notification
      const adminNotification =
        await this.notificationService.triggerNotification({
          event: 'admin_notification',
          recipients: [process.env.ADMIN_EMAIL || 'admin@test.com'],
          context: {
            userEmail: userData.email,
            userName: userData.name,
            registrationDate: new Date().toISOString(),
            adminUrl: process.env.ADMIN_URL,
          },
        });

      this.logger.log({
        action: 'notifications_triggered',
        userTrackId: userNotification.trackId,
        adminTrackId: adminNotification.trackId,
      });

      return userNotification;
    } catch (error) {
      this.logger.error('Failed to handle user registration:', error);
      throw error;
    }
  }

  /**
   * Handle account approval - triggers approval notification
   */
  async handleAccountApproval(
    approvalData: UserApprovalData,
  ): Promise<{ trackId: string }> {
    this.logger.log({
      action: 'account_approval',
      email: approvalData.email,
      approvedBy: approvalData.approvedBy,
    });

    try {
      const notification = await this.notificationService.triggerNotification({
        event: 'account_approved',
        recipients: [approvalData.email],
        context: {
          userEmail: approvalData.email,
          companyName: process.env.NOTIFICATION_DEFAULT_COMPANY_NAME,
          dashboardUrl: process.env.DASHBOARD_URL,
          approvalDate: approvalData.approvalDate.toISOString(),
        },
      });

      this.logger.log({
        action: 'approval_notification_sent',
        trackId: notification.trackId,
      });

      return notification;
    } catch (error) {
      this.logger.error('Failed to handle account approval:', error);
      throw error;
    }
  }

  /**
   * Handle pending account status - triggers progress notification
   */
  async handleAccountPending(email: string): Promise<{ trackId: string }> {
    this.logger.log({
      action: 'account_pending_notification',
      email,
    });

    try {
      const notification = await this.notificationService.triggerNotification({
        event: 'account_pending',
        recipients: [email],
        context: {
          userEmail: email,
          companyName: 'Yagnostic',
        },
      });

      return notification;
    } catch (error) {
      this.logger.error(
        'Failed to handle account pending notification:',
        error,
      );
      throw error;
    }
  }

  /**
   * Handle diagnostic completion - triggers diagnostic ready notification
   */
  async handleDiagnosticReady(
    email: string,
    diagnosticId: string,
  ): Promise<{ trackId: string }> {
    this.logger.log({
      action: 'diagnostic_ready_notification',
      email,
      diagnosticId,
    });

    try {
      const notification = await this.notificationService.triggerNotification({
        event: 'diagnostic_ready',
        recipients: [email],
        context: {
          userEmail: email,
          companyName: process.env.NOTIFICATION_DEFAULT_COMPANY_NAME,
          dashboardUrl: process.env.DASHBOARD_URL,
          diagnosticId,
        },
      });

      return notification;
    } catch (error) {
      this.logger.error(
        'Failed to handle diagnostic ready notification:',
        error,
      );
      throw error;
    }
  }
}
