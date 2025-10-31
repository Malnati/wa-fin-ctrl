// api/src/notifications/notifications.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notification.service';
import { EmailService } from '../email/email.service';

// Mock the email service
const mockEmailService = {
  enviar: jest.fn().mockResolvedValue(undefined),
  loadMensagens: jest.fn(),
  loadDestinos: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should trigger notification successfully', async () => {
    const triggerDto = {
      event: 'user_registered' as const,
      recipients: ['test@example.com'],
      context: {
        userEmail: 'test@example.com',
        userName: 'Test User',
        companyName: 'Test Company',
      },
    };

    const result = await controller.triggerNotification(triggerDto);

    expect(result.success).toBe(true);
    expect(result.trackId).toBeDefined();
    expect(result.message).toContain('triggered successfully');
  });

  it('should send WhatsApp notification', async () => {
    const whatsAppDto = {
      phone: '+5511999999999',
      message: 'Test message',
    };

    const result = await controller.sendWhatsAppNotification(whatsAppDto);

    expect(result.success).toBe(true);
    expect(result.trackId).toBeDefined();
    expect(result.message).toContain('WhatsApp notification sent');
  });

  it('should get notification history', async () => {
    const history = await controller.getNotificationHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
