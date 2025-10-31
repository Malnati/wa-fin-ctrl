// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { EmailModule } from '../email/email.module';
import { EmailNotifyController } from '../email/email-notify.controller';

@Module({
  imports: [EmailModule],
  providers: [NotificationService],
  controllers: [NotificationsController, EmailNotifyController],
  exports: [NotificationService],
})
export class NotificationsModule {}
