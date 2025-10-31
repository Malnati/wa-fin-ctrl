// Caminho relativo ao projeto: src/diagnostics/ocr.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import pdfParse from 'pdf-parse';
import pdf2pic from 'pdf2pic';
import Tesseract from 'tesseract.js';
import { PaddleOcrService } from './paddle-ocr.service';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly paddleOcrService: PaddleOcrService) {}

  /**
   * Processa um PDF escaneado usando OCR para extrair texto
   */
  async extractTextFromScannedPdf(
    pdfBuffer: any,
    filename: string,
  ): Promise<string> {
    const method = 'extractTextFromScannedPdf';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { filename, bufferSize: pdfBuffer?.length }`,
    );

    try {
      if (process.env.OCR_PROVIDER === 'paddle') {
        const result = await this.paddleOcrService.extractTextWithPaddle(
          pdfBuffer,
          filename,
        );
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT, { durationMs: dt, resultLength: result?.length, provider: 'paddle' }`,
        );
        return result;
      }

      this.logger.log(
        `${method}: iniciando processamento OCR para ${filename}`,
      );

      // Criar diretório temporário para as imagens
      const tempDir = path.join(os.tmpdir(), 'ocr');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Salvar PDF temporariamente
      const tempPdfPath = path.join(tempDir, `${crypto.randomUUID()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      // Configurar conversão PDF para imagem
      const options = {
        density: 300, // DPI alto para melhor qualidade OCR
        saveFilename: 'page',
        savePath: tempDir,
        format: 'png',
        width: 2480, // Largura padrão A4 em alta resolução
        height: 3508, // Altura padrão A4 em alta resolução
      };

      const convert = pdf2pic.fromPath(tempPdfPath, options);

      // Obter número de páginas
      const pageCount = await this.getPageCount(tempPdfPath);
      this.logger.log(`${method}: PDF tem ${pageCount} página(s)`);

      let extractedText = '';

      // Processar cada página
      for (let i = 1; i <= pageCount; i++) {
        this.logger.log(`${method}: processando página ${i}/${pageCount}`);

        try {
          // Converter página para imagem
          const result = await convert(i);

          if (result && result.path) {
            // Melhorar a imagem para OCR
            const enhancedImagePath = await this.enhanceImageForOCR(
              result.path,
            );

            // Aplicar OCR na imagem
            const pageText = await this.performOCR(enhancedImagePath);

            if (pageText.trim()) {
              extractedText += `\n--- PÁGINA ${i} ---\n${pageText}\n`;
            }

            // Limpar arquivos temporários
            this.cleanupTempFiles([result.path, enhancedImagePath]);
          }
        } catch (pageError) {
          this.logger.error(
            `${method}: falha ao processar página ${i}. Causa: conversão de PDF para imagem falhou. Solução: verificar integridade do PDF e dependências.`,
            pageError,
          );
          extractedText += `\n--- PÁGINA ${i} ---\n[Erro ao processar esta página]\n`;
        }
      }

      // Limpar arquivo PDF temporário
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      if (extractedText.trim()) {
        this.logger.log(
          `${method}: texto extraído com sucesso, ${extractedText.length} caracteres`,
        );
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT, { durationMs: dt, resultLength: extractedText.length, provider: 'tesseract' }`,
        );
        return extractedText.trim();
      }

      this.logger.warn(
        `${method}: nenhum texto via Tesseract. Causa: PDF com baixa qualidade. Solução: tentar PaddleOCR como fallback.`,
      );
      const result = await this.paddleOcrService.extractTextWithPaddle(
        pdfBuffer,
        filename,
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultLength: result?.length, provider: 'paddle-fallback' }`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `${method}: erro durante processamento OCR. Causa: falha na biblioteca Tesseract. Solução: tentar PaddleOCR ou verificar dependências.`,
        error,
      );
      this.logger.warn(`${method}: tentando PaddleOCR como fallback`);
      const result = await this.paddleOcrService.extractTextWithPaddle(
        pdfBuffer,
        filename,
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultLength: result?.length, provider: 'paddle-error-fallback' }`,
      );
      return result;
    }
  }

  /**
   * Obtém o número de páginas de um PDF
   */
  private async getPageCount(pdfPath: string): Promise<number> {
    const method = 'getPageCount';
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.numpages || 1;
    } catch (error) {
      this.logger.warn(
        `${method}: não foi possível determinar número de páginas. Causa: PDF corrompido. Solução: validar arquivo antes do OCR.`,
      );
      return 1;
    }
  }

  /**
   * Melhora a imagem para melhor resultado do OCR
   */
  private async enhanceImageForOCR(imagePath: string): Promise<string> {
    const method = 'enhanceImageForOCR';
    try {
      const enhancedPath = imagePath.replace('.png', '_enhanced.png');

      // await sharp(imagePath)
      //   .grayscale() // Converter para escala de cinza
      //   .normalize() // Normalizar contraste
      //   .sharpen() // Aplicar sharpening
      //   .png({ quality: 100 })
      //   .toFile(enhancedPath);

      // Temporariamente copiar o arquivo sem processamento
      const fs = require('fs');
      fs.copyFileSync(imagePath, enhancedPath);

      return enhancedPath;
    } catch (error) {
      this.logger.warn(
        `${method}: erro ao melhorar imagem. Causa: processamento de imagem falhou. Solução: usar arquivo original ou verificar dependências.`,
        error,
      );
      return imagePath;
    }
  }

  /**
   * Aplica OCR em uma imagem
   */
  private async performOCR(imagePath: string): Promise<string> {
    const method = 'performOCR';
    try {
      const result = await Tesseract.recognize(
        imagePath,
        'por', // Português
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.logger.debug(
                `${method}: progresso ${Math.round(m.progress * 100)}%`,
              );
            }
          },
        },
      );

      return result.data.text;
    } catch (error) {
      this.logger.error(
        `${method}: erro no OCR da imagem. Causa: reconhecimento de texto falhou. Solução: verificar qualidade da imagem ou serviço Tesseract.`,
        error,
      );
      throw new Error(
        `Falha no reconhecimento de texto: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Remove arquivos temporários
   */
  private cleanupTempFiles(filePaths: string[]): void {
    const method = 'cleanupTempFiles';
    filePaths.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        this.logger.warn(
          `${method}: erro ao remover arquivo temporário ${filePath}. Causa: permissão ou arquivo inexistente. Solução: verificar caminho e permissões.`,
          error,
        );
      }
    });
  }

  /**
   * Verifica se um PDF é escaneado (sem texto extraível)
   */
  async isScannedPdf(pdfBuffer: any): Promise<boolean> {
    const method = 'isScannedPdf';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { bufferSize: pdfBuffer?.length }`);

    try {
      const data = await pdfParse(pdfBuffer);

      // Se não há texto ou texto muito pequeno, provavelmente é escaneado
      const result = !data.text || data.text.trim().length < 50;

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, result, textLength: data.text?.length }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.warn(
        `${method}: erro ao verificar se PDF é escaneado. Causa: leitura do PDF falhou. Solução: garantir que o buffer contenha PDF válido. durationMs=${dt}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }
}
