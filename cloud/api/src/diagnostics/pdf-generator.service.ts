// Caminho relativo ao projeto: src/diagnostics/pdf-generator.service.ts
import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';

import { existsSync, createWriteStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { API_BASE_URL } from '../constants/constants';

const PUBLIC_DIRECTORY = 'public';
const PDF_FILE_PREFIX = 'relatorio-';
const HTML_FILE_EXTENSION = '.html';
const PDF_FILE_EXTENSION = '.pdf';
const DEFAULT_PUBLIC_BASE_URL = API_BASE_URL;
const PDF_FALLBACK_FILENAME = 'relatorio.pdf';
const PDF_TITLE = 'Relatório de Análise';
const PDF_ANALYZED_SECTION_TITLE = 'Arquivo Analisado';
const PDF_DIAGNOSIS_SECTION_TITLE = 'Resultado da Análise';
const PDF_DISCLAIMER_MESSAGE =
  'Este relatório foi gerado automaticamente por inteligência artificial. Consulte um profissional de saúde antes de tomar qualquer decisão clínica.';
const PDF_GENERATED_AT_LABEL = 'Gerado em:';
const PDF_FILE_NAME_LABEL = 'Arquivo original:';
const PDF_UNKNOWN_FILENAME = 'não informado';
const PDF_EMPTY_DIAGNOSIS_MESSAGE = 'Diagnóstico indisponível.';
const PDF_TITLE_FONT_SIZE = 20;
const PDF_SECTION_TITLE_FONT_SIZE = 14;
const PDF_BODY_FONT_SIZE = 12;
const PDF_DISCLAIMER_FONT_SIZE = 10;
const PDF_LINE_GAP = 6;
const GREEK_SMALL_LETTER_MU = '\u03BC';
const MICRO_SIGN = '\u00B5';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  private escapeHtml(input: string): string {
    try {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    } catch (error) {
      this.logger.error('escapeHtml error', error as Error);
      return '';
    }
  }

  async generateDiagnosticPdf(
    diagnosis: string,
    originalFile: any,
    options?: { baseUrl?: string },
  ): Promise<string> {
    const method = 'generateDiagnosticPdf';
    const t0 = Date.now();
    const resolvedBaseUrl = this.resolveBaseUrl(options?.baseUrl);
    const fallbackPdfUrl = `${resolvedBaseUrl}/${PDF_FALLBACK_FILENAME}`;

    this.logger.log(
      `${method} ENTER, { diagnosisLength: ${diagnosis?.length ?? 0}, filename: ${originalFile?.originalname} }`,
    );

    try {
      const timestamp = Date.now();
      const sanitizedDiagnosis = this.normalizeDiagnosis(diagnosis);
      const resolvedFileName = this.resolveOriginalFileName(originalFile);
      const pdfFileName = `${PDF_FILE_PREFIX}${timestamp}${PDF_FILE_EXTENSION}`;
      const htmlFileName = `${PDF_FILE_PREFIX}${timestamp}${HTML_FILE_EXTENSION}`;
      const filePath = join(PUBLIC_DIRECTORY, pdfFileName);
      const htmlFilePath = join(PUBLIC_DIRECTORY, htmlFileName);

      if (!existsSync(PUBLIC_DIRECTORY)) {
        await mkdir(PUBLIC_DIRECTORY, { recursive: true });
      }

      const htmlContent = this.generateHtmlContent(diagnosis, originalFile);
      await writeFile(htmlFilePath, htmlContent, 'utf-8');

      await this.createPdfFromDiagnosis({
        diagnosis: sanitizedDiagnosis,
        fileName: resolvedFileName,
        pdfFilePath: filePath,
      });

      const result = `${resolvedBaseUrl}/${pdfFileName}`;
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, result: result, savedPath: filePath }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      console.error('Erro ao gerar PDF:', error);
      return fallbackPdfUrl;
    }
  }

  private generateHtmlContent(diagnosis: string, originalFile: any): string {
    try {
      const safeDiagnosis = this.escapeHtml(diagnosis).replace(/\n/g, '<br>');
      const timestamp = this.formatTimestamp(new Date());
      const resolvedFileName = this.resolveOriginalFileName(originalFile);
      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${PDF_TITLE}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .content { line-height: 1.6; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${PDF_TITLE}</h1>
        <p class="timestamp">${PDF_GENERATED_AT_LABEL} ${timestamp}</p>
    </div>

    <div class="section">
        <h2>${PDF_ANALYZED_SECTION_TITLE}</h2>
        <div class="content">
            <p><strong>${PDF_FILE_NAME_LABEL}</strong> ${this.escapeHtml(resolvedFileName)}</p>
        </div>
    </div>

    <div class="section">
        <h2>${PDF_DIAGNOSIS_SECTION_TITLE}</h2>
        <div class="content">
            <p>${safeDiagnosis}</p>
        </div>
    </div>
</body>
</html>`;
    } catch (error) {
      this.logger.error('generateHtmlContent error', error as Error);
      return '';
    }
  }

  private async createPdfFromDiagnosis({
    diagnosis,
    fileName,
    pdfFilePath,
  }: {
    diagnosis: string;
    fileName: string;
    pdfFilePath: string;
  }): Promise<void> {
    const effectiveDiagnosis = diagnosis || PDF_EMPTY_DIAGNOSIS_MESSAGE;
    const generatedAt = this.formatTimestamp(new Date());

    return new Promise((resolve, reject) => {
      let settled = false;
      const pdfDocument = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = createWriteStream(pdfFilePath);

      const handleError = (error: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        reject(error);
      };

      const handleFinish = () => {
        if (settled) {
          return;
        }
        settled = true;
        resolve();
      };

      pdfDocument.on('error', (error: Error) => handleError(error));
      writeStream.on('error', (error: Error) => handleError(error));
      writeStream.on('finish', () => handleFinish());

      pdfDocument.pipe(writeStream);

      pdfDocument
        .fontSize(PDF_TITLE_FONT_SIZE)
        .fillColor('black')
        .text(PDF_TITLE, { align: 'center' });

      pdfDocument.moveDown();
      pdfDocument
        .fontSize(PDF_BODY_FONT_SIZE)
        .fillColor('black')
        .text(`${PDF_GENERATED_AT_LABEL} ${generatedAt}`);

      pdfDocument.moveDown();
      pdfDocument
        .fontSize(PDF_SECTION_TITLE_FONT_SIZE)
        .text(PDF_ANALYZED_SECTION_TITLE, { underline: true });
      pdfDocument.moveDown(0.5);
      pdfDocument
        .fontSize(PDF_BODY_FONT_SIZE)
        .text(`${PDF_FILE_NAME_LABEL} ${fileName}`);

      pdfDocument.moveDown();
      pdfDocument
        .fontSize(PDF_SECTION_TITLE_FONT_SIZE)
        .text(PDF_DIAGNOSIS_SECTION_TITLE, { underline: true });
      pdfDocument.moveDown(0.5);
      pdfDocument.fontSize(PDF_BODY_FONT_SIZE).text(effectiveDiagnosis, {
        align: 'left',
        lineGap: PDF_LINE_GAP,
      });

      pdfDocument.moveDown();
      pdfDocument
        .fontSize(PDF_DISCLAIMER_FONT_SIZE)
        .fillColor('gray')
        .text(PDF_DISCLAIMER_MESSAGE, {
          align: 'left',
        });

      pdfDocument.end();
    });
  }

  private normalizeDiagnosis(diagnosis: string): string {
    if (!diagnosis) {
      return '';
    }

    return diagnosis
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(new RegExp(GREEK_SMALL_LETTER_MU, 'g'), MICRO_SIGN)
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim();
  }

  private resolveOriginalFileName(originalFile: {
    originalname?: string;
  }): string {
    if (
      originalFile?.originalname &&
      originalFile.originalname.trim().length > 0
    ) {
      return originalFile.originalname.trim();
    }

    return PDF_UNKNOWN_FILENAME;
  }

  private formatTimestamp(date: Date): string {
    try {
      return date.toLocaleString('pt-BR');
    } catch (error) {
      this.logger.warn('formatTimestamp fallback triggered', error as Error);
      return date.toISOString();
    }
  }

  private resolveBaseUrl(baseUrl?: string): string {
    const envBaseUrl = process.env.BASE_URL || DEFAULT_PUBLIC_BASE_URL;
    const candidate =
      baseUrl && baseUrl.trim().length > 0 ? baseUrl : envBaseUrl;
    return this.normalizeBaseUrl(candidate);
  }

  private normalizeBaseUrl(baseUrl: string): string {
    if (!baseUrl) {
      return DEFAULT_PUBLIC_BASE_URL;
    }

    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }
}
