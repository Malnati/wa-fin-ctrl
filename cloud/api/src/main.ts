// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';

// Load environment variables before anything else
config();

async function bootstrap() {
  const method = 'bootstrap';
  const t0 = Date.now();

  // Gerar versão única de inicialização
  const startupVersion =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  console.log(
    `[${new Date().toISOString()}] [INFO] [main.ts] ${method} ENTER, { env: ${process.env.NODE_ENV || 'development'}, startupVersion: ${startupVersion} }`,
  );

  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.enableCors({
      origin: '*',
      credentials: true,
      methods: '*',
      allowedHeaders: '*',
    });

    // Files are uploaded directly to Google Drive, no middleware needed for public access

    const config = new DocumentBuilder()
      .setTitle('Diagnostics Chrome API')
      .setDescription('API para análise de arquivos via IA')
      .setVersion('1.0')
      .addTag('diagnostics')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = 3333;
    await app.listen(port);

    const dt = Date.now() - t0;
    console.log(
      `[${new Date().toISOString()}] [INFO] [main.ts] ${method} EXIT, { durationMs: dt, port: ${port}, env: ${process.env.NODE_ENV || 'development'} }`,
    );
    console.log(`🚀 API disponível em http://localhost:${port}`);
  } catch (e) {
    const dt = Date.now() - t0;
    console.error(
      `[${new Date().toISOString()}] [ERROR] [main.ts] ${method} ERROR, { durationMs: dt, error: ${e instanceof Error ? e.stack : String(e)} }`,
    );
    throw e;
  }
}
bootstrap();

export default {};
