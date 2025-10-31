// test/diagnostics-units.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { GoogleDriveService } from '../src/storage/google-drive.service';

describe('Diagnostics Units Correction (e2e)', () => {
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

    // Usar o arquivo de teste com unidades de medida
    testFilePath = join(__dirname, 'test-units.txt');
  });

  afterAll(async () => {
    await app.close();
    delete (global as any).FILES;
  });

  describe('POST /diagnostics/submit - Units Correction', () => {
    it('should correct units of measurement in diagnosis', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('resumo');
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('textExtracted');
      expect(response.body).toHaveProperty('audioUrl');

      // Verificar se o texto extraído contém as unidades originais
      expect(response.body.textExtracted).toContain('g/dL');
      expect(response.body.textExtracted).toContain('mg/dL');
      expect(response.body.textExtracted).toContain('mEq/L');
      expect(response.body.textExtracted).toContain('mL');
      expect(response.body.textExtracted).toContain('°C');
      expect(response.body.textExtracted).toContain('mmHg');
      expect(response.body.textExtracted).toContain('bpm');
      expect(response.body.textExtracted).toContain('kg');
      expect(response.body.textExtracted).toContain('kg/m²');

      // Verificar se a análise corrigida não contém as unidades originais específicas
      const diagnosisText = response.body.text;

      // Verificar unidades específicas com regex para evitar falsos positivos
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*g\/dL\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*mg\/dL\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*mEq\/L\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*mL\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*°C\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\/\d+\s*mmHg\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\s*bpm\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*kg\b/);
      expect(diagnosisText).not.toMatch(/\b\d+\.?\d*\s*kg\/m²\b/);

      // Verificar se a análise contém "unidade" ou "unidades"
      expect(diagnosisText).toMatch(/unidade|unidades/);

      console.log(
        'Análise original (textExtracted):',
        response.body.textExtracted,
      );
      console.log('Análise corrigida (text):', response.body.text);
    }, 30000);
  });
});
