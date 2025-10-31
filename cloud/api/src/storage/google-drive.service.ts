// Caminho relativo ao projeto: src/storage/google-drive.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: drive_v3.Drive;

  constructor() {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      if (refreshToken) {
        auth.setCredentials({ refresh_token: refreshToken });
      }
      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      this.logger.error(
        'GoogleDriveService initialization error',
        error as Error,
      );
      throw error;
    }
  }

  async uploadFile(filePath: string, fileName: string) {
    const method = 'uploadFile';
    const t0 = Date.now();
    this.logger.log(
      `${method} ENTER, { filePath: ${filePath}, fileName: ${fileName} }`,
    );
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const res = await this.drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/pdf',
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType: 'application/pdf',
          body: createReadStream(filePath),
        },
      });
      if (res.data.id) {
        await this.drive.permissions.create({
          fileId: res.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
        });
        const link = await this.drive.files.get({
          fileId: res.data.id,
          fields: 'webViewLink',
        });
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT, { durationMs: ${dt}, id: ${res.data.id} }`,
        );
        return link.data.webViewLink;
      }
      throw new Error('Google Drive did not return file id');
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, durationMs=${dt}`,
      );
      throw error;
    }
  }

  async uploadBuffer(buffer: Buffer, fileName: string, mimeType: string) {
    const method = 'uploadBuffer';
    const t0 = Date.now();
    this.logger.log(
      `${method} ENTER, { fileName: ${fileName}, mimeType: ${mimeType} }`,
    );
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const res = await this.drive.files.create({
        requestBody: {
          name: fileName,
          mimeType,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType,
          body: Readable.from(buffer),
        },
      });
      if (res.data.id) {
        await this.drive.permissions.create({
          fileId: res.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
        });
        const link = await this.drive.files.get({
          fileId: res.data.id,
          fields: 'webViewLink',
        });
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT, { durationMs: ${dt}, id: ${res.data.id} }`,
        );
        return link.data.webViewLink;
      }
      throw new Error('Google Drive did not return file id');
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, durationMs=${dt}`,
      );
      throw error;
    }
  }
}
