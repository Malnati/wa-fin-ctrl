// api/src/file-history/file-history.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileHistoryController } from './file-history.controller';
import { FileHistoryService } from './file-history.service';
import {
  FileHistoryQueryDto,
  FileHistoryResponseDto,
  FileStatsDto,
} from './dto/file-history.dto';

describe('FileHistoryController', () => {
  let controller: FileHistoryController;
  let service: FileHistoryService;

  const mockFileHistoryService = {
    getFileHistory: jest.fn(),
    getFileStats: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileHistoryController],
      providers: [
        {
          provide: FileHistoryService,
          useValue: mockFileHistoryService,
        },
      ],
    }).compile();

    controller = module.get<FileHistoryController>(FileHistoryController);
    service = module.get<FileHistoryService>(FileHistoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFileHistory', () => {
    const mockResponse: FileHistoryResponseDto = {
      files: [
        {
          token: 'test-token',
          originalName: 'test.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          uploadDate: '2025-10-20T02:00:00.000Z',
          fileUrl: '/uploads/test.pdf',
          processed: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      timestamp: '2025-10-20T02:15:30.000Z',
    };

    it('should return file history successfully', async () => {
      const query: FileHistoryQueryDto = { page: 1, limit: 10 };
      mockFileHistoryService.getFileHistory.mockResolvedValue(mockResponse);

      const result = await controller.getFileHistory(query);

      expect(result).toEqual(mockResponse);
      expect(service.getFileHistory).toHaveBeenCalledWith(query);
    });

    it('should validate page parameter', async () => {
      const query: FileHistoryQueryDto = { page: 0, limit: 10 };
      // Don't mock the service for validation tests, let the controller handle validation

      await expect(controller.getFileHistory(query)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getFileHistory(query)).rejects.toThrow(
        'Page must be greater than 0',
      );
    });

    it('should validate limit parameter', async () => {
      const query: FileHistoryQueryDto = { page: 1, limit: 101 };

      await expect(controller.getFileHistory(query)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getFileHistory(query)).rejects.toThrow(
        'Limit must be between 1 and 100',
      );
    });

    it('should validate date range', async () => {
      const query: FileHistoryQueryDto = {
        page: 1,
        limit: 10,
        dateFrom: '2025-10-20T00:00:00.000Z',
        dateTo: '2025-10-19T00:00:00.000Z', // dateTo before dateFrom
      };

      await expect(controller.getFileHistory(query)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getFileHistory(query)).rejects.toThrow(
        'dateFrom must be before dateTo',
      );
    });

    it('should handle service errors', async () => {
      const query: FileHistoryQueryDto = { page: 1, limit: 10 };
      const error = new Error('Database error');
      mockFileHistoryService.getFileHistory.mockRejectedValue(error);

      await expect(controller.getFileHistory(query)).rejects.toThrow(error);
    });
  });

  describe('getFileStats', () => {
    const mockStats: FileStatsDto = {
      totalFiles: 25,
      totalSize: 52428800,
      processedFiles: 20,
      mimeTypeDistribution: {
        'application/pdf': 20,
        'text/plain': 5,
      },
      uploadsPerDay: {
        '2025-10-19': 5,
        '2025-10-18': 8,
      },
      timestamp: '2025-10-20T02:15:30.000Z',
    };

    it('should return file statistics successfully', async () => {
      mockFileHistoryService.getFileStats.mockResolvedValue(mockStats);

      const result = await controller.getFileStats();

      expect(result).toEqual(mockStats);
      expect(service.getFileStats).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockFileHistoryService.getFileStats.mockRejectedValue(error);

      await expect(controller.getFileStats()).rejects.toThrow(error);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const token = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockFileHistoryService.deleteFile.mockResolvedValue(undefined);

      const result = await controller.deleteFile(token);

      expect(result).toEqual({
        message: 'Arquivo excluído com sucesso',
        token,
        timestamp: expect.any(String),
      });
      expect(service.deleteFile).toHaveBeenCalledWith(token);
    });

    it('should validate token format', async () => {
      const invalidToken = 'invalid-token';

      await expect(controller.deleteFile(invalidToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.deleteFile(invalidToken)).rejects.toThrow(
        `Token inválido: ${invalidToken}`,
      );
    });

    it('should handle file not found', async () => {
      const token = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const error = new NotFoundException(`File not found: ${token}`);
      mockFileHistoryService.deleteFile.mockRejectedValue(error);

      await expect(controller.deleteFile(token)).rejects.toThrow(error);
    });

    it('should handle service errors', async () => {
      const token = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const error = new Error('Database error');
      mockFileHistoryService.deleteFile.mockRejectedValue(error);

      await expect(controller.deleteFile(token)).rejects.toThrow(error);
    });
  });

  describe('token validation', () => {
    it('should accept valid UUID tokens', async () => {
      const validTokens = [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '12345678-1234-5234-a234-123456789abc',
      ];

      for (const token of validTokens) {
        mockFileHistoryService.deleteFile.mockResolvedValue(undefined);

        await expect(controller.deleteFile(token)).resolves.not.toThrow();
      }
    });

    it('should reject invalid tokens', async () => {
      const invalidTokens = [
        'not-a-uuid',
        '123',
        'f47ac10b-58cc-4372-a567-0e02b2c3d47', // too short
        'f47ac10b-58cc-4372-a567-0e02b2c3d4799', // too long
        'g47ac10b-58cc-4372-a567-0e02b2c3d479', // invalid character
        '',
        null,
        undefined,
      ];

      for (const token of invalidTokens) {
        await expect(controller.deleteFile(token as string)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });
});
