// api/src/modules/whatsapp/whatsapp.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, basename, parse, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import AdmZip from 'adm-zip';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import type { Express } from 'express';
import { OpenRouterService } from '../../openrouter/openrouter.service';

const EXTRACTED_DIR = join(process.cwd(), 'extracted');
const TEMP_DIR_PREFIX = 'wa-zip-';
const RECEIPT_EXTRACTION_PROMPT = `
Você recebe comprovantes financeiros (PDFs ou imagens). Extraia o texto OCR completo mantendo a ordem natural das informações, incluindo cabeçalhos, valores, datas, identificadores e observações relevantes. Retorne apenas o texto contínuo (sem formatação Markdown) pronto para ser analisado posteriormente.
`.trim();
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.bmp',
  '.tiff',
  '.tif',
  '.gif',
]);
const DEFAULT_FILE_BASENAME = 'arquivo';
const JSON_FILE_EXTENSION = '.json';
const BASE64_ENCODING: BufferEncoding = 'base64';
const UTF8_ENCODING: BufferEncoding = 'utf8';
const DEFAULT_PAGE_WIDTH_POINTS = 612; // 8.5 pol * 72
const DEFAULT_PAGE_HEIGHT_POINTS = 792; // 11 pol * 72

interface ExtractedFileDescriptor {
  origem: string;
  sanitizedName: string;
  extension: string;
  absolutePath: string;
}

