// api/src/file-history/file-history.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FileHistoryService } from './file-history.service';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('FileHistoryService', () => {
  let service: FileHistoryService;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    // Mock readFile to return empty metadata initially
    mockFs.readFile.mockRejectedValue({ code: 'ENOENT' });
    mockFs.mkdir.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [FileHistoryService],
    }).compile();

    service = module.get<FileHistoryService>(FileHistoryService);

    // Wait for module initialization to complete
    await service.onModuleInit();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('async initialization race condition', () => {
    it('should handle concurrent addFileMetadata calls during initialization without data loss', async () => {
      // Reset the service to test initialization race condition
      const module: TestingModule = await Test.createTestingModule({
        providers: [FileHistoryService],
      }).compile();

      const newService = module.get<FileHistoryService>(FileHistoryService);

      // Mock file operations
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' }); // No existing metadata file
      mockFs.writeFile.mockResolvedValue(undefined);

      const mockMetadata1 = {
        token: 'test-token-1',
        originalName: 'test1.pdf',
        fileName: 'upload-test-token-1.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        uploadDate: '2025-10-20T02:00:00.000Z',
        checksum: 'abc123',
        description: 'Test file 1',
      };

      const mockMetadata2 = {
        token: 'test-token-2',
        originalName: 'test2.pdf',
        fileName: 'upload-test-token-2.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        uploadDate: '2025-10-20T02:01:00.000Z',
        checksum: 'def456',
        description: 'Test file 2',
      };

      // Simulate concurrent calls during initialization
      const promises = [
        newService.addFileMetadata(mockMetadata1),
        newService.addFileMetadata(mockMetadata2),
      ];

      // Both operations should complete successfully without race conditions
      await expect(Promise.all(promises)).resolves.not.toThrow();

      // Verify that writeFile was called (metadata was saved)
      expect(mockFs.writeFile).toHaveBeenCalled();

      // Verify that both files can be retrieved
      const file1 = await newService.getFileMetadata('test-token-1');
      const file2 = await newService.getFileMetadata('test-token-2');

      expect(file1).not.toBeNull();
      expect(file2).not.toBeNull();
      expect(file1?.token).toBe('test-token-1');
      expect(file2?.token).toBe('test-token-2');
    });
  });

  describe('addFileMetadata', () => {
    it('should add file metadata successfully', async () => {
      const mockMetadata = {
        token: 'test-token-123',
        originalName: 'test.pdf',
        fileName: 'upload-test-token-123.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        uploadDate: '2025-10-20T02:00:00.000Z',
        checksum: 'abc123',
        description: 'Test file',
      };

      mockFs.writeFile.mockResolvedValue(undefined);

      await expect(
        service.addFileMetadata(mockMetadata),
      ).resolves.not.toThrow();
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join('./storage', 'metadata.json'),
        expect.stringContaining('test-token-123'),
      );
    });
  });

  describe('getFileHistory', () => {
    beforeEach(() => {
      // Mock successful metadata file read
      const mockMetadata = {
        'token-1': {
          token: 'token-1',
          originalName: 'file1.pdf',
          fileName: 'upload-token-1.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          uploadDate: '2025-10-20T01:00:00.000Z',
          checksum: 'abc123',
          processed: true,
          analysisResult: 'Test analysis',
        },
        'token-2': {
          token: 'token-2',
          originalName: 'file2.txt',
          fileName: 'upload-token-2.txt',
          fileSize: 512,
          mimeType: 'text/plain',
          uploadDate: '2025-10-19T12:00:00.000Z',
          checksum: 'def456',
          processed: false,
        },
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));
    });

    it('should return paginated file history', async () => {
      const query = { page: 1, limit: 10 };
      const result = await service.getFileHistory(query);

      expect(result).toEqual({
        files: expect.arrayContaining([
          expect.objectContaining({
            token: 'token-1',
            originalName: 'file1.pdf',
            processed: true,
          }),
          expect.objectContaining({
            token: 'token-2',
            originalName: 'file2.txt',
            processed: false,
          }),
        ]),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        timestamp: expect.any(String),
      });
    });

    it('should filter by search term', async () => {
      const query = { search: 'file1', page: 1, limit: 10 };
      const result = await service.getFileHistory(query);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toEqual(
        expect.objectContaining({
          token: 'token-1',
          originalName: 'file1.pdf',
        }),
      );
    });

    it('should filter by MIME type', async () => {
      const query = { mimeType: 'application/pdf', page: 1, limit: 10 };
      const result = await service.getFileHistory(query);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toEqual(
        expect.objectContaining({
          token: 'token-1',
          mimeType: 'application/pdf',
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      const query = { page: 2, limit: 1 };
      const result = await service.getFileHistory(query);

      expect(result).toEqual(
        expect.objectContaining({
          total: 2,
          page: 2,
          limit: 1,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true,
        }),
      );
    });
  });

  describe('getFileStats', () => {
    beforeEach(() => {
      const mockMetadata = {
        'token-1': {
          token: 'token-1',
          originalName: 'file1.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          uploadDate: '2025-10-20T01:00:00.000Z',
          processed: true,
        },
        'token-2': {
          token: 'token-2',
          originalName: 'file2.txt',
          fileSize: 512,
          mimeType: 'text/plain',
          uploadDate: '2025-10-19T12:00:00.000Z',
          processed: false,
        },
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));
    });

    it('should return correct statistics', async () => {
      const result = await service.getFileStats();

      expect(result).toEqual({
        totalFiles: 2,
        totalSize: 1536, // 1024 + 512
        processedFiles: 1,
        mimeTypeDistribution: {
          'application/pdf': 1,
          'text/plain': 1,
        },
        uploadsPerDay: expect.objectContaining({
          '2025-10-20': 1,
          '2025-10-19': 1,
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('deleteFile', () => {
    beforeEach(() => {
      const mockMetadata = {
        'token-1': {
          token: 'token-1',
          originalName: 'file1.pdf',
          fileName: 'upload-token-1.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          uploadDate: '2025-10-20T01:00:00.000Z',
          checksum: 'abc123',
        },
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));
    });

    it('should delete file successfully', async () => {
      mockFs.unlink.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await expect(service.deleteFile('token-1')).resolves.not.toThrow();
      expect(mockFs.unlink).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent file', async () => {
      await expect(service.deleteFile('non-existent-token')).rejects.toThrow(
        'File not found: non-existent-token',
      );
    });
  });

  describe('updateFileAnalysis', () => {
    beforeEach(() => {
      const mockMetadata = {
        'token-1': {
          token: 'token-1',
          originalName: 'file1.pdf',
          processed: false,
        },
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));
    });

    it('should update analysis result', async () => {
      mockFs.writeFile.mockResolvedValue(undefined);

      await expect(
        service.updateFileAnalysis('token-1', 'Analysis complete'),
      ).resolves.not.toThrow();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent file', async () => {
      await expect(
        service.updateFileAnalysis('non-existent-token', 'Analysis'),
      ).rejects.toThrow('File not found: non-existent-token');
    });
  });
});
