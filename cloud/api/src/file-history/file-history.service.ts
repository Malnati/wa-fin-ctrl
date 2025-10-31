// api/src/file-history/file-history.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import {
  FileHistoryQueryDto,
  FileHistoryItemDto,
  FileHistoryResponseDto,
  FileStatsDto,
} from './dto/file-history.dto';
import {
  FILE_HISTORY_METADATA_FILE_NAME,
  FILE_HISTORY_STORAGE_DIR,
  FILE_HISTORY_UPLOADS_DIR,
  FILE_HISTORY_CACHE_TTL,
  FILE_HISTORY_DEFAULT_PAGE_SIZE,
  FILE_HISTORY_MAX_PAGE_SIZE,
  UPLOAD_METADATA_STORAGE_DIR,
} from '../constants/constants';

interface FileMetadata {
  token: string;
  originalName: string;
  customName?: string;
  fileName: string;
  filePath?: string; // Add optional filePath to ensure we can store the exact upload path
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  checksum: string;
  description?: string;
  fileUrl?: string;
  processed?: boolean;
  analysisResult?: string;
  lastAnalyzedAt?: string;
}

@Injectable()
export class FileHistoryService implements OnModuleInit {
  private readonly logger = new Logger(FileHistoryService.name);
  private metadataCache: Map<string, FileMetadata> = new Map();
  private lastCacheUpdate = 0;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Constructor should be synchronous in NestJS
    // Async initialization will happen in onModuleInit
  }

  async onModuleInit(): Promise<void> {
    // Ensure initialization only happens once
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }
    await this.initializationPromise;
  }

  private async initialize(): Promise<void> {
    await this.ensureStorageDirectories();
    await this.loadMetadataCache();
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }
    await this.initializationPromise;
  }

  private async ensureStorageDirectories(): Promise<void> {
    try {
      await fs.mkdir(FILE_HISTORY_STORAGE_DIR, { recursive: true });
      await fs.mkdir(FILE_HISTORY_UPLOADS_DIR, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating storage directories:', error);
    }
  }

  private async loadMetadataCache(): Promise<void> {
    try {
      const metadataPath = join(
        FILE_HISTORY_STORAGE_DIR,
        FILE_HISTORY_METADATA_FILE_NAME,
      );

      try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata: Record<string, FileMetadata> = JSON.parse(data);

        this.metadataCache.clear();
        Object.entries(metadata).forEach(([token, meta]) => {
          this.metadataCache.set(token, meta);
        });

        this.lastCacheUpdate = Date.now();
        this.logger.log(
          `Loaded ${this.metadataCache.size} files from metadata cache`,
        );
      } catch (fileError) {
        // If file doesn't exist, start with empty cache
        if ((fileError as any).code === 'ENOENT') {
          this.logger.log('Metadata file not found, starting with empty cache');
          this.metadataCache.clear();
        } else {
          throw fileError;
        }
      }
    } catch (error) {
      this.logger.error('Error loading metadata cache:', error);
      this.metadataCache.clear();
    }
  }

  private async saveMetadataCache(): Promise<void> {
    try {
      const metadataPath = join(
        FILE_HISTORY_STORAGE_DIR,
        FILE_HISTORY_METADATA_FILE_NAME,
      );
      const metadata: Record<string, FileMetadata> = {};

      this.metadataCache.forEach((meta, token) => {
        metadata[token] = meta;
      });

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      this.lastCacheUpdate = Date.now();
    } catch (error) {
      this.logger.error('Error saving metadata cache:', error);
      throw error;
    }
  }

  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate > FILE_HISTORY_CACHE_TTL) {
      await this.loadMetadataCache();
    }
  }

  async addFileMetadata(
    metadata: Omit<
      FileMetadata,
      'processed' | 'analysisResult' | 'lastAnalyzedAt'
    >,
  ): Promise<void> {
    await this.ensureInitialized();

    const fullMetadata: FileMetadata = {
      ...metadata,
      processed: false,
      analysisResult: undefined,
      lastAnalyzedAt: undefined,
    };

    this.metadataCache.set(metadata.token, fullMetadata);
    await this.saveMetadataCache();

    this.logger.log(
      `Added file metadata: ${metadata.token} - ${metadata.originalName} at path: ${metadata.filePath || 'unknown'}`,
    );
  }

  async updateFileAnalysis(
    token: string,
    analysisResult: string,
  ): Promise<void> {
    await this.ensureInitialized();

    const metadata = this.metadataCache.get(token);
    if (!metadata) {
      throw new NotFoundException(`File not found: ${token}`);
    }

    metadata.processed = true;
    metadata.analysisResult = analysisResult;
    metadata.lastAnalyzedAt = new Date().toISOString();

    this.metadataCache.set(token, metadata);
    await this.saveMetadataCache();

    this.logger.log(`Updated analysis for file: ${token}`);
  }

  async getFileHistory(
    query: FileHistoryQueryDto,
  ): Promise<FileHistoryResponseDto> {
    const method = 'getFileHistory';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, query: ${JSON.stringify(query)}`);

    try {
      await this.ensureInitialized();
      await this.refreshCacheIfNeeded();

      let files = Array.from(this.metadataCache.values());

      // Apply filters
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        files = files.filter(
          (file) =>
            file.originalName.toLowerCase().includes(searchLower) ||
            file.customName?.toLowerCase().includes(searchLower) ||
            file.description?.toLowerCase().includes(searchLower),
        );
      }

      if (query.mimeType) {
        files = files.filter((file) => file.mimeType === query.mimeType);
      }

      if (query.dateFrom) {
        const fromDate = new Date(query.dateFrom);
        files = files.filter((file) => new Date(file.uploadDate) >= fromDate);
      }

      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        files = files.filter((file) => new Date(file.uploadDate) <= toDate);
      }

      // Sort by upload date (newest first)
      files.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
      );

      // Calculate pagination
      const total = files.length;
      const page = query.page || 1;
      const limit = Math.min(
        query.limit || FILE_HISTORY_DEFAULT_PAGE_SIZE,
        FILE_HISTORY_MAX_PAGE_SIZE,
      );
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Apply pagination
      const paginatedFiles = files.slice(offset, offset + limit);

      // Transform to DTOs
      const fileItems: FileHistoryItemDto[] = paginatedFiles.map((file) => ({
        token: file.token,
        originalName: file.originalName,
        customName: file.customName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadDate: file.uploadDate,
        description: file.description,
        fileUrl: file.fileUrl || '',
        processed: file.processed || false,
        analysisResult: file.analysisResult,
        lastAnalyzedAt: file.lastAnalyzedAt,
      }));

      const result: FileHistoryResponseDto = {
        files: fileItems,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        timestamp: new Date().toISOString(),
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, total: ${total}, page: ${page} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  async getFileStats(): Promise<FileStatsDto> {
    const method = 'getFileStats';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      await this.ensureInitialized();
      await this.refreshCacheIfNeeded();

      const files = Array.from(this.metadataCache.values());
      const totalFiles = files.length;
      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      const processedFiles = files.filter((file) => file.processed).length;

      // MIME type distribution
      const mimeTypeDistribution: Record<string, number> = {};
      files.forEach((file) => {
        mimeTypeDistribution[file.mimeType] =
          (mimeTypeDistribution[file.mimeType] || 0) + 1;
      });

      // Uploads per day (last 30 days)
      const uploadsPerDay: Record<string, number> = {};
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach((file) => {
        const uploadDate = new Date(file.uploadDate);
        if (uploadDate >= thirtyDaysAgo) {
          const dateKey = uploadDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          uploadsPerDay[dateKey] = (uploadsPerDay[dateKey] || 0) + 1;
        }
      });

      const result: FileStatsDto = {
        totalFiles,
        totalSize,
        processedFiles,
        mimeTypeDistribution,
        uploadsPerDay,
        timestamp: new Date().toISOString(),
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, totalFiles: ${totalFiles} }`,
      );

      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  async deleteFile(token: string): Promise<void> {
    const method = 'deleteFile';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, token: ${token}`);

    try {
      await this.ensureInitialized();

      // Validate token format to prevent path injection
      if (!this.isValidToken(token)) {
        throw new NotFoundException(`Invalid token format: ${token}`);
      }

      const metadata = this.metadataCache.get(token);
      if (!metadata) {
        throw new NotFoundException(`File not found: ${token}`);
      }

      // Remove from cache first
      this.metadataCache.delete(token);

      // Try to remove physical file using the filePath stored in metadata
      // This ensures we delete from the exact same location where the file was uploaded
      try {
        await fs.unlink(
          metadata.filePath ||
            join(FILE_HISTORY_UPLOADS_DIR, metadata.fileName),
        );
        this.logger.log(
          `${method}: Physical file deleted successfully using stored path: ${metadata.filePath}`,
        );
      } catch (fileError: any) {
        // Log warning but don't fail the operation - metadata cleanup should still happen
        this.logger.warn(
          `${method}: Could not delete physical file for token ${token}: ${fileError.message}. ` +
            `Attempted path: ${metadata.filePath || join(FILE_HISTORY_UPLOADS_DIR, metadata.fileName)}. ` +
            `This may indicate the file was already deleted or path mismatch.`,
        );
      }

      // Try to remove upload service metadata file if it exists
      // Note: token is validated as UUID format above, preventing path injection
      try {
        const uploadMetadataPath = join(
          UPLOAD_METADATA_STORAGE_DIR,
          `${token}.json`,
        );
        await fs.unlink(uploadMetadataPath);
        this.logger.log(
          `${method}: Upload service metadata file deleted: ${uploadMetadataPath}`,
        );
      } catch (metadataError: any) {
        this.logger.warn(
          `${method}: Could not delete upload service metadata file for token ${token}: ${metadataError.message}`,
        );
      }

      // Save updated file history metadata
      await this.saveMetadataCache();

      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: ${dt}, token: ${token} }`);
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: ${dt}, token: ${token}, error: ${error instanceof Error ? error.message : String(error)} }`,
      );
      throw error;
    }
  }

  async getFileMetadata(token: string): Promise<FileMetadata | null> {
    await this.ensureInitialized();
    await this.refreshCacheIfNeeded();
    return this.metadataCache.get(token) || null;
  }

  private isValidToken(token: string): boolean {
    // Validate that token is a valid UUID format to prevent path injection
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }
}
