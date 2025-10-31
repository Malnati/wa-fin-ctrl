// api/src/upload/upload.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

// Mock fs modules
jest.mock('fs/promises');
jest.mock('fs');

describe('UploadService', () => {
  let service: UploadService;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('fake pdf content'),
    destination: '',
    filename: '',
    path: '',
  } as Express.Multer.File;

  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockFsSync = fsSync as jest.Mocked<typeof fsSync>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockFsSync.existsSync.mockReturnValue(true);
    mockFs.writeFile.mockResolvedValue();
    mockFs.mkdir.mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload PDF file successfully', async () => {
      const result = await service.uploadFile(mockFile);

      expect(result).toMatchObject({
        status: 'OK',
        originalName: 'test-document.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      });
      expect(result.token).toBeDefined();
      expect(result.fileUrl).toContain('http://localhost:3333/uploads/upload-');
      expect(result.uploadDate).toBeDefined();
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2); // file + metadata
    });

    it('should include custom name and description when provided', async () => {
      const customName = 'my-custom-name.pdf';
      const description = 'My test document';

      const result = await service.uploadFile(
        mockFile,
        customName,
        description,
      );

      expect(result.description).toBe(description);
      expect(result.metadata?.customName).toBe(customName);
    });

    it('should use custom base URL when provided', async () => {
      const customBaseUrl = 'https://example.com';

      const result = await service.uploadFile(
        mockFile,
        undefined,
        undefined,
        customBaseUrl,
      );

      expect(result.fileUrl).toMatch(/^https:\/\/example\.com\/uploads\//);
    });

    it('should create directories if they do not exist', async () => {
      mockFsSync.existsSync.mockReturnValue(false);

      await service.uploadFile(mockFile);

      expect(mockFs.mkdir).toHaveBeenCalledWith('public/uploads', {
        recursive: true,
      });
      expect(mockFs.mkdir).toHaveBeenCalledWith('storage/metadata', {
        recursive: true,
      });
    });

    it('should throw error for non-PDF files', async () => {
      const nonPdfFile = { ...mockFile, mimetype: 'text/plain' };

      await expect(service.uploadFile(nonPdfFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for files too large', async () => {
      const largeFile = { ...mockFile, size: 15 * 1024 * 1024 }; // 15MB

      await expect(service.uploadFile(largeFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when no file provided', async () => {
      await expect(service.uploadFile(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when file has no original name', async () => {
      const fileNoName = { ...mockFile, originalname: '' };

      await expect(service.uploadFile(fileNoName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle file write errors gracefully', async () => {
      const writeError = new Error('Disk full');
      mockFs.writeFile.mockRejectedValueOnce(writeError);

      await expect(service.uploadFile(mockFile)).rejects.toThrow(writeError);
    });
  });

  describe('getFileMetadata', () => {
    const mockToken = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const mockMetadata = {
      token: mockToken,
      originalName: 'test.pdf',
      fileName: 'upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-123.pdf',
      filePath: '/path/to/file',
      fileSize: 1024,
      mimeType: 'application/pdf',
      uploadDate: '2025-10-18T22:15:30.000Z',
      checksum: 'abc123def',
    };

    it('should return metadata when file exists', async () => {
      mockFsSync.existsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));

      const result = await service.getFileMetadata(mockToken);

      expect(result).toEqual(mockMetadata);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        `storage/metadata/${mockToken}.json`,
        'utf-8',
      );
    });

    it('should return null when metadata file does not exist', async () => {
      mockFsSync.existsSync.mockReturnValue(false);

      const result = await service.getFileMetadata(mockToken);

      expect(result).toBeNull();
    });

    it('should return null for invalid token format', async () => {
      const result = await service.getFileMetadata('invalid-token-123');

      expect(result).toBeNull();
    });

    it('should return null when metadata file is corrupted', async () => {
      mockFsSync.existsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('invalid json');

      const result = await service.getFileMetadata(mockToken);

      expect(result).toBeNull();
    });

    it('should return null when read file fails', async () => {
      mockFsSync.existsSync.mockReturnValue(true);
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      const result = await service.getFileMetadata(mockToken);

      expect(result).toBeNull();
    });
  });
});
