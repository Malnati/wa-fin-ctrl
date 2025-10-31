// test/diagnostics-upload.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DiagnosticsService } from '../src/diagnostics/diagnostics.service';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { GoogleDriveService } from '../src/storage/google-drive.service';

describe('Diagnostics Upload (e2e)', () => {
  let app: INestApplication;
  let testFilePath: string;

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

    // Criar arquivo de teste temporário
    testFilePath = join(__dirname, 'test-file.txt');
    writeFileSync(testFilePath, 'console.log("Hello World");');
  });

  afterAll(async () => {
    await app.close();
    delete (global as any).FILES;
    // Limpar arquivo de teste
    try {
      unlinkSync(testFilePath);
    } catch (error) {
      // Arquivo pode não existir
    }
  });

  describe('POST /diagnostics/submit', () => {
    it('should handle file upload with multipart/form-data', async () => {
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

    it('should handle large file upload', async () => {
      // Criar arquivo grande para teste
      const largeFilePath = join(__dirname, 'large-file.txt');
      const largeContent = 'console.log("Large file test");\n'.repeat(1000);
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

    it('should reject request without file', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('File is required');
    }, 30000);
  });
});
