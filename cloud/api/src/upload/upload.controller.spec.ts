// api/src/upload/upload.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('fake pdf content'),
    destination: '',
    filename: '',
    path: '',
  } as Express.Multer.File;

  const mockUploadResponse: UploadResponseDto = {
    status: 'OK',
    token: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    originalName: 'test.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    uploadDate: '2025-10-18T22:15:30.000Z',
    fileUrl:
      'http://localhost:3333/uploads/upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-1729288530000.pdf',
  };

  const mockUploadService = {
    uploadFile: jest.fn(),
    getFileMetadata: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      mockUploadService.uploadFile.mockResolvedValue(mockUploadResponse);

      const result = await controller.upload(mockFile);

      expect(result).toEqual(mockUploadResponse);
      expect(mockUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should upload file with custom name and description', async () => {
      const customName = 'my-document.pdf';
      const description = 'Test document';

      mockUploadService.uploadFile.mockResolvedValue({
        ...mockUploadResponse,
        description,
      });

      const result = await controller.upload(mockFile, customName, description);

      expect(mockUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        customName,
        description,
        undefined,
      );
      expect(result.description).toBe(description);
    });

    it('should handle upload errors', async () => {
      const error = new BadRequestException('File too large');
      mockUploadService.uploadFile.mockRejectedValue(error);

      await expect(controller.upload(mockFile)).rejects.toThrow(error);
    });
  });

  describe('getMetadata', () => {
    const validToken = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const mockMetadata = {
      token: validToken,
      originalName: 'test.pdf',
      fileName: 'upload-f47ac10b-58cc-4372-a567-0e02b2c3d479-123.pdf',
      filePath: '/path/to/file',
      fileSize: 1024,
      mimeType: 'application/pdf',
      uploadDate: '2025-10-18T22:15:30.000Z',
      checksum: 'abc123',
    };

    it('should return file metadata', async () => {
      mockUploadService.getFileMetadata.mockResolvedValue(mockMetadata);

      const result = await controller.getMetadata(validToken);

      expect(result).toEqual(mockMetadata);
      expect(mockUploadService.getFileMetadata).toHaveBeenCalledWith(
        validToken,
      );
    });

    it('should throw NotFoundException when file not found', async () => {
      mockUploadService.getFileMetadata.mockResolvedValue(null);

      await expect(controller.getMetadata(validToken)).rejects.toThrow();
    });

    it('should throw BadRequestException for invalid token format', async () => {
      await expect(controller.getMetadata('invalid-token-123')).rejects.toThrow(
        'Token inválido',
      );
    });
  });
});
