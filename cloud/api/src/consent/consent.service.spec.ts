// Consent service tests

import { Test, TestingModule } from '@nestjs/testing';
import { ConsentService } from './consent.service';
import { ConsentSubmissionDto } from './dto/consent.dto';

describe('ConsentService', () => {
  let service: ConsentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsentService],
    }).compile();

    service = module.get<ConsentService>(ConsentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should submit and store consent', async () => {
    const consentData: ConsentSubmissionDto = {
      dataProcessing: true,
      termsAndPrivacy: true,
      userEmail: 'test@example.com',
    };

    const result = await service.submitConsent(consentData);

    expect(result).toBeDefined();
    expect(result.userEmail).toBe('test@example.com');
    expect(result.dataProcessing).toBe(true);
    expect(result.termsAndPrivacy).toBe(true);
    expect(result.isActive).toBe(true);
  });

  it('should validate valid consent', async () => {
    const consentData: ConsentSubmissionDto = {
      dataProcessing: true,
      termsAndPrivacy: true,
      userEmail: 'test@example.com',
    };

    await service.submitConsent(consentData);
    const validation = await service.validateConsent('test@example.com');

    expect(validation.hasValidConsent).toBe(true);
    expect(validation.version).toBe('1.0.0');
  });

  it('should not validate missing consent', async () => {
    const validation = await service.validateConsent('nonexistent@example.com');

    expect(validation.hasValidConsent).toBe(false);
  });

  it('should revoke consent', async () => {
    const consentData: ConsentSubmissionDto = {
      dataProcessing: true,
      termsAndPrivacy: true,
      userEmail: 'test@example.com',
    };

    await service.submitConsent(consentData);
    const revoked = await service.revokeConsent('test@example.com');
    const validation = await service.validateConsent('test@example.com');

    expect(revoked).toBe(true);
    expect(validation.hasValidConsent).toBe(false);
  });

  it('should reject incomplete consent', async () => {
    const incompleteConsent: ConsentSubmissionDto = {
      dataProcessing: false,
      termsAndPrivacy: true,
      userEmail: 'test@example.com',
    };

    await expect(service.submitConsent(incompleteConsent)).rejects.toThrow(
      'Both data processing and terms consent are required',
    );
  });

  it('should get consent history', async () => {
    const consentData: ConsentSubmissionDto = {
      dataProcessing: true,
      termsAndPrivacy: true,
      userEmail: 'test@example.com',
    };

    await service.submitConsent(consentData);
    const history = await service.getConsentHistory('test@example.com');

    expect(history).toHaveLength(1);
    expect(history[0].userEmail).toBe('test@example.com');
  });

  it('should return current version', () => {
    const version = service.getCurrentVersion();
    expect(version).toBe('1.0.0');
  });

  it('should perform health check', async () => {
    const health = await service.healthCheck();
    expect(health.status).toBe('healthy');
    expect(health.version).toBe('1.0.0');
    expect(typeof health.consentCount).toBe('number');
  });
});
