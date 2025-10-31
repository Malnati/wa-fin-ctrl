// api/src/admin/admin.service.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  UserApprovalDto,
  UserApprovalStatus,
  ApprovalActionDto,
  ApprovalListResponseDto,
} from './dto/user-approval.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // Mock data for demonstration - in real app this would come from database
  private mockUsers: UserApprovalDto[] = [
    {
      id: '1',
      name: 'Lucas Silva',
      email: 'lucas.silva@example.com',
      registeredAt: '2024-07-26',
      status: UserApprovalStatus.PENDING,
    },
    {
      id: '2',
      name: 'Sofia Mendes',
      email: 'sofia.mendes@example.com',
      registeredAt: '2024-07-25',
      status: UserApprovalStatus.PENDING,
    },
    {
      id: '3',
      name: 'Gabriel Costa',
      email: 'gabriel.costa@example.com',
      registeredAt: '2024-07-24',
      status: UserApprovalStatus.PENDING,
    },
    {
      id: '4',
      name: 'Isabela Santos',
      email: 'isabela.santos@example.com',
      registeredAt: '2024-07-23',
      status: UserApprovalStatus.PENDING,
    },
    {
      id: '5',
      name: 'Rafael Oliveira',
      email: 'rafael.oliveira@example.com',
      registeredAt: '2024-07-22',
      status: UserApprovalStatus.PENDING,
    },
  ];

  async getPendingApprovals(): Promise<ApprovalListResponseDto> {
    const users = this.mockUsers;
    const total = users.length;
    const pending = users.filter(
      (u) => u.status === UserApprovalStatus.PENDING,
    ).length;
    const approved = users.filter(
      (u) => u.status === UserApprovalStatus.APPROVED,
    ).length;
    const rejected = users.filter(
      (u) => u.status === UserApprovalStatus.REJECTED,
    ).length;

    return {
      users,
      total,
      pending,
      approved,
      rejected,
    };
  }

  async approveUser(
    userId: string,
    approvedBy: string,
  ): Promise<UserApprovalDto> {
    const user = this.mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const previousStatus = user.status;
    user.status = UserApprovalStatus.APPROVED;
    user.approvedAt = new Date().toISOString();
    user.approvedBy = approvedBy;

    this.logger.log(`User ${user.email} approved by ${approvedBy}`);

    // Trigger email notification for status change
    if (previousStatus !== UserApprovalStatus.APPROVED) {
      await this.sendApprovalNotification(user, 'approved');
    }

    return user;
  }

  async rejectUser(
    userId: string,
    rejectedBy: string,
    reason?: string,
  ): Promise<UserApprovalDto> {
    const user = this.mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const previousStatus = user.status;
    user.status = UserApprovalStatus.REJECTED;
    user.approvedAt = new Date().toISOString();
    user.approvedBy = rejectedBy;

    this.logger.log(
      `User ${user.email} rejected by ${rejectedBy}. Reason: ${reason || 'No reason provided'}`,
    );

    // Trigger email notification for status change
    if (previousStatus !== UserApprovalStatus.REJECTED) {
      await this.sendApprovalNotification(user, 'rejected', reason);
    }

    return user;
  }

  async getUserApprovalStatus(email: string): Promise<UserApprovalStatus> {
    const user = this.mockUsers.find((u) => u.email === email);
    return user?.status || UserApprovalStatus.PENDING;
  }

  async bulkApproveUsers(
    userIds: string[],
    approvedBy: string,
  ): Promise<UserApprovalDto[]> {
    const results: UserApprovalDto[] = [];

    for (const userId of userIds) {
      try {
        const user = await this.approveUser(userId, approvedBy);
        results.push(user);
      } catch (error) {
        this.logger.error(
          `Failed to approve user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return results;
  }

  /**
   * Send email notification for approval status changes
   * In a real implementation, this would integrate with the email service
   */
  private async sendApprovalNotification(
    user: UserApprovalDto,
    action: 'approved' | 'rejected',
    reason?: string,
  ): Promise<void> {
    try {
      const subject =
        action === 'approved'
          ? 'Sua conta foi aprovada - Yagnostic'
          : 'Atualização sobre sua solicitação - Yagnostic';

      const body =
        action === 'approved'
          ? this.buildApprovalEmailBody(user)
          : this.buildRejectionEmailBody(user, reason);

      // Log the email that would be sent (in real app, use email service)
      this.logger.log(`Email notification sent to ${user.email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Body: ${body}`);

      // In real implementation, call email service:
      // await this.emailService.sendNotification({
      //   to: user.email,
      //   subject,
      //   body,
      //   template: action === 'approved' ? 'user-approval' : 'user-rejection'
      // });
    } catch (error) {
      this.logger.error(
        `Failed to send email notification to ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private buildApprovalEmailBody(user: UserApprovalDto): string {
    return `
Olá ${user.name},

Temos o prazer de informar que sua conta na plataforma Yagnostic foi aprovada!

Agora você pode:
• Acessar todos os recursos da plataforma
• Fazer upload de exames para análise
• Receber diagnósticos assistidos por IA
• Utilizar recursos de áudio e relatórios

Para acessar a plataforma, visite: [URL da plataforma]

Caso tenha dúvidas, nossa equipe de suporte está à disposição.

Atenciosamente,
Equipe Yagnostic

---
Esta é uma mensagem automática. Por favor, não responda a este e-mail.
    `.trim();
  }

  private buildRejectionEmailBody(
    user: UserApprovalDto,
    reason?: string,
  ): string {
    return `
Olá ${user.name},

Informamos que sua solicitação de acesso à plataforma Yagnostic foi analisada.

Infelizmente, não foi possível aprovar sua solicitação neste momento.
${reason ? `\nMotivo: ${reason}` : ''}

Se você acredita que isso foi um erro ou tem dúvidas sobre a decisão, entre em contato com nossa equipe de suporte através do e-mail: [email de suporte]

Agradecemos seu interesse na plataforma Yagnostic.

Atenciosamente,
Equipe Yagnostic

---
Esta é uma mensagem automática. Por favor, não responda a este e-mail.
    `.trim();
  }
}
