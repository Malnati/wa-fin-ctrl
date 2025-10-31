// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DiagnosticsModule } from './diagnostics/diagnostics.module';
// import { OpenAiModule } from './openai/openai.module'; // Integração OpenAI desativada
import { AgentsModule } from './agents/agents.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { envConfig, EnvValidatorService } from './config';
import { NotificationsModule } from './notifications/notifications.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { FileHistoryModule } from './file-history/file-history.module';
import { AdminModule } from './admin/admin.module';
import { ConsentModule } from './consent/consent.module';
import { ApiConfigModule } from './modules/config/config.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
// import { GoogleDriveService } from './storage/google-drive.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [envConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    DiagnosticsModule,
    // OpenAiModule, // Integração OpenAI desativada
    AgentsModule,
    UploadModule,
    AuthModule,
    NotificationsModule,
    OnboardingModule,
    FileHistoryModule,
    AdminModule,
    ConsentModule,
    ApiConfigModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService, EnvValidatorService /* GoogleDriveService */],
})
export class AppModule {}
