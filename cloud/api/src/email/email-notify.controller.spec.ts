// src/email/email-notify.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmailNotifyController } from './email-notify.controller';
import { NotifyEmailDto } from './dto/email-notify.dto';

const VALID_EMAIL_REQUEST: NotifyEmailDto = {
  destinatarios: ['user@example.com', 'admin@company.com'],
  assunto: 'Test notification',
  corpo: 'This is a test message body',
};

const VALID_EMAIL_REQUEST_WITH_ID: NotifyEmailDto = {
  ...VALID_EMAIL_REQUEST,
  id: 'custom-123',
};

describe('EmailNotifyController', () => {
  let controller: EmailNotifyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailNotifyController],
    }).compile();

    controller = module.get<EmailNotifyController>(EmailNotifyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('notifyByEmail', () => {
    it('should return success response with generated message ID', async () => {
      const result = await controller.notifyByEmail(VALID_EMAIL_REQUEST);

      expect(result.sucesso).toBe(true);
      expect(result.mensagemId).toMatch(/^msg-\d+-\d+$/);
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result.destinatariosProcessados).toBe(2);
      expect(result.mensagem).toBe(
        'Notificação processada com sucesso (modo mock)',
      );
    });

    it('should use provided custom ID when specified', async () => {
      const result = await controller.notifyByEmail(
        VALID_EMAIL_REQUEST_WITH_ID,
      );

      expect(result.sucesso).toBe(true);
      expect(result.mensagemId).toBe('custom-123');
      expect(result.destinatariosProcessados).toBe(2);
    });

    it('should handle single recipient', async () => {
      const singleRecipientRequest = {
        ...VALID_EMAIL_REQUEST,
        destinatarios: ['single@example.com'],
      };

      const result = await controller.notifyByEmail(singleRecipientRequest);

      expect(result.sucesso).toBe(true);
      expect(result.destinatariosProcessados).toBe(1);
    });

    it('should handle multiple recipients', async () => {
      const multipleRecipientsRequest = {
        ...VALID_EMAIL_REQUEST,
        destinatarios: [
          'user1@example.com',
          'user2@example.com',
          'user3@example.com',
        ],
      };

      const result = await controller.notifyByEmail(multipleRecipientsRequest);

      expect(result.sucesso).toBe(true);
      expect(result.destinatariosProcessados).toBe(3);
    });

    it('should generate unique message IDs for concurrent requests', async () => {
      const request1Promise = controller.notifyByEmail(VALID_EMAIL_REQUEST);
      const request2Promise = controller.notifyByEmail(VALID_EMAIL_REQUEST);

      const [result1, result2] = await Promise.all([
        request1Promise,
        request2Promise,
      ]);

      expect(result1.mensagemId).not.toBe(result2.mensagemId);
      expect(result1.sucesso).toBe(true);
      expect(result2.sucesso).toBe(true);
    });
  });
});
