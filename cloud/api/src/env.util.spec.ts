// src/env.util.spec.ts
import { validateEnv } from './env.util';

describe('validateEnv', () => {
  const exitSpy = jest
    .spyOn(process, 'exit')
    .mockImplementation((() => undefined) as any);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    exitSpy.mockClear();
    errorSpy.mockClear();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.TTS_PROVIDER_API_KEY;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.TTS_PROVIDER;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REDIRECT_URI;
    delete process.env.GOOGLE_REFRESH_TOKEN;
  });

  afterAll(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should not exit when google vars are defined', () => {
    process.env.TTS_PROVIDER = 'google';
    process.env.OPENROUTER_API_KEY = 'key';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/creds.json';
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost';
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';
    validateEnv();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should exit when OPENROUTER_API_KEY is missing', () => {
    process.env.TTS_PROVIDER = 'google';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/creds.json';
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost';
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';
    validateEnv();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });
  it('should exit when TTS_PROVIDER_API_KEY is missing for provider elevenlabs', () => {
    process.env.TTS_PROVIDER = 'elevenlabs';
    process.env.OPENAI_API_KEY = 'key';
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost';
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';
    process.env.OPENROUTER_API_KEY = 'key';
    validateEnv();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should not exit when elevenlabs vars are defined', () => {
    process.env.TTS_PROVIDER = 'elevenlabs';
    process.env.OPENROUTER_API_KEY = 'key';
    process.env.TTS_PROVIDER_API_KEY = 'elevenlabs-key';
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost';
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';
    validateEnv();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
