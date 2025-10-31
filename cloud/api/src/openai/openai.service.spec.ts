// src/openai/openai.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
// import { OpenAiService } from './openai.service'; // Integração OpenAI desativada

/* describe('OpenAiService', () => {
  let service: OpenAiService;

  beforeEach(async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAiService],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDiagnosis', () => {
    it('should generate diagnosis for valid text with new prompt format', async () => {
      const testText =
        'Este é um código JavaScript com console.log("Hello World");';

      // Mock da API da OpenAI
      const mockCreate = jest
        .spyOn(service['openai'].chat.completions, 'create')
        .mockResolvedValue({
          choices: [
            {
              message: {
                content:
                  'Código JavaScript básico com saída no console. Esta análise foi gerada automaticamente por inteligência artificial.',
              },
            },
          ],
        } as any);

      const result = await service.generateDiagnosis(testText);

      expect(result).toBe(
        'Código JavaScript básico com saída no console. Esta análise foi gerada automaticamente por inteligência artificial.',
      );

      // Verificar se o prompt foi chamado com as diretrizes corretas
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('DIRETRIZES OBRIGATÓRIAS'),
          },
        ],
      });

      // Verificar se o prompt contém as diretrizes específicas
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain(
        'NÃO identifique ou mencione indivíduos específicos',
      );
      expect(callArgs.messages[0].content).toContain(
        'NÃO descreva a origem ou natureza dos dados',
      );
      expect(callArgs.messages[0].content).toContain(
        'SEMPRE inclua no FINAL: "Esta análise foi gerada automaticamente por inteligência artificial."',
      );
    });

    it('should handle empty text', async () => {
      const testText = '';

      jest
        .spyOn(service['openai'].chat.completions, 'create')
        .mockResolvedValue({
          choices: [
            {
              message: {
                content:
                  'Nenhum conteúdo para analisar. Esta análise foi gerada automaticamente por inteligência artificial.',
              },
            },
          ],
        } as any);

      const result = await service.generateDiagnosis(testText);

      expect(result).toBe(
        'Nenhum conteúdo para analisar. Esta análise foi gerada automaticamente por inteligência artificial.',
      );
    });

    it('should include the disclaimer in the prompt', async () => {
      const testText = 'Test content';

      const mockCreate = jest
        .spyOn(service['openai'].chat.completions, 'create')
        .mockResolvedValue({
          choices: [
            {
              message: {
                content:
                  'Análise do conteúdo de teste. Esta análise foi gerada automaticamente por inteligência artificial.',
              },
            },
          ],
        } as any);

      await service.generateDiagnosis(testText);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('Formato esperado:');
      expect(callArgs.messages[0].content).toContain(
        'Esta análise foi gerada automaticamente por inteligência artificial.',
      );
    });
  });

  describe('generateDiagnosisFromPdf', () => {
    it('should generate diagnosis from base64 PDF', async () => {
      const mockPdf = 'base64-pdf';

      const mockFile = { id: 'file-id' };
      const mockFileCreate = jest
        .spyOn(service['openai'].files, 'create')
        .mockResolvedValue(mockFile as any);

      const mockCreate = jest
        .spyOn(service['openai'].responses, 'create')
        .mockResolvedValue({
          output_text:
            'Análise do PDF. Esta análise foi gerada automaticamente por inteligência artificial.',
        } as any);

      const result = await service.generateDiagnosisFromPdf(mockPdf);

      expect(result).toBe(
        'Análise do PDF. Esta análise foi gerada automaticamente por inteligência artificial.',
      );
      expect(mockFileCreate).toHaveBeenCalledWith({
        file: expect.any(Buffer),
        purpose: 'vision',
      });
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'openrouter/auto',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: expect.any(String) },
              {
                type: 'input_file',
                file_id: mockFile.id,
              },
            ],
          },
        ],
      });
    });
  });
}); */ // Integração OpenAI desativada
