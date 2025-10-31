// test/email.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../src/email/email.service';

const sendMock = jest.fn().mockResolvedValue({});

jest.mock('googleapis', () => ({
  google: {
    gmail: jest.fn(() => ({
      users: { messages: { send: sendMock } },
    })),
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
  },
}));

describe('EmailService (e2e)', () => {
  let service: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should send message overriding all fields', async () => {
    await service.enviar(
      'id1',
      ['override@example.com'],
      'Novo Assunto',
      'Novo Corpo',
    );

    expect(sendMock).toHaveBeenCalled();
    const raw = sendMock.mock.calls[0][0].requestBody.raw;
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    expect(decoded).toContain('To: override@example.com');
    expect(decoded).toContain('Subject: Novo Assunto');
    expect(decoded).toContain('Novo Corpo');
  });

  it('should merge parameters with mensagem file', async () => {
    sendMock.mockClear();
    await service.enviar('id1', ['novo@example.com']);

    expect(sendMock).toHaveBeenCalled();
    const raw = sendMock.mock.calls[0][0].requestBody.raw;
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    expect(decoded).toContain('To: novo@example.com');
    expect(decoded).toContain('Subject: boas-vindas');
    expect(decoded).toContain('olá, como vai você? Bem-vindo ao sistema.');
  });

  it('should throw if Gmail API fails', async () => {
    sendMock.mockRejectedValueOnce(new Error('Gmail error'));
    await expect(service.enviar('id1')).rejects.toThrow('Gmail error');
  });
});
