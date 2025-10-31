// src/openai/openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
// import OpenAI from 'openai'; // Integração OpenAI desativada

/*

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async generateDiagnosis(text: string): Promise<string> {
    const method = 'generateDiagnosis';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { textLength: text?.length }`);

    try {
      const prompt = `
Analise o seguinte conteúdo e forneça uma análise técnica direta e objetiva:

${text}

DIRETRIZES OBRIGATÓRIAS:
1. NÃO identifique ou mencione indivíduos específicos
2. NÃO use termos como "paciente", "indivíduo", "pessoa", "sujeito"
3. NÃO descreva a origem ou natureza dos dados (ex: "O conteúdo apresentado consiste em...")
4. NÃO explique como os dados foram obtidos ou a tecnologia utilizada
5. SEMPRE inclua no FINAL: "Esta análise foi gerada automaticamente por inteligência artificial."
6. Seja direto e objetivo na análise
7. Foque apenas na análise técnica dos dados apresentados
8. Use linguagem clara e acessível
9. Mantenha a análise concisa e relevante
10. Use termos neutros como "os valores", "os parâmetros", "os resultados"

Formato esperado:
"[análise técnica direta dos dados usando termos neutros] Esta análise foi gerada automaticamente por inteligência artificial."
`;

      const completion = await this.openai.chat.completions.create({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }],
      });

      const result = completion.choices[0].message.content?.trim() || '';
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultLength: result?.length }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      throw error;
    }
  }

  async generateDiagnosisFromPdf(pdfBase64: string): Promise<string> {
    const method = 'generateDiagnosisFromPdf';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER, { pdfBase64Length: pdfBase64?.length }`);

    try {
      const prompt = `
Analise o conteúdo do PDF fornecido e forneça uma análise técnica direta e objetiva.

DIRETRIZES OBRIGATÓRIAS:
1. NÃO identifique ou mencione indivíduos específicos
2. NÃO use termos como "paciente", "indivíduo", "pessoa", "sujeito"
3. NÃO descreva a origem ou natureza dos dados
4. NÃO explique como os dados foram obtidos ou a tecnologia utilizada
5. SEMPRE inclua no FINAL: "Esta análise foi gerada automaticamente por inteligência artificial."
6. Seja direto e objetivo na análise
7. Foque apenas na análise técnica dos dados apresentados
8. Use linguagem clara e acessível
9. Mantenha a análise concisa e relevante
10. Use termos neutros como "os valores", "os parâmetros", "os resultados"

Formato esperado:
"[análise técnica direta dos dados usando termos neutros] Esta análise foi gerada automaticamente por inteligência artificial."
`;

      let file;
      try {
        file = await this.openai.files.create({
          file: Buffer.from(pdfBase64, 'base64') as any,
          purpose: 'vision',
        });
      } catch (error) {
        console.error('Falha ao enviar PDF para o OpenAI', error);
        throw new Error('Não foi possível enviar o PDF para análise');
      }

      const response = await this.openai.responses.create({
        model: 'openrouter/auto',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_file', file_id: file.id },
            ],
          },
        ],
      });

      const result =
        (response as any).output_text?.trim() ||
        (response as any).output?.[0]?.content?.[0]?.text?.trim() ||
        '';

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: dt, resultLength: result?.length }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      throw error;
    }
  }
}
*/

const OPENAI_SERVICE_DISABLED_MESSAGE =
  process.env.OPENAI_SERVICE_DISABLED_MESSAGE;
if (!OPENAI_SERVICE_DISABLED_MESSAGE)
  throw new Error('OPENAI_SERVICE_DISABLED_MESSAGE env variable is required');
const OPENAI_SERVICE_DISABLED_MESSAGE_STR: string =
  OPENAI_SERVICE_DISABLED_MESSAGE;

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  async generateDiagnosis(): Promise<string> {
    this.logger.warn(OPENAI_SERVICE_DISABLED_MESSAGE_STR);
    return OPENAI_SERVICE_DISABLED_MESSAGE_STR;
  }

  async generateDiagnosisFromPdf(): Promise<string> {
    this.logger.warn(OPENAI_SERVICE_DISABLED_MESSAGE_STR);
    return OPENAI_SERVICE_DISABLED_MESSAGE_STR;
  }
}