interface ProcessedFileResult {
  origem: string;
  jsonPath: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async processZip(file: Express.Multer.File): Promise<ProcessedFileResult[]> {
    const method = 'processZip';
    const t0 = Date.now();

    if (!file) {
      throw new BadRequestException(
        'Arquivo ZIP obrigatório não foi fornecido.',
      );
    }

    const fileExtension = extname(file.originalname || '').toLowerCase();

    if (fileExtension !== '.zip') {
      throw new BadRequestException('Apenas arquivos ZIP são aceitos.');
    }

    const tempRoot = await this.createTempDirectory();
    try {
      const descriptors = await this.extractAllowedFiles(file, tempRoot);

      if (descriptors.length === 0) {
        throw new BadRequestException(
          'Nenhum arquivo PDF ou de imagem foi encontrado no ZIP.',
        );
      }

      await fs.mkdir(EXTRACTED_DIR, { recursive: true });

      const results: ProcessedFileResult[] = [];

      for (const descriptor of descriptors) {
        const destinationPath = await this.moveToExtracted(descriptor);
        const extraction = await this.extractTextFromFile(destinationPath);
        const jsonPath = await this.persistExtraction(
          descriptor.origem,
          destinationPath,
          extraction,
        );
        results.push({ origem: descriptor.origem, jsonPath });
      }

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, processed: ${results.length} }`,
      );

      return results;
    } finally {
      await this.cleanupTempDirectory(tempRoot);
      await this.removeUploadedZip(file);
    }
  }

  private async extractAllowedFiles(
    file: Express.Multer.File,
    tempRoot: string,
  ): Promise<ExtractedFileDescriptor[]> {
    const method = 'extractAllowedFiles';
    this.logger.log(
      `${method} ENTER, { originalName: ${file.originalname}, size: ${file.size} }`,
    );

    const buffer =
      file.buffer && file.buffer.length > 0
        ? file.buffer
        : await fs.readFile(this.resolveZipPath(file));

    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const descriptors: ExtractedFileDescriptor[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) {
        continue;
      }

      const normalizedEntryName = this.normalizeEntryName(entry.entryName);
      const extension = extname(normalizedEntryName).toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        continue;
      }

      const sanitizedFileName = await this.ensureUniqueName(
        tempRoot,
        this.sanitizeFileName(normalizedEntryName),
      );
      const absolutePath = join(tempRoot, sanitizedFileName);

      await fs.mkdir(dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, entry.getData());

      descriptors.push({
        origem: basename(normalizedEntryName),
        sanitizedName: sanitizedFileName,
        extension,
        absolutePath,
      });
    }

    this.logger.log(
      `${method} EXIT, { extracted: ${descriptors.length}, tempRoot: ${tempRoot} }`,
    );

    return descriptors;
  }

  private async moveToExtracted(
    descriptor: ExtractedFileDescriptor,
  ): Promise<string> {
    const destinationName = await this.ensureUniqueName(
      EXTRACTED_DIR,
      descriptor.sanitizedName,
    );
    const destinationPath = join(EXTRACTED_DIR, destinationName);

    try {
      await fs.rename(descriptor.absolutePath, destinationPath);
    } catch (error: any) {
      if (error?.code === 'EXDEV') {
        await fs.copyFile(descriptor.absolutePath, destinationPath);
        await fs.unlink(descriptor.absolutePath);
      } else {
        throw error;
      }
    }

    return destinationPath;
  }

  private async extractTextFromFile(filePath: string): Promise<string> {
    const method = 'extractTextFromFile';
    const extension = extname(filePath).toLowerCase();
    const { name } = parse(filePath);

    let buffer: Buffer;
    let filename = `${name}.pdf`;

    if (extension === '.pdf') {
      buffer = await fs.readFile(filePath);
      filename = basename(filePath);
    } else {
      const imageBuffer = await fs.readFile(filePath);
      buffer = await this.convertImageToPdf(imageBuffer);
    }

    const base64 = buffer.toString(BASE64_ENCODING);

    const result = await this.openRouterService.submitPdfBase64(base64, {
      prompt: RECEIPT_EXTRACTION_PROMPT,
      filename,
    });

    return result.trim();
  }

  private async persistExtraction(
    originalName: string,
    filePath: string,
    extractedText: string,
  ): Promise<string> {
    const jsonFileName = await this.ensureUniqueName(
      EXTRACTED_DIR,
      `${this.getBaseName(filePath)}${JSON_FILE_EXTENSION}`,
    );
    const jsonPath = join(EXTRACTED_DIR, jsonFileName);

    const payload = {
      origem: originalName,
      extected: extractedText,
    };

    await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), {
      encoding: UTF8_ENCODING,
    });

    return jsonPath;
  }

  private async convertImageToPdf(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = (metadata.width ?? DEFAULT_PAGE_WIDTH_POINTS) as number;
    const height = (metadata.height ?? DEFAULT_PAGE_HEIGHT_POINTS) as number;

    return await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ autoFirstPage: false });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error) => reject(error));

      doc.addPage({ size: [width, height] });
      doc.image(imageBuffer, 0, 0, { width, height });
      doc.end();
    });
  }

  private sanitizeFileName(entryName: string): string {
    const { name, ext } = parse(entryName);
    const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_') || DEFAULT_FILE_BASENAME;
    const sanitizedExt = ext ? ext.toLowerCase() : '';
    return `${sanitizedName}${sanitizedExt}`;
  }

  private async ensureUniqueName(directory: string, fileName: string) {
    let candidate = fileName;
    let counter = 1;

    while (await this.pathExists(join(directory, candidate))) {
      const { name, ext } = parse(fileName);
      candidate = `${name}-${counter}${ext}`;
      counter += 1;
    }

    return candidate;
  }

  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  private normalizeEntryName(entryName: string): string {
    const normalized = entryName.replace(/\\/g, '/');
    const resolved = normalized
      .split('/')
      .filter((segment) => segment && segment !== '.')
      .join('/');

    const clean = resolved.trim();

    if (!clean) {
      throw new BadRequestException(
        'Arquivo ZIP contém nomes de arquivo inválidos.',
      );
    }

    const normalizedPath = clean.replace(/^\//, '');

    if (normalizedPath.includes('..') || isAbsolute(normalizedPath)) {
      throw new BadRequestException(
        'Arquivo ZIP contém caminhos inválidos ou perigosos.',
      );
    }

    return normalizedPath;
  }

  private async createTempDirectory(): Promise<string> {
    const dir = join(tmpdir(), `${TEMP_DIR_PREFIX}${randomUUID()}`);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  private async cleanupTempDirectory(dir: string): Promise<void> {
    if (!dir) {
      return;
    }

    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(
        `cleanupTempDirectory WARN, { dir: ${dir}, error: ${String(error)} }`,
      );
    }
  }

  private async removeUploadedZip(file: Express.Multer.File): Promise<void> {
    if (!file?.path) {
      return;
    }

    try {
      await fs.unlink(file.path);
    } catch (error) {
      this.logger.warn(
        `removeUploadedZip WARN, { path: ${file.path}, error: ${String(error)} }`,
      );
    }
  }

  private resolveZipPath(file: Express.Multer.File): string {
    if (!file.path) {
      throw new BadRequestException(
        'Não foi possível acessar o arquivo ZIP armazenado.',
      );
    }
    return file.path;
  }

  private getBaseName(filePath: string): string {
    const { name } = parse(filePath);
    return name;
  }
}
