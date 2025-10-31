// api/src/notifications/notifications.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import {
  NotificationService,
  NotificationTrigger,
} from './notification.service';
import {
  TriggerNotificationDto,
  WhatsAppNotificationDto,
  NotificationResponseDto,
  NotificationHistoryDto,
} from './dto/notifications.dto';

@ApiTags('Transactional Notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger transactional notification',
    description:
      'Triggers a transactional notification based on onboarding events (registration, approval, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification triggered successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid notification trigger data',
  })
  async triggerNotification(
    @Body() triggerDto: TriggerNotificationDto,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log({
        action: 'trigger_notification_request',
        event: triggerDto.event,
        recipients: triggerDto.recipients,
        context: triggerDto.context,
      });

      const trigger: NotificationTrigger = {
        event: triggerDto.event,
        context: triggerDto.context,
        recipients: triggerDto.recipients,
      };

      const result =
        await this.notificationService.triggerNotification(trigger);

      return {
        success: true,
        trackId: result.trackId,
        message: 'Notification triggered successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to trigger notification:', error);
      throw new BadRequestException(
        `Failed to trigger notification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send WhatsApp notification',
    description:
      'Sends a WhatsApp notification (currently mock implementation)',
  })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp notification sent successfully',
    type: NotificationResponseDto,
  })
  async sendWhatsAppNotification(
    @Body() whatsAppDto: WhatsAppNotificationDto,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log({
        action: 'whatsapp_notification_request',
        phone: whatsAppDto.phone,
        messageLength: whatsAppDto.message.length,
      });

      const result = await this.notificationService.sendWhatsAppNotification(
        whatsAppDto.phone,
        whatsAppDto.message,
      );

      return {
        success: true,
        trackId: result.trackId,
        message: 'WhatsApp notification sent successfully (mock)',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to send WhatsApp notification:', error);
      throw new BadRequestException(
        `Failed to send WhatsApp notification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get notification history',
    description: 'Retrieves the history of all sent notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved successfully',
    type: [NotificationHistoryDto],
  })
  async getNotificationHistory(): Promise<NotificationHistoryDto[]> {
    const history = this.notificationService.getNotificationHistory();

    return history.map((notification) => ({
      id: notification.id,
      type: notification.type,
      templateId: notification.templateId,
      recipients: notification.recipients,
      status: notification.status,
      sentAt: notification.sentAt,
      errorMessage: notification.errorMessage,
      trackId: notification.trackId,
    }));
  }

  @Get('track/:trackId')
  @ApiOperation({
    summary: 'Track notification status',
    description: 'Get the status of a specific notification by track ID',
  })
  @ApiParam({
    name: 'trackId',
    description: 'The track ID of the notification to check',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification status retrieved successfully',
    type: NotificationHistoryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async trackNotification(
    @Param('trackId') trackId: string,
  ): Promise<NotificationHistoryDto> {
    const notification =
      this.notificationService.getNotificationByTrackId(trackId);

    if (!notification) {
      throw new BadRequestException(
        `Notification with trackId ${trackId} not found`,
      );
    }

    return {
      id: notification.id,
      type: notification.type,
      templateId: notification.templateId,
      recipients: notification.recipients,
      status: notification.status,
      sentAt: notification.sentAt,
      errorMessage: notification.errorMessage,
      trackId: notification.trackId,
    };
  }

  @Post('retry/:trackId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry failed notification',
    description: 'Retry sending a failed notification',
  })
  @ApiParam({
    name: 'trackId',
    description: 'The track ID of the failed notification to retry',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification retry initiated successfully',
  })
  async retryNotification(
    @Param('trackId') trackId: string,
  ): Promise<NotificationResponseDto> {
    try {
      await this.notificationService.retryFailedNotification(trackId);

      return {
        success: true,
        trackId,
        message: 'Notification retry initiated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to retry notification ${trackId}:`, error);
      throw new BadRequestException(
        `Failed to retry notification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
