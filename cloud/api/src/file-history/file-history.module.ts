// api/src/file-history/file-history.module.ts
import { Module } from '@nestjs/common';
import { FileHistoryController } from './file-history.controller';
import { FileHistoryService } from './file-history.service';

@Module({
  controllers: [FileHistoryController],
  providers: [FileHistoryService],
  exports: [FileHistoryService],
})
export class FileHistoryModule {}
