// src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return health check', () => {
      const result = appController.healthCheck();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return config with Google Client ID', () => {
      const result = appController.getConfig();
      expect(result).toHaveProperty('googleClientId');
      expect(
        typeof result.googleClientId === 'string' ||
          result.googleClientId === null,
      ).toBe(true);
    });

    it('should return authorized domains list', () => {
      const result = appController.getDomains();
      expect(result).toHaveProperty('domains');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.domains)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(result.total).toEqual(result.domains.length);

      // Verificar estrutura de cada domínio
      result.domains.forEach((domain) => {
        expect(domain).toHaveProperty('domain');
        expect(domain).toHaveProperty('name');
        expect(domain).toHaveProperty('description');
        expect(domain).toHaveProperty('active');
        expect(domain).toHaveProperty('type');
        expect(typeof domain.domain).toBe('string');
        expect(typeof domain.name).toBe('string');
        expect(typeof domain.description).toBe('string');
        expect(typeof domain.active).toBe('boolean');
        expect(['corporate', 'development', 'test']).toContain(domain.type);
        expect(domain.active).toBe(true); // Apenas domínios ativos devem ser retornados
      });

      // Verificar se contém pelo menos os domínios esperados
      const domainNames = result.domains.map((d) => d.domain);
      expect(domainNames).toContain('millennium.com.br');
      expect(domainNames).toContain('mbra.com.br');
    });
  });
});
