// test/diagnostics-file-only.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DiagnosticsService } from '../src/diagnostics/diagnostics.service';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { GoogleDriveService } from '../src/storage/google-drive.service';

describe('Diagnostics File Only Upload (e2e)', () => {
  let app: INestApplication;
  let testFilePath: string;
  let jsFilePath: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleDriveService)
      .useValue({
        uploadBuffer: jest
          .fn()
          .mockImplementation((buffer: Buffer, name: string) =>
            Promise.resolve(`https://drive.mock/${name}`),
          ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    (global as any).FILES = {
      put: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(Buffer.from('data')),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    await app.init();

    // Criar arquivos de teste temporários
    testFilePath = join(__dirname, 'test-file.txt');
    writeFileSync(testFilePath, 'console.log("Hello World");\nconst x = 42;');

    jsFilePath = join(__dirname, 'test-script.js');
    writeFileSync(
      jsFilePath,
      `
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(10, 20);
console.log('Result:', result);
    `,
    );
  });

  afterAll(async () => {
    await app.close();
    delete (global as any).FILES;
    // Limpar arquivos de teste
    try {
      unlinkSync(testFilePath);
      unlinkSync(jsFilePath);
    } catch (error) {
      // Arquivos podem não existir
    }
  });

  describe('POST /diagnostics/submit - File Only', () => {
    it('should process text file with only file field', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('resumo');
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('textExtracted');
      expect(response.body).toHaveProperty('audioUrl');
      expect(response.body.textExtracted).toContain(
        'console.log("Hello World");',
      );
    }, 30000);

    it('should process JavaScript file with only file field', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', jsFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('resumo');
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('textExtracted');
      expect(response.body).toHaveProperty('audioUrl');
      expect(response.body.textExtracted).toContain('function calculateSum');
    }, 30000);

    it('should reject request without file', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('File is required');
    }, 30000);

    it('should handle empty file upload', async () => {
      // Criar arquivo vazio para teste
      const emptyFilePath = join(__dirname, 'empty-file.txt');
      writeFileSync(emptyFilePath, '');

      try {
        const response = await request(app.getHttpServer())
          .post('/diagnostics/submit')
          .attach('file', emptyFilePath)
          .expect(201);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('resumo');
        expect(response.body).toHaveProperty('text');
        expect(response.body).toHaveProperty('textExtracted', '');
        expect(response.body).toHaveProperty('audioUrl');
        expect(response.body.text).toContain(
          'Análise simulado para empty-file.txt',
        );
      } finally {
        // Limpar arquivo vazio
        try {
          unlinkSync(emptyFilePath);
        } catch (error) {
          // Arquivo pode não existir
        }
      }
    }, 30000);

    it('should handle large text file', async () => {
      // Criar arquivo grande para teste
      const largeFilePath = join(__dirname, 'large-text-file.txt');
      const largeContent = 'console.log("Large file test");\n'.repeat(500);
      writeFileSync(largeFilePath, largeContent);

      try {
        const response = await request(app.getHttpServer())
          .post('/diagnostics/submit')
          .attach('file', largeFilePath)
          .expect(201);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('text');
        expect(response.body).toHaveProperty('audioUrl');
      } finally {
        // Limpar arquivo grande
        try {
          unlinkSync(largeFilePath);
        } catch (error) {
          // Arquivo pode não existir
        }
      }
    }, 30000);
  });
});
