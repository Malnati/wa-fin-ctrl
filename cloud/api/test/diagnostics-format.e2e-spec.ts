// test/diagnostics-format.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { GoogleDriveService } from '../src/storage/google-drive.service';

describe('Diagnostics Format (e2e)', () => {
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

    // Criar arquivo de teste com conteúdo médico
    testFilePath = join(__dirname, 'test-medical.txt');
    const medicalContent = `
Resultado do exame laboratorial:
Hemoglobina: 14.2 g/dL
Glicose: 95 mg/dL
Creatinina: 0.9 mg/dL
Sódio: 140 mEq/L
Potássio: 4.0 mEq/L
Volume de sangue coletado: 5.0 mL
Temperatura: 36.5 °C
Pressão arterial: 120/80 mmHg
Frequência cardíaca: 72 bpm
Peso: 70 kg
Altura: 1.75 m
IMC: 22.9 kg/m²

Observações: Paciente apresentou valores normais em todos os parâmetros analisados.
`;
    writeFileSync(testFilePath, medicalContent);
  });

  afterAll(async () => {
    await app.close();
    delete (global as any).FILES;
  });

  describe('POST /diagnostics/submit - Format Validation', () => {
    it('should generate diagnosis with proper format and disclaimer', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('resumo');
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('textExtracted');
      expect(response.body).toHaveProperty('audioUrl');

      const diagnosisText = response.body.text;

      // Verificar se a análise termina com o disclaimer obrigatório (com ou sem aspas)
      expect(diagnosisText).toMatch(
        /Esta análise foi gerada automaticamente por inteligência artificial\.?"?$/,
      );

      // Verificar se NÃO contém frases problemáticas
      expect(diagnosisText).not.toContain('O conteúdo apresentado consiste em');
      expect(diagnosisText).not.toContain('consiste em uma descrição');
      expect(diagnosisText).not.toContain(
        'tecnologia utilizada para obter os dados',
      );
      expect(diagnosisText).not.toContain('profissional habilitado');
      expect(diagnosisText).not.toContain('análise isolada');

      // Verificar se contém análise técnica direta
      expect(diagnosisText.length).toBeGreaterThan(50);

      console.log('Análise gerada:', diagnosisText);
    }, 30000);

    it('should not identify individuals in the diagnosis', async () => {
      const response = await request(app.getHttpServer())
        .post('/diagnostics/submit')
        .attach('file', testFilePath)
        .expect(201);

      const diagnosisText = response.body.text;

      // Verificar se não identifica indivíduos específicos
      expect(diagnosisText).not.toContain('paciente');
      expect(diagnosisText).not.toContain('indivíduo');
      expect(diagnosisText).not.toContain('pessoa');
      expect(diagnosisText).not.toContain('sujeito');

      console.log('Análise sem identificação individual:', diagnosisText);
    }, 30000);
  });
});
