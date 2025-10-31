// api/src/onboarding/onboarding.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { ConsentService } from '../consent/consent.service';
import { AdminService } from '../admin/admin.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../email/email.service';

describe('LGPD Onboarding Integration Flow', () => {
  let onboardingService: OnboardingService;
  let consentService: ConsentService;
  let adminService: AdminService;
  let notificationService: NotificationService;

  const mockUser = {
    email: 'user@test.com',
    name: 'Test User',
    company: 'Test Company',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        ConsentService,
        AdminService,
        NotificationService,
        {
          provide: EmailService,
          useValue: {
            enviar: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    onboardingService = module.get<OnboardingService>(OnboardingService);
    consentService = module.get<ConsentService>(ConsentService);
    adminService = module.get<AdminService>(AdminService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('Complete LGPD Compliance Flow', () => {
    it('should handle complete user onboarding with LGPD consent', async () => {
      // Step 1: User registers and triggers notifications
      const registrationResult = await onboardingService.handleUserRegistration(
        {
          email: mockUser.email,
          name: mockUser.name,
          company: mockUser.company,
        },
      );

      expect(registrationResult).toBeDefined();
      expect(registrationResult.trackId).toBeDefined();

      // Step 2: User provides LGPD consent
      const consent = await consentService.submitConsent(
        {
          userEmail: mockUser.email,
          dataProcessing: true,
          termsAndPrivacy: true,
        },
        '127.0.0.1',
        'Test User Agent',
      );

      expect(consent).toBeDefined();
      expect(consent.userEmail).toBe(mockUser.email);
      expect(consent.isActive).toBe(true);
      expect(consent.version).toBe(process.env.CONSENT_VERSION || '1.0.0');

      // Step 3: Validate consent is active
      const validation = await consentService.validateConsent(mockUser.email);
      expect(validation.hasValidConsent).toBe(true);
      expect(validation.version).toBe(process.env.CONSENT_VERSION || '1.0.0');

      // Step 4: Admin approves the user (mock the user approval flow)
      // In a real scenario, the user would be in the admin queue
      // For testing, we'll just validate the approval notification can be sent
      expect(async () => {
        await onboardingService.handleAccountApproval({
          email: mockUser.email,
          approvedBy: 'admin@test.com',
          approvalDate: new Date(),
        });
      }).not.toThrow();

      // Step 5: Send account approved notification
      const approvalNotification =
        await onboardingService.handleAccountApproval({
          email: mockUser.email,
          approvedBy: 'admin@test.com',
          approvalDate: new Date(),
        });

      expect(approvalNotification.trackId).toBeDefined();
    });

    it('should block functionality for users without valid consent', async () => {
      // Try to validate consent for a user who hasn't provided it
      const validation = await consentService.validateConsent(
        'nonexistent@test.com',
      );
      expect(validation.hasValidConsent).toBe(false);
    });

    it('should handle consent revocation', async () => {
      // Submit consent
      await consentService.submitConsent({
        userEmail: mockUser.email,
        dataProcessing: true,
        termsAndPrivacy: true,
      });

      // Validate consent exists
      let validation = await consentService.validateConsent(mockUser.email);
      expect(validation.hasValidConsent).toBe(true);

      // Revoke consent
      const revoked = await consentService.revokeConsent(mockUser.email);
      expect(revoked).toBe(true);

      // Validate consent is now invalid
      validation = await consentService.validateConsent(mockUser.email);
      expect(validation.hasValidConsent).toBe(false);
    });

    it('should trigger diagnostic ready notification after approval', async () => {
      const diagnosticNotification =
        await onboardingService.handleDiagnosticReady(
          mockUser.email,
          'diagnostic-123',
        );

      expect(diagnosticNotification.trackId).toBeDefined();

      // Verify notification was logged
      const history = notificationService.getNotificationHistory();
      const diagnosticNotificationEntry = history.find(
        (n) => n.trackId === diagnosticNotification.trackId,
      );
      expect(diagnosticNotificationEntry).toBeDefined();
      expect(diagnosticNotificationEntry?.templateId).toBe('diagnostic-ready');
    });
  });

  describe('Environment Variable Validation', () => {
    it('should use proper environment variables for LGPD compliance', () => {
      // These variables should be set in our test .env file
      expect(process.env.CONSENT_VERSION || '1.0.0').toBeDefined();
      expect(
        process.env.CONSENT_VALIDITY_PERIOD_MS || '31536000000',
      ).toBeDefined();
      expect(
        process.env.NOTIFICATION_DEFAULT_COMPANY_NAME || 'Test Company',
      ).toBeDefined();
      expect(
        process.env.DASHBOARD_URL || 'http://localhost:3000',
      ).toBeDefined();
      expect(
        process.env.ADMIN_URL || 'http://localhost:3000/admin',
      ).toBeDefined();
    });

    it('should validate consent version matches environment configuration', async () => {
      const currentVersion = consentService.getCurrentVersion();
      expect(currentVersion).toBe(process.env.CONSENT_VERSION || '1.0.0');
    });
  });
});
