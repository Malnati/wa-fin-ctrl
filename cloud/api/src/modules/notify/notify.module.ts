// api/src/modules/notify/notify.module.ts
import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

@Module({
  controllers: [NotifyController],
  providers: [NotifyService],
})
export class NotifyModule {}
