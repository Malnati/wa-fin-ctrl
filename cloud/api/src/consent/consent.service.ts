// Consent service for LGPD compliance management

import { Injectable, Logger } from '@nestjs/common';
import {
  ConsentSubmissionDto,
  ConsentValidationResponseDto,
} from './dto/consent.dto';
import { ConsentEntity } from './entities/consent.entity';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);
  private readonly consents: Map<string, ConsentEntity> = new Map();

  // Current consent version - increment when terms change
  private readonly CURRENT_VERSION = process.env.CONSENT_VERSION || '1.0.0';

  // Consent validity period (in milliseconds) - 1 year default
  private readonly CONSENT_VALIDITY_PERIOD = parseInt(
    process.env.CONSENT_VALIDITY_PERIOD_MS || '31536000000',
    10,
  );

  /**
   * Submit and store user consent for LGPD compliance
   */
  async submitConsent(
    consentData: ConsentSubmissionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ConsentEntity> {
    const method = 'submitConsent';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${consentData.userEmail}`);

    try {
      // Validate required consent
      if (!consentData.dataProcessing || !consentData.termsAndPrivacy) {
        throw new Error('Both data processing and terms consent are required');
      }

      if (!consentData.userEmail) {
        throw new Error('User email is required for consent tracking');
      }

      // Create consent entity
      const consentId = `consent_${Date.now()}_${crypto.randomUUID()}`;
      const consent = new ConsentEntity({
        id: consentId,
        userEmail: consentData.userEmail,
        dataProcessing: consentData.dataProcessing,
        termsAndPrivacy: consentData.termsAndPrivacy,
        version: this.CURRENT_VERSION,
        timestamp: new Date(),
        ipAddress: ipAddress,
        userAgent: userAgent,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Store consent (in production, this would be saved to database)
      this.consents.set(consentData.userEmail, consent);

      // Log for audit purposes
      this.logger.log(
        `${method} - Consent recorded for ${consentData.userEmail} - ` +
          `version: ${this.CURRENT_VERSION}, dataProcessing: ${consentData.dataProcessing}, ` +
          `termsAndPrivacy: ${consentData.termsAndPrivacy}`,
      );

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT - durationMs: ${dt}`);

      return consent;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );
      throw error;
    }
  }

  /**
   * Validate if user has valid consent
   */
  async validateConsent(
    userEmail: string,
  ): Promise<ConsentValidationResponseDto> {
    const method = 'validateConsent';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${userEmail}`);

    try {
      const consent = this.consents.get(userEmail);

      if (!consent || !consent.isActive) {
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT - No active consent found - durationMs: ${dt}`,
        );
        return { hasValidConsent: false };
      }

      // Check if consent is current version
      if (consent.version !== this.CURRENT_VERSION) {
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT - Consent version outdated - durationMs: ${dt}`,
        );
        return { hasValidConsent: false };
      }

      // Check if consent is still valid (not expired)
      const consentAge = Date.now() - consent.timestamp.getTime();
      if (consentAge > this.CONSENT_VALIDITY_PERIOD) {
        const dt = Date.now() - t0;
        this.logger.log(`${method} EXIT - Consent expired - durationMs: ${dt}`);
        return { hasValidConsent: false };
      }

      // Check required consents
      if (!consent.dataProcessing || !consent.termsAndPrivacy) {
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT - Incomplete consent - durationMs: ${dt}`,
        );
        return { hasValidConsent: false };
      }

      const expiresAt = new Date(
        consent.timestamp.getTime() + this.CONSENT_VALIDITY_PERIOD,
      );

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT - Valid consent found - durationMs: ${dt}`,
      );

      return {
        hasValidConsent: true,
        consentDate: consent.timestamp.toISOString(),
        version: consent.version,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );
      return { hasValidConsent: false };
    }
  }

  /**
   * Get consent history for user (for audit purposes)
   */
  async getConsentHistory(userEmail: string): Promise<ConsentEntity[]> {
    const method = 'getConsentHistory';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${userEmail}`);

    try {
      // In production, this would query database for all consent records
      const consent = this.consents.get(userEmail);
      const history = consent ? [consent] : [];

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT - Found ${history.length} consent records - durationMs: ${dt}`,
      );

      return history;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );
      return [];
    }
  }

  /**
   * Revoke user consent (LGPD right to withdrawal)
   */
  async revokeConsent(userEmail: string): Promise<boolean> {
    const method = 'revokeConsent';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER - userEmail: ${userEmail}`);

    try {
      const consent = this.consents.get(userEmail);

      if (!consent) {
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT - No consent found to revoke - durationMs: ${dt}`,
        );
        return false;
      }

      // Mark consent as inactive
      consent.isActive = false;
      consent.updatedAt = new Date();

      this.logger.log(`${method} - Consent revoked for ${userEmail}`);

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT - durationMs: ${dt}`);

      return true;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR - ${error instanceof Error ? error.message : String(error)} - durationMs: ${dt}`,
      );
      return false;
    }
  }

  /**
   * Get current consent version
   */
  getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }

  /**
   * Health check for consent service
   */
  async healthCheck(): Promise<{
    status: string;
    consentCount: number;
    version: string;
  }> {
    return {
      status: 'healthy',
      consentCount: this.consents.size,
      version: this.CURRENT_VERSION,
    };
  }
}
