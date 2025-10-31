// api/src/onboarding/onboarding.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../email/email.service';

// Mock services
const mockNotificationService = {
  triggerNotification: jest
    .fn()
    .mockResolvedValue({ trackId: 'test-track-id' }),
};

const mockEmailService = {
  enviar: jest.fn().mockResolvedValue(undefined),
};

describe('OnboardingController', () => {
  let controller: OnboardingController;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        OnboardingService,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user successfully', async () => {
    const registrationDto = {
      email: 'test@example.com',
      name: 'Test User',
      company: 'Test Company',
    };

    const result = await controller.registerUser(registrationDto);

    expect(result.success).toBe(true);
    expect(result.trackId).toBeDefined();
    expect(result.message).toContain('registration processed successfully');
    expect(mockNotificationService.triggerNotification).toHaveBeenCalled();
  });

  it('should approve user successfully', async () => {
    const approvalDto = {
      email: 'test@example.com',
      approvedBy: 'admin@example.com',
    };

    const result = await controller.approveUser(approvalDto);

    expect(result.success).toBe(true);
    expect(result.trackId).toBeDefined();
    expect(result.message).toContain('approved successfully');
    expect(mockNotificationService.triggerNotification).toHaveBeenCalled();
  });

  it('should send pending notification', async () => {
    const body = { email: 'test@example.com' };

    const result = await controller.sendPendingNotification(body);

    expect(result.success).toBe(true);
    expect(result.trackId).toBeDefined();
    expect(result.message).toContain('Pending account notification sent');
  });

  it('should send diagnostic ready notification', async () => {
    const body = {
      email: 'test@example.com',
      diagnosticId: 'diag-123',
    };

    const result = await controller.sendDiagnosticReadyNotification(body);

    expect(result.success).toBe(true);
    expect(result.trackId).toBeDefined();
    expect(result.message).toContain('Diagnostic ready notification sent');
  });
});
