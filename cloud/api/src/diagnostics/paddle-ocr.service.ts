// Caminho relativo ao projeto: src/diagnostics/paddle-ocr.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import pdfParse from 'pdf-parse';
import pdf2pic from 'pdf2pic';
import { spawn } from 'child_process';

@Injectable()
export class PaddleOcrService {
  private readonly logger = new Logger(PaddleOcrService.name);

  async extractTextWithPaddle(
    pdfBuffer: Buffer,
    filename: string,
  ): Promise<string> {
    const method = 'extractTextWithPaddle';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { filename, bufferSize: pdfBuffer?.length }`,
    );

    try {
      this.logger.log(`[PaddleOCR] Iniciando processamento para: ${filename}`);
      const tempDir = path.join(os.tmpdir(), 'paddle-ocr', crypto.randomUUID());
      fs.mkdirSync(tempDir, { recursive: true });

      const tempPdfPath = path.join(tempDir, `${crypto.randomUUID()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      const options = {
        density: 300,
        saveFilename: 'page',
        savePath: tempDir,
        format: 'png',
        width: 2480,
        height: 3508,
      };

      const convert = pdf2pic.fromPath(tempPdfPath, options);
      const pageCount = await this.getPageCount(tempPdfPath);
      let extractedText = '';

      for (let i = 1; i <= pageCount; i++) {
        this.logger.log(`[PaddleOCR] Processando página ${i}/${pageCount}`);
        const result = await convert(i);
        if (result && result.path) {
          try {
            const text = await this.runPaddle(result.path);
            if (text.trim()) {
              extractedText += `\n--- PÁGINA ${i} ---\n${text}\n`;
            }
          } catch (err) {
            this.logger.error(
              `[PaddleOCR] Erro ao processar página ${i}:`,
              err,
            );
            extractedText += `\n--- PÁGINA ${i} ---\n[Erro ao processar esta página]\n`;
          } finally {
            if (fs.existsSync(result.path)) {
              fs.unlinkSync(result.path);
            }
          }
        }
      }

      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      const result = extractedText.trim();
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultLength: result.length, pageCount }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      throw error;
    }
  }

  private runPaddle(imagePath: string): Promise<string> {
    const method = 'runPaddle';
    return new Promise((resolve, reject) => {
      try {
        const proc = spawn('paddleocr', [
          '--image_path',
          imagePath,
          '--lang',
          'pt',
        ]);
        let output = '';
        proc.stdout.on('data', (data) => {
          output += data.toString();
        });
        proc.stderr.on('data', (data) => {
          this.logger.debug(`[PaddleOCR] ${data}`);
        });
        proc.on('error', (err) => {
          this.logger.error(`${method} ERROR`, err as Error);
          reject(err);
        });
        proc.on('close', (code) => {
          if (code === 0) {
            resolve(output);
          } else {
            const err = new Error(`paddleocr exited with code ${code}`);
            this.logger.error(`${method} ERROR`, err);
            reject(err);
          }
        });
      } catch (error) {
        this.logger.error(`${method} ERROR`, error as Error);
        reject(error);
      }
    });
  }

  private async getPageCount(pdfPath: string): Promise<number> {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.numpages || 1;
    } catch {
      return 1;
    }
  }
}
