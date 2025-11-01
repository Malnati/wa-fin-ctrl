// src/config/api-key.validator.spec.ts
import { validateApiKeys } from './api-key.validator';

describe('validateApiKeys', () => {
  const originalEnv = { ...process.env };
  let exitSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should exit when OPENROUTER_API_KEY is missing', () => {
    delete process.env.OPENROUTER_API_KEY;

    expect(() => validateApiKeys()).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should not exit when the OpenRouter key is present', () => {
    process.env.OPENROUTER_API_KEY = 'key';

    expect(() => validateApiKeys()).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
