// cloud/api/src/modules/whatsapp/whatsapp.service.spec.ts
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import AdmZip from 'adm-zip';
import type { Express } from 'express';
import { WhatsappService } from './whatsapp.service';
import { OpenRouterService } from '../../openrouter/openrouter.service';

const TEMP_PREFIX = 'wa-zip-test-';
const SAMPLE_PDF_CONTENT = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n72 120 Td\n(Test PDF) Tj\nET\nendstream\nendobj\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n260\n%%EOF',
  'utf8',
);
const SAMPLE_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64',
);
const SAMPLE_CHAT_CONTENT = `
[18/04/2025, 12:45:53] Ricardo: <anexado: nota.pdf>
[18/04/2025, 12:46:01] Ana: <anexado: photo.png>
`;

describe('WhatsappService', () => {
  const extractedDir = join(process.cwd(), 'extracted');

  beforeEach(async () => {
    await fs.rm(extractedDir, { recursive: true, force: true });
  });

  afterAll(async () => {
    await fs.rm(extractedDir, { recursive: true, force: true });
  });

  it('should process ZIP files with receipts and persist OpenRouter responses', async () => {
    const openRouterService = {
      submitPdfBase64: jest
        .fn()
        .mockResolvedValueOnce('Texto PDF')
        .mockResolvedValueOnce('Texto imagem'),
    } as unknown as OpenRouterService;

    const service = new WhatsappService(openRouterService);

    const tempDir = mkdtempSync(join(tmpdir(), TEMP_PREFIX));
    const zipPath = join(tempDir, 'input.zip');

    const zip = new AdmZip();
    zip.addFile('docs/nota.pdf', SAMPLE_PDF_CONTENT);
    zip.addFile('media/photo.png', SAMPLE_PNG_BUFFER);
    zip.addFile('_chat.txt', Buffer.from(SAMPLE_CHAT_CONTENT, 'utf8'));
    zip.writeZip(zipPath);
    const zipBuffer = zip.toBuffer();

    const mockFile = {
      fieldname: 'file',
      originalname: 'input.zip',
      encoding: '7bit',
      mimetype: 'application/zip',
      size: zipBuffer.length,
      destination: tempDir,
      filename: 'input.zip',
      path: zipPath,
      buffer: Buffer.alloc(0),
    } as unknown as Express.Multer.File;

    try {
      const results = await service.processZip(mockFile);

      expect(results).toHaveLength(2);
      expect(openRouterService.submitPdfBase64 as any).toHaveBeenCalledTimes(2);

      const resultsByOrigem = new Map(results.map((item) => [item.origem, item]));

      const nota = resultsByOrigem.get('nota.pdf');
      const photo = resultsByOrigem.get('photo.png');

      expect(nota?.author).toBe('Ricardo');
      expect(photo?.author).toBe('Ana');

      for (const result of results) {
        const content = await fs.readFile(result.jsonPath, 'utf8');
        const payload = JSON.parse(content);
        expect(payload).toHaveProperty('origem', result.origem);
        expect(payload).toHaveProperty('author', result.author);
        expect(payload).toHaveProperty('extected');
        expect(payload.extected.length).toBeGreaterThan(0);

        const authorTxt = await fs.readFile(result.authorTxtPath, 'utf8');
        expect(authorTxt.trim()).toBe(result.author);
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
