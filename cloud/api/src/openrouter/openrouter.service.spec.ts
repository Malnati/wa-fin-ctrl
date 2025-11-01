// api/src/openrouter/openrouter.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OpenRouterService } from './openrouter.service';

describe('OpenRouterService', () => {
  let service: OpenRouterService;

  const createFetchMock = (
    data: unknown,
    ok: boolean = true,
    status: number = 200,
  ) =>
    jest.fn().mockResolvedValue({
      ok,
      status,
      json: jest.fn().mockResolvedValue(data),
    });

  beforeEach(async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    process.env.OPENROUTER_PDF_MODEL = 'test-model';
    process.env.OPENROUTER_PDF_ENGINE = 'mistral-ocr';
    process.env.OPENROUTER_BASE_URL = 'https://example.com/api';
    delete process.env.OPENROUTER_COOKIE;
    delete process.env.OPENROUTER_HTTP_REFERER;
    delete process.env.OPENROUTER_APP_TITLE;

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterService],
    }).compile();

    service = module.get<OpenRouterService>(OpenRouterService);
    global.fetch = createFetchMock({
      choices: [{ message: { content: 'mock-response' } }],
    }) as any;
  });

  afterEach(() => {
    delete (global as any).fetch;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_PDF_MODEL;
    delete process.env.OPENROUTER_PDF_ENGINE;
    delete process.env.OPENROUTER_BASE_URL;
    delete process.env.OPENROUTER_COOKIE;
    delete process.env.OPENROUTER_HTTP_REFERER;
    delete process.env.OPENROUTER_APP_TITLE;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should submit pdf url', async () => {
    const result = await service.submitPdfUrl('https://example.com/doc.pdf', {
      prompt: 'Test prompt',
    });

    expect(result).toBe('mock-response');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer test-key'),
        }),
      }),
    );

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.model).toBe('test-model');
    expect(body.plugins[0].pdf.engine).toBe('mistral-ocr');
    expect(body.messages[0].content[1].file.file_data).toBe(
      'https://example.com/doc.pdf',
    );
  });

  it('should submit pdf base64 ensuring data url prefix', async () => {
    jest.clearAllMocks();
    global.fetch = createFetchMock({
      choices: [{ message: { content: 'mock-response' } }],
    }) as any;

    const result = await service.submitPdfBase64('ZHVtbXktZGF0YQ==', {
      prompt: 'Test prompt',
      filename: 'sample.pdf',
    });

    expect(result).toBe('mock-response');

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.messages[0].content[1].file.file_data).toBe(
      'data:application/pdf;base64,ZHVtbXktZGF0YQ==',
    );
  });

  it('should avoid duplicating base64 prefix when receiving data url', async () => {
    jest.clearAllMocks();
    global.fetch = createFetchMock({
      choices: [{ message: { content: 'mock-response' } }],
    }) as any;

    const dataUrl = 'data:application/pdf;base64,QUJD';
    await service.submitPdfBase64(dataUrl, {
      prompt: 'Test prompt',
      filename: 'prefixed.pdf',
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.messages[0].content[1].file.file_data).toBe(dataUrl);
  });

  it('should include optional headers when referer and title are configured', async () => {
    jest.clearAllMocks();
    process.env.OPENROUTER_HTTP_REFERER = 'https://app.example.com';
    process.env.OPENROUTER_APP_TITLE = 'Example App';

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterService],
    }).compile();

    const customService = module.get<OpenRouterService>(OpenRouterService);

    global.fetch = createFetchMock({
      choices: [{ message: { content: 'mock-response' } }],
    }) as any;

    await customService.submitPdfUrl('https://example.com/doc.pdf', {
      prompt: 'Test prompt',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer test-key'),
          'HTTP-Referer': 'https://app.example.com',
          'X-Title': 'Example App',
        }),
      }),
    );
  });

  it('should support cookie-based authentication when api key is missing', async () => {
    jest.clearAllMocks();
    delete process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_COOKIE = 'session=abc123';
    process.env.OPENROUTER_PDF_MODEL = 'test-model';
    process.env.OPENROUTER_PDF_ENGINE = 'mistral-ocr';
    process.env.OPENROUTER_BASE_URL = 'https://example.com/api';

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterService],
    }).compile();

    const cookieService = module.get<OpenRouterService>(OpenRouterService);

    global.fetch = createFetchMock({
      choices: [{ message: { content: 'mock-response' } }],
    }) as any;

    await cookieService.submitPdfUrl('https://example.com/doc.pdf', {
      prompt: 'Test prompt',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: 'session=abc123',
        }),
      }),
    );

    const headersPassed =
      (global.fetch as jest.Mock).mock.calls[0][1].headers || {};
    expect((headersPassed as Record<string, string>).Authorization).toBe(
      undefined,
    );
  });

  it('should throw descriptive error when no credentials are configured', async () => {
    jest.clearAllMocks();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_COOKIE;

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterService],
    }).compile();

    const credentialLessService =
      module.get<OpenRouterService>(OpenRouterService);

    global.fetch = jest.fn() as any;

    await expect(
      credentialLessService.submitPdfUrl('https://example.com/doc.pdf', {
        prompt: 'Test prompt',
      }),
    ).rejects.toThrow(
      'OpenRouter credentials are not configured. Set OPENROUTER_API_KEY or OPENROUTER_COOKIE.',
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fallback to mistral-ocr engine when environment variable is missing', async () => {
    delete process.env.OPENROUTER_PDF_ENGINE;

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterService],
    }).compile();

    const fallbackService = module.get<OpenRouterService>(OpenRouterService);

    global.fetch = createFetchMock({
      choices: [{ message: { content: 'mock-response' } }],
    }) as any;

    await fallbackService.submitPdfUrl('https://example.com/ocr.pdf', {
      prompt: 'Fallback prompt',
    });

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls.slice(-1)[0][1].body,
    );
    expect(body.plugins[0].pdf.engine).toBe('mistral-ocr');
  });

  it('should concatenate segmented responses into a single string', async () => {
    jest.clearAllMocks();
    global.fetch = createFetchMock({
      choices: [
        {
          message: {
            content: [
              { type: 'output_text', text: 'Parte 1. ' },
              { type: 'output_text', text: 'Parte 2.' },
            ],
          },
        },
      ],
    }) as any;

    const result = await service.submitPdfUrl('https://example.com/doc.pdf', {
      prompt: 'Test prompt',
    });

    expect(result).toBe('Parte 1. Parte 2.');
  });

  it('should throw when OpenRouter returns an error payload', async () => {
    jest.clearAllMocks();
    global.fetch = createFetchMock(
      { error: { message: 'Erro do OpenRouter' } },
      false,
      502,
    ) as any;

    await expect(
      service.submitPdfUrl('https://example.com/doc.pdf', {
        prompt: 'Test prompt',
      }),
    ).rejects.toThrow('Erro do OpenRouter');
  });

  it('should map cookie auth error to a descriptive message', async () => {
    jest.clearAllMocks();
    global.fetch = createFetchMock(
      { error: { message: 'No cookie auth credentials found' } },
      false,
      401,
    ) as any;

    await expect(
      service.submitPdfUrl('https://example.com/doc.pdf', {
        prompt: 'Test prompt',
      }),
    ).rejects.toThrow(
      'OpenRouter rejected the provided credentials. Confirm OPENROUTER_API_KEY or supply OPENROUTER_COOKIE.',
    );
  });

  it('should throw when OpenRouter does not return usable text', async () => {
    jest.clearAllMocks();
    global.fetch = createFetchMock({
      choices: [{ message: { content: [] } }],
    }) as any;

    await expect(
      service.submitPdfUrl('https://example.com/doc.pdf', {
        prompt: 'Test prompt',
      }),
    ).rejects.toThrow('OpenRouter response did not contain usable text.');
  });
});
