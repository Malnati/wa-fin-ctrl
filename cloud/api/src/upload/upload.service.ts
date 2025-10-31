// api/src/upload/upload.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UploadResponseDto } from './dto/upload-response.dto';
import * as path from 'path';
import * as crypto from 'crypto';
import { existsSync } from 'fs';
import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import {
  API_BASE_URL,
  FILE_HISTORY_UPLOADS_DIR,
  UPLOAD_METADATA_STORAGE_DIR,
} from '../constants/constants';
import { FileHistoryService } from '../file-history/file-history.service';

// Use the same upload directory as file history service for consistency
const PUBLIC_STORAGE_DIR = FILE_HISTORY_UPLOADS_DIR;
const METADATA_STORAGE_DIR = UPLOAD_METADATA_STORAGE_DIR;
const UPLOAD_FILE_PREFIX = 'upload-';
const PDF_MIME_TYPE = 'application/pdf';
const DEFAULT_BASE_URL = API_BASE_URL;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STATUS_SUCCESS = 'OK';

export interface FileMetadata {
  token: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  customName?: string;
  description?: string;
  checksum: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly fileHistoryService: FileHistoryService) {}

  async uploadFile(
    file: Express.Multer.File,
    customName?: string,
    description?: string,
    baseUrl?: string,
  ): Promise<UploadResponseDto> {
    const method = 'uploadFile';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { originalName: ${file?.originalname}, size: ${file?.size}, mimeType: ${file?.mimetype} }`,
    );

    try {
      // Validar arquivo
      this.validateFile(file);

      // Gerar token único
      const token = randomUUID();

      // Gerar checksum do arquivo
      const checksum = this.generateChecksum(file.buffer);

      // Criar diretórios se não existirem
      await this.ensureDirectoriesExist();

      // Salvar arquivo físico
      const { fileName, filePath, fileUrl } = await this.savePhysicalFile(
        file,
        token,
        baseUrl,
      );

      // Preparar metadados
      const uploadDate = new Date().toISOString();
      const metadata: FileMetadata = {
        token,
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size || 0,
        mimeType: file.mimetype,
        uploadDate,
        customName,
        description,
        checksum,
      };

      // Salvar metadados
      await this.saveMetadata(token, metadata);

      // Add to file history
      await this.fileHistoryService.addFileMetadata({
        token,
        originalName: file.originalname,
        customName,
        fileName,
        filePath, // Include the full file path for reliable deletion
        fileSize: file.size || 0,
        mimeType: file.mimetype,
        uploadDate,
        checksum,
        description,
        fileUrl,
      });

      // Preparar resposta
      const result: UploadResponseDto = {
        status: STATUS_SUCCESS,
        token,
        originalName: file.originalname,
        fileSize: file.size || 0,
        mimeType: file.mimetype,
        uploadDate,
        fileUrl,
        description,
        metadata: {
          checksum,
          customName,
        },
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, token: ${token}, fileSize: ${file.size} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: falha ao fazer upload do arquivo. durationMs=${dt}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async getFileMetadata(token: string): Promise<FileMetadata | null> {
    const method = 'getFileMetadata';
    this.logger.log(`${method} ENTER, { token: ${token} }`);

    try {
      // Validate token format to prevent path injection
      if (!this.isValidToken(token)) {
        this.logger.warn(`${method}: token inválido detectado: ${token}`);
        return null;
      }

      const metadataPath = path.join(METADATA_STORAGE_DIR, `${token}.json`);

      if (!existsSync(metadataPath)) {
        this.logger.warn(
          `${method}: arquivo de metadados não encontrado para token ${token}`,
        );
        return null;
      }

      const metadataContent = await readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent) as FileMetadata;

      this.logger.log(`${method} EXIT, { token: ${token}, found: true }`);
      return metadata;
    } catch (error) {
      this.logger.error(
        `${method}: falha ao recuperar metadados para token ${token}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi fornecido');
    }

    if (!file.size || file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (file.mimetype !== PDF_MIME_TYPE) {
      throw new BadRequestException(
        'Apenas arquivos PDF são permitidos neste endpoint',
      );
    }

    if (!file.originalname || file.originalname.trim().length === 0) {
      throw new BadRequestException('Nome do arquivo é obrigatório');
    }
  }

  private generateChecksum(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  private async ensureDirectoriesExist(): Promise<void> {
    const directories = [PUBLIC_STORAGE_DIR, METADATA_STORAGE_DIR];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
        this.logger.log(`Diretório criado: ${dir}`);
      }
    }
  }

  private async savePhysicalFile(
    file: Express.Multer.File,
    token: string,
    baseUrl?: string,
  ): Promise<{ fileName: string; filePath: string; fileUrl: string }> {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname) || '.pdf';
    const fileName = `${UPLOAD_FILE_PREFIX}${token}-${timestamp}${extension}`;
    const filePath = path.join(PUBLIC_STORAGE_DIR, fileName);

    await writeFile(filePath, file.buffer);

    const resolvedBaseUrl = this.resolveBaseUrl(baseUrl);
    const fileUrl = `${resolvedBaseUrl}/uploads/${fileName}`;

    this.logger.log(`Arquivo salvo: ${filePath} -> ${fileUrl}`);

    return { fileName, filePath, fileUrl };
  }

  private async saveMetadata(
    token: string,
    metadata: FileMetadata,
  ): Promise<void> {
    const metadataPath = path.join(METADATA_STORAGE_DIR, `${token}.json`);
    const metadataContent = JSON.stringify(metadata, null, 2);

    await writeFile(metadataPath, metadataContent, 'utf-8');
    this.logger.log(`Metadados salvos: ${metadataPath}`);
  }

  private resolveBaseUrl(baseUrlOverride?: string): string {
    const envBaseUrl = process.env.FILES_PUBLIC_URL || DEFAULT_BASE_URL;
    const candidate =
      baseUrlOverride && baseUrlOverride.trim().length > 0
        ? baseUrlOverride
        : envBaseUrl;
    return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
  }

  async deleteFile(token: string): Promise<void> {
    const method = 'deleteFile';
    this.logger.log(`${method} ENTER, { token: ${token} }`);

    try {
      // Get metadata first to find the file
      const metadata = await this.getFileMetadata(token);
      if (!metadata) {
        this.logger.warn(`${method}: metadata not found for token ${token}`);
        return;
      }

      // Delete physical file using the stored filePath from metadata
      try {
        if (!metadata.filePath) {
          throw new Error('No filePath stored in metadata');
        }
        await unlink(metadata.filePath);
        this.logger.log(
          `${method}: physical file deleted: ${metadata.filePath}`,
        );
      } catch (fileError: any) {
        // Log warning but don't fail the operation
        this.logger.warn(
          `${method}: could not delete physical file for token ${token}: ${fileError.message}. Path: ${metadata.filePath || 'unknown'}`,
        );
      }

      // Delete metadata file
      try {
        const metadataPath = path.join(METADATA_STORAGE_DIR, `${token}.json`);
        await unlink(metadataPath);
        this.logger.log(`${method}: metadata file deleted: ${metadataPath}`);
      } catch (metadataError: any) {
        this.logger.warn(
          `${method}: could not delete metadata file for token ${token}: ${metadataError.message}`,
        );
      }

      this.logger.log(`${method} EXIT, { token: ${token} }`);
    } catch (error) {
      this.logger.error(
        `${method}: error deleting file for token ${token}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private isValidToken(token: string): boolean {
    // Validate that token is a valid UUID format to prevent path injection
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }
}
