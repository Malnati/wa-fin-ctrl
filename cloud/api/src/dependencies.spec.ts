// src/dependencies.spec.ts
import { Test, TestingModule } from '@nestjs/testing';

describe('Dependencies Integrity Test', () => {
  describe('Critical Dependencies', () => {
    it('should be able to import @google-cloud/text-to-speech', async () => {
      // Teste de importação do Google Cloud TTS
      const { TextToSpeechClient } = await import(
        '@google-cloud/text-to-speech'
      );
      expect(TextToSpeechClient).toBeDefined();
    });

    // it('should be able to import OpenAI', async () => {
    //   // Teste de importação do OpenAI
    //   const OpenAI = await import('openai');
    //   expect(OpenAI.default).toBeDefined();
    // }); // Integração OpenAI desativada

    it('should be able to import pdf-parse', async () => {
      // Teste de importação do pdf-parse
      const pdfParse = await import('pdf-parse');
      expect(pdfParse).toBeDefined();
    });

    it('should be able to import NestJS core modules', async () => {
      // Teste de importação dos módulos principais do NestJS
      const { Injectable } = await import('@nestjs/common');
      const { Module } = await import('@nestjs/common');
      const { Controller } = await import('@nestjs/common');

      expect(Injectable).toBeDefined();
      expect(Module).toBeDefined();
      expect(Controller).toBeDefined();
    });

    // it('should be able to import OpenAI service', async () => {
    //   // Teste de importação do serviço OpenAI
    //   const { OpenAiService } = await import('../src/openai/openai.service');
    //   expect(OpenAiService).toBeDefined();
    // }); // Integração OpenAI desativada

    it('should be able to import diagnostics services', async () => {
      // Teste de importação dos serviços de análise
      const { DiagnosticsService } = await import(
        '../src/diagnostics/diagnostics.service'
      );
      const { DiagnosticsController } = await import(
        '../src/diagnostics/diagnostics.controller'
      );

      expect(DiagnosticsService).toBeDefined();
      expect(DiagnosticsController).toBeDefined();
    });
  });

  describe('Module Compilation Test', () => {
    // it('should compile OpenAI module without errors', async () => {
    //   const { OpenAiModule } = await import('../src/openai/openai.module');
    //   expect(OpenAiModule).toBeDefined();
    // }); // Integração OpenAI desativada

    it('should compile diagnostics module without errors', async () => {
      const { DiagnosticsModule } = await import(
        '../src/diagnostics/diagnostics.module'
      );
      expect(DiagnosticsModule).toBeDefined();
    });

    it('should compile main app module without errors', async () => {
      const { AppModule } = await import('../src/app.module');
      expect(AppModule).toBeDefined();
    });
  });

  describe('Service Instantiation Test', () => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [],
      }).compile();
    });

    afterAll(async () => {
      await module.close();
    });

    // it('should be able to instantiate OpenAI service', async () => {
    //   process.env.OPENROUTER_API_KEY = 'test-key';
    //   const { OpenAiService } = await import('../src/openai/openai.service');
    //   const service = new OpenAiService();
    //   expect(service).toBeDefined();
    //   expect(service.generateDiagnosis).toBeDefined();
    //   delete process.env.OPENROUTER_API_KEY;
    // }); // Integração OpenAI desativada

  });
});
