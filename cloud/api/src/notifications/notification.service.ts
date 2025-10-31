// api/src/notifications/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmailService } from '../email/email.service';

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'whatsapp';
  subject?: string;
  content: string;
  variables?: string[];
}

export interface NotificationContext {
  userEmail?: string;
  userName?: string;
  companyName?: string;
  dashboardUrl?: string;
  adminUrl?: string;
  registrationDate?: string;
  [key: string]: any;
}

export interface NotificationTrigger {
  event:
    | 'user_registered'
    | 'account_approved'
    | 'account_pending'
    | 'diagnostic_ready'
    | 'admin_notification';
  context: NotificationContext;
  recipients: string[];
}

interface NotificationEntry {
  id: string;
  type: 'email' | 'whatsapp';
  templateId: string;
  recipients: string[];
  context: NotificationContext;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
  trackId: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly notifications: NotificationEntry[] = [];

  constructor(private readonly emailService: EmailService) {}

  async triggerNotification(
    trigger: NotificationTrigger,
  ): Promise<{ trackId: string }> {
    const trackId = randomUUID();

    try {
      // Map events to template IDs
      const templateMapping = {
        user_registered: 'onboarding-welcome',
        account_approved: 'account-approved',
        account_pending: 'onboarding-progress',
        diagnostic_ready: 'diagnostic-ready',
        admin_notification: 'admin-new-user',
      };

      const templateId = templateMapping[trigger.event];
      if (!templateId) {
        throw new Error(`No template found for event: ${trigger.event}`);
      }

      // Create notification entry
      const notification: NotificationEntry = {
        id: randomUUID(),
        type: 'email', // Default to email for now
        templateId,
        recipients: trigger.recipients,
        context: trigger.context,
        status: 'pending',
        trackId,
      };

      this.notifications.push(notification);

      // Send email notification
      await this.sendEmailNotification(notification);

      this.logger.log({
        action: 'notification_triggered',
        event: trigger.event,
        trackId,
        recipients: trigger.recipients,
        templateId,
      });

      return { trackId };
    } catch (error) {
      this.logger.error(
        `Failed to trigger notification for event ${trigger.event}:`,
        error,
      );
      throw error;
    }
  }

  private async sendEmailNotification(
    notification: NotificationEntry,
  ): Promise<void> {
    try {
      // Create subject and body with context variables
      const subject = this.replaceVariables(
        notification.context.companyName ||
          process.env.NOTIFICATION_DEFAULT_COMPANY_NAME ||
          'Default Company',
        notification.context,
      );
      const body = this.createEmailBody(
        notification.templateId,
        notification.context,
      );

      await this.emailService.enviar(
        notification.templateId,
        notification.recipients,
        subject,
        body,
      );

      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();

      this.logger.log({
        action: 'email_notification_sent',
        notificationId: notification.id,
        templateId: notification.templateId,
        recipients: notification.recipients,
      });
    } catch (error) {
      notification.status = 'failed';
      notification.errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error({
        action: 'email_notification_failed',
        notificationId: notification.id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  private createEmailBody(
    templateId: string,
    context: NotificationContext,
  ): string {
    // This would typically load from template files or database
    // For now, using simple template replacement
    const templates = {
      'onboarding-welcome': `Olá!

Obrigado por se cadastrar no ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME}. Sua conta está sendo revisada pela nossa equipe.

Você receberá um novo e-mail assim que sua conta for aprovada e você puder começar a usar a plataforma.

Se tiver dúvidas, entre em contato conosco.

Atenciosamente,
Equipe ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME}`,

      'account-approved': `Parabéns!

Sua conta foi aprovada por um administrador. Agora você pode fazer login e começar a usar a extensão ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME} para obter insights e relatórios assistidos por IA.

Acesse: ${context.dashboardUrl || process.env.NOTIFICATION_DEFAULT_DASHBOARD_URL}

Bem-vindo à plataforma!

Equipe ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME}`,

      'onboarding-progress': `Olá!

Sua conta está em processo de análise. Nossa equipe está revisando suas informações.

Tempo estimado: 24-48 horas

Você será notificado assim que o processo for concluído.

Atenciosamente,
Equipe ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME}`,

      'diagnostic-ready': `Olá!

Seu diagnóstico foi processado e está disponível para download.

Acesse sua conta para visualizar e baixar o relatório: ${context.dashboardUrl || process.env.NOTIFICATION_DEFAULT_DASHBOARD_URL}

Atenciosamente,
Equipe ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME}`,

      'admin-new-user': `Um novo usuário se cadastrou na plataforma e aguarda aprovação:

E-mail: ${context.userEmail}
Data: ${context.registrationDate}

Acesse o painel administrativo para revisar e aprovar: ${context.adminUrl || process.env.NOTIFICATION_DEFAULT_ADMIN_URL}

Equipe ${context.companyName || process.env.NOTIFICATION_DEFAULT_COMPANY_NAME}`,
    };

    return (templates as any)[templateId] || `Mensagem de ${templateId}`;
  }

  private replaceVariables(
    template: string,
    context: NotificationContext,
  ): string {
    let result = template;
    Object.keys(context).forEach((key) => {
      const value = context[key];
      if (typeof value === 'string') {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });
    return result;
  }

  // WhatsApp notification placeholder for future implementation
  async sendWhatsAppNotification(
    phone: string,
    message: string,
  ): Promise<{ trackId: string }> {
    const trackId = randomUUID();

    // For now, just log the WhatsApp notification
    this.logger.log({
      action: 'whatsapp_notification_mock',
      phone,
      message,
      trackId,
    });

    return { trackId };
  }

  // Get notification history
  getNotificationHistory(): NotificationEntry[] {
    return this.notifications;
  }

  // Get notification by track ID
  getNotificationByTrackId(trackId: string): NotificationEntry | undefined {
    return this.notifications.find((n) => n.trackId === trackId);
  }

  // Retry failed notifications
  async retryFailedNotification(trackId: string): Promise<void> {
    const notification = this.getNotificationByTrackId(trackId);
    if (!notification) {
      throw new Error(`Notification with trackId ${trackId} not found`);
    }

    if (notification.status !== 'failed') {
      throw new Error(`Notification ${trackId} is not in failed status`);
    }

    notification.status = 'pending';
    notification.errorMessage = undefined;

    if (notification.type === 'email') {
      await this.sendEmailNotification(notification);
    }
  }
}
