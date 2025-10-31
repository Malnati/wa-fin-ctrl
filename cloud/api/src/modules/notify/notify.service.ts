// api/src/modules/notify/notify.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotifyEmailDto, NotifyWhatsappDto } from './notify.dto';

interface WhatsappNotificationEntry {
  trackId: string;
  token: string;
  phone: string;
  receivedAt: string;
}

interface EmailNotificationEntry {
  trackId: string;
  token: string;
  email: string;
  id?: string;
  receivedAt: string;
}

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);
  private readonly emailNotifications: EmailNotificationEntry[] = [];
  private readonly whatsappNotifications: WhatsappNotificationEntry[] = [];

  async registerEmailNotification(
    dto: NotifyEmailDto,
  ): Promise<{ trackId: string }> {
    const trackId = randomUUID();
    const entry: EmailNotificationEntry = {
      trackId,
      token: dto.token,
      email: dto.email,
      id: dto.id || undefined,
      receivedAt: new Date().toISOString(),
    };
    this.emailNotifications.push(entry);
    this.logger.log(`Notificação E-mail registrada: ${JSON.stringify(entry)}`);
    return { trackId };
  }

  async registerWhatsappNotification(
    dto: NotifyWhatsappDto,
  ): Promise<{ trackId: string }> {
    const trackId = randomUUID();
    const entry: WhatsappNotificationEntry = {
      trackId,
      token: dto.token,
      phone: dto.phone,
      receivedAt: new Date().toISOString(),
    };
    this.whatsappNotifications.push(entry);
    this.logger.log(
      `Notificação WhatsApp registrada: ${JSON.stringify(entry)}`,
    );
    return { trackId };
  }

  getAllNotifications() {
    return {
      email: this.emailNotifications,
      whatsapp: this.whatsappNotifications,
    };
  }

  getAllEmailRequests() {
    return this.emailNotifications;
  }
}
