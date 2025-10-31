// test/diagnostics-file-url.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GoogleDriveService } from '../src/storage/google-drive.service';

describe('Diagnostics File URL (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await app.close();
    delete (global as any).FILES;
  });

  describe('POST /diagnostics/submit - File URL Validation', () => {
    it('should save original file and return fileUrl in response', async () => {
      const testContent =
        'Este é um arquivo de teste para verificar se o arquivo original é salvo.';
      const fileName = 'test-file.txt';

      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', Buffer.from(testContent), fileName)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('OK');
      expect(response.body.fileUrl).toBeDefined();
      expect(response.body.fileUrl).toMatch(
        /^https:\/\/drive\.mock\/diagnostico-\d+\.txt$/,
      );
      expect(response.body.audioUrl).toBeDefined();
      expect(response.body.audioUrl).toMatch(
        /^http:\/\/localhost:3333\/(diagnostico-\d+\.mp3|audio\.mp3)$/,
      );
    }, 30000);

    it('should handle different file types correctly', async () => {
      const testContent = 'console.log("Hello World");';
      const fileName = 'script.js';

      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', Buffer.from(testContent), fileName)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('OK');
      expect(response.body.fileUrl).toBeDefined();
      expect(response.body.fileUrl).toMatch(
        /^https:\/\/drive\.mock\/script-\d+\.js$/,
      );
      expect(response.body.audioUrl).toBeDefined();
      expect(response.body.audioUrl).toMatch(
        /^http:\/\/localhost:3333\/(diagnostico-\d+\.mp3|audio\.mp3)$/,
      );
      console.log('Arquivo JavaScript salvo:', response.body.fileUrl);
    }, 30000);

    it('should create unique filenames for multiple uploads', async () => {
      const testContent = 'Conteúdo de teste';
      const fileName = 'duplicate.txt';

      // Primeiro upload
      const response1 = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', Buffer.from(testContent), fileName)
        .expect(201);

      // Segundo upload com mesmo nome
      const response2 = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', testContent + '2', fileName)
        .expect(201);

      expect(response1.body.fileUrl).not.toBe(response2.body.fileUrl);
      expect(response1.body.fileUrl).toMatch(
        /^https:\/\/drive\.mock\/duplicate-\d+\.txt$/,
      );
      expect(response2.body.fileUrl).toMatch(
        /^https:\/\/drive\.mock\/duplicate-\d+\.txt$/,
      );

      console.log(
        'Arquivos únicos criados:',
        response1.body.fileUrl,
        'e',
        response2.body.fileUrl,
      );
    }, 30000);
  });
});
