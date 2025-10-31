// api/src/modules/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';

@Module({
  controllers: [ConfigController],
})
export class ApiConfigModule {}
