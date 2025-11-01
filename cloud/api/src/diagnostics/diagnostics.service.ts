// Caminho relativo ao projeto: src/diagnostics/diagnostics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DiagnosticResponseDto } from './dto/diagnostic-response.dto';
import { AudioResponseDto } from './dto/audio-response.dto';
// import { OpenAiService } from '../openai/openai.service'; // Integração OpenAI desativada
import { PdfGeneratorService } from './pdf-generator.service';
import { OcrService } from './ocr.service';
import * as path from 'path';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { TextQualityAgent } from '../agents/text-quality.agent';
import { TextDiagnoseAgent } from '../agents/text-diagnose.agent';
import { PdfDiagnoseAgent } from '../agents/pdf-diagnose.agent';
import { ResultValidatorAgent } from '../agents/result-validator.agent';
import { API_BASE_URL } from '../constants/constants';
import { OpenRouterService } from '../openrouter/openrouter.service';
// import { GoogleDriveService } from '../storage/google-drive.service';

const DEFAULT_PDF_URL = `${API_BASE_URL}/relatorio.pdf`;
const BYPASS_ORIGINAL_FILE_URL = DEFAULT_PDF_URL;
const DEFAULT_BASE_URL = API_BASE_URL;
const OPENAI_DIAGNOSIS_DISABLED_MESSAGE = 'Integração com OpenAI desativada.';

const OPENROUTER_INDICATOR_PROMPT = `INSTRUÇÕES (pt-BR):
Objetivo: Ler o documento em PDF (resultado laboratorial) e gerar um relatório aprimorado, estruturado obrigatoriamente com os blocos abaixo, no formato textual puro (sem markdown, sem emojis, sem negrito, sem bullet points fora do padrão definido).

Relatório Técnico para Equipe Médica
1. Resumo Geral
Apresente um resumo técnico do exame, citando idade, sexo e principais parâmetros alterados. Mantenha linguagem neutra, sem rótulos diagnósticos conclusivos. Use expressões como “valor limítrofe”, “discreto aumento” ou “redução leve”, evitando termos categóricos como “pré-diabetes” ou “processo inflamatório” sem respaldo laboratorial direto.

2. Interpretação dos Resultados
Liste os principais achados anormais, um por linha, no formato:
- [Exame] ([valor e unidade]; ref. [intervalo de referência]): [interpretação clínica curta e objetiva].
Inclua apenas valores alterados ou limítrofes. Mantenha o tom técnico e objetivo, sem especulação.

3. Correlação entre os Achados
Explique brevemente relações fisiológicas plausíveis entre os achados, sem conclusões diagnósticas. Exemplo: “glicose e colesterol limítrofes podem sugerir tendência metabólica leve”.

4. Diagnósticos Potenciais
Liste até quatro hipóteses compatíveis com os dados laboratoriais, usando linguagem condicional (“pode estar associado”, “pode indicar”). Evite termos como “síndrome metabólica”, “resistência insulínica” ou “inflamação subclínica” sem evidência objetiva.

5. Exames Confirmatórios Necessários
Liste exames complementares recomendados para confirmação diagnóstica, sem justificar condutas terapêuticas.

6. Recomendações e Observações
Inclua orientações gerais e prudentes, como acompanhamento médico, repetição de exames e manutenção de estilo de vida saudável. Nunca prescreva terapias, medicamentos ou dosagens.

7. Explicação para o Paciente
Reescreva o conteúdo em linguagem acessível e empática, sem termos técnicos nem imperativos. Fale de forma descritiva e neutra, explicando que os achados são comuns e costumam requerer acompanhamento. Máximo de 900 caracteres.

Encerramento obrigatório:
"Este diagnóstico foi gerado por inteligência artificial e deve ser avaliado por um médico antes de qualquer decisão clínica."

Regras Gerais:
- Não afirmar diagnósticos categóricos com base em um único parâmetro.
- Incluir todo parâmetro fora ou limítrofe das referências (como CPK, LDH, ferritina).
- Proibido o uso de emojis, ícones, negrito, tabelas ou marcações.
- Sempre usar nomes e unidades exatamente como no laudo.
- Idioma: Português do Brasil.
- Tom: técnico e profissional na seção médica; empático e neutro na explicação.
- Extensão máxima: 3.500 caracteres.

Instruções finais:
- Responda apenas no formato especificado.
- Não adicione cabeçalhos, observações, notas ou texto fora do modelo.`;

const OPENROUTER_VALIDATED_DIAGNOSTIC_PROMPT = `INSTRUÇÕES (pt-BR):
Objetivo: Receber dois documentos — o laudo original e o relatório anterior gerado por IA — e produzir um NOVO RELATÓRIO APRIMORADO revisado, sem exibir validação ou comparativos.

Tarefa:
- Compare o relatório anterior com o laudo original.
- Corrija internamente quaisquer alucinações, extrapolações ou omissões.
- Gere apenas o relatório final corrigido, sem mencionar o processo de validação.

Critérios de correção automáticos:
- Não classificar “pré-diabetes” com base em uma única glicemia de jejum; usar “valor limítrofe, requer confirmação”.
- Não indicar “processo inflamatório” se PCR ≤ 5 mg/L.
- Não citar “risco cardiovascular aumentado” sem cálculo formal; usar “fator de risco isolado”.
- Incluir todos os parâmetros fora ou limítrofes do laudo (glicose, colesterol, CPK, LDH, ferritina, monócitos).
- Evitar qualquer menção a tratamento, dosagem ou dieta prescritiva.
- Reescrever a explicação ao paciente de forma impessoal e preditiva (“em muitos casos”, “geralmente indica”).

Formato obrigatório de saída (texto puro, sem markdown, emojis, negrito ou tabelas):

Relatório Técnico para Equipe Médica
1. Resumo Geral
[Resumo técnico e neutro com idade, sexo e principais achados alterados, incluindo valores e interpretações curtas.]

2. Interpretação dos Resultados
- [Exame] ([valor e unidade]; ref. [intervalo]): [interpretação curta e objetiva].
(Apenas parâmetros fora ou limítrofes; máximo 10 linhas.)

3. Correlação entre os Achados
[Explique apenas correlações plausíveis entre resultados alterados, sem especulação.]

4. Diagnósticos Potenciais
[Até quatro hipóteses compatíveis com os dados laboratoriais, em linguagem condicional.]

5. Exames Confirmatórios Necessários
[Até seis exames complementares objetivamente relacionados aos achados.]

6. Recomendações e Observações
[Até quatro recomendações prudentes e genéricas: dieta equilibrada, atividade física, acompanhamento médico, repetição de exames.]

7. Explicação para o Paciente
[Linguagem simples, impessoal e preditiva, sem jargões. Máximo 900 caracteres.]

Encerramento obrigatório:
"Este diagnóstico foi gerado por inteligência artificial e deve ser avaliado por um médico antes de qualquer decisão clínica."

Regras adicionais:
- Aplicar validação de alucinações internamente, sem exibir essa etapa.
- O relatório final deve ser coerente com o laudo e livre de linguagem impositiva.
- Idioma: Português do Brasil.
- Extensão recomendada: 2.000 a 3.500 caracteres.
- Sem introduções, comentários ou notas extras.`;

const PUBLIC_STORAGE_DIR = 'public';
const DIAGNOSTIC_FILE_PREFIX = 'diagnostico-';
const DEFAULT_FILE_EXTENSION = '.bin';
const STATUS_SUCCESS = 'OK';
const GENERIC_SUMMARY_MESSAGE = 'O arquivo foi analisado com sucesso.';
const PDF_SUMMARY_MESSAGE = 'PDF analisado com sucesso.';
const EMPTY_DIAGNOSIS_MESSAGE = 'Diagnóstico indisponível.';
const FILE_REQUIRED_MESSAGE =
  'Arquivo do usuário é obrigatório para o salvamento.';
const FILE_SAVE_ERROR_MESSAGE = 'Falha ao salvar arquivo original localmente.';
const PDF_MIME_TYPE = 'application/pdf';
const PDF_DATA_URL_PREFIX = 'data:application/pdf;base64,';
const DEFAULT_PDF_FILENAME = 'document.pdf';
const DEFAULT_OPENROUTER_ENGINE = 'mistral-ocr';
const PDF_BUFFER_READ_ERROR_PREFIX =
  'resolvePdfBuffer: falha ao ler arquivo salvo em';
const VALIDATED_DIAGNOSIS_GENERATION_FAILED_MESSAGE =
  'Falha ao validar diagnóstico com o OpenRouter.';
const VALIDATED_DIAGNOSIS_EMPTY_SOURCE_MESSAGE =
  'Diagnóstico inicial indisponível para validação.';
const AUDIO_GENERATION_DISABLED_MESSAGE =
  'Geração de áudio via TTS está desativada para este ambiente.';

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(
    // private readonly openAiService: OpenAiService, // Integração OpenAI desativada
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly ocrService: OcrService,
    private readonly textQuality: TextQualityAgent,
    private readonly textDiag: TextDiagnoseAgent,
    private readonly pdfDiag: PdfDiagnoseAgent,
    private readonly validator: ResultValidatorAgent,
    private readonly openRouterService: OpenRouterService,
    // private readonly drive: GoogleDriveService,
  ) {}

  async handle(file: Express.Multer.File, textExtracted?: string) {
    const method = 'handle';
    const t0 = Date.now();

    this.logger.log(`${method} ENTER`);

    try {
      const textSufficient = this.textQuality.isSufficient(textExtracted ?? '');

      let pdfUsed = !textSufficient;
      let preDiag = textSufficient
        ? await this.textDiag.diagnose(textExtracted!)
        : await this.pdfDiag.diagnose(file);

      if (!this.validator.isGood(preDiag, { textExtracted, file })) {
        preDiag = await this.pdfDiag.diagnose(file);
        pdfUsed = true;
      }

      const result = { status: 'OK', diagnostico: preDiag, pdfUsed };
      const dt = Date.now() - t0;
      this.logger.log(`${method} EXIT, { durationMs: dt, pdfUsed }`);
      return result;
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: falha ao processar diagnóstico inicial. Causa: erro dos agentes ou arquivo inválido. Solução: revisar entrada e configuração dos agentes. durationMs=${dt}`,
        e instanceof Error ? e : new Error(String(e)),
      );
      throw e;
    }
  }

  async submitDiagnostic(
    userFile: Express.Multer.File,
    generateAudio: boolean = false,
    voiceID?: string,
    publicBaseUrl?: string,
  ): Promise<DiagnosticResponseDto> {
    const method = 'submitDiagnostic';
    const t0 = Date.now();
    this.logger.log(
      `${method} ENTER, { fileSize: ${userFile?.size}, fileType: ${userFile?.mimetype}, originalName: ${userFile?.originalname}, generateAudio: ${generateAudio}, voiceID: ${voiceID} }`,
    );
    let result: DiagnosticResponseDto;
    try {
      if (!userFile) {
        throw new Error(FILE_REQUIRED_MESSAGE);
      }
      // 1. Salvar arquivo original
      const originalFile = await this.saveOriginalFile(userFile, publicBaseUrl);

      // 2. Gerar áudio da análise (apenas se solicitado)
      let audioUrl: string | undefined;

      // 3. Gerar PDF do relatório
      this.logger.log(
        `${method}: 'Generating PDF report for:', ${userFile.originalname}`,
      );
      let aiDiagnosis: string | undefined;
      if (originalFile.mimetype === PDF_MIME_TYPE) {
        aiDiagnosis =
          await this.requestPdfDiagnosisFromOpenRouter(originalFile);
      }
      const initialDiagnosis = aiDiagnosis ?? '';

      let validatedDiagnosis = initialDiagnosis;

      if (initialDiagnosis && initialDiagnosis.trim()) {
        try {
          const diagnosisValidated =
            await this.requestValidatedDiagnosisFromOpenRouter(
              originalFile,
              initialDiagnosis,
            );
          if (diagnosisValidated && diagnosisValidated.trim()) {
            validatedDiagnosis = diagnosisValidated;
          }
        } catch (error) {
          this.logger.warn(
            `${method}: ${VALIDATED_DIAGNOSIS_GENERATION_FAILED_MESSAGE}`,
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }

      const safeDiagnosis = validatedDiagnosis ?? '';
      if (generateAudio) {
        this.logger.log(
          `${method}: Áudio solicitado, porém integração de TTS está desativada.`,
        );
        audioUrl = undefined;
      }
      const diagnosticPDFUrl = safeDiagnosis
        ? await this.generatePdf(safeDiagnosis, originalFile, publicBaseUrl)
        : undefined;
      const normalizedPdfUrl =
        diagnosticPDFUrl && diagnosticPDFUrl.trim().length > 0
          ? diagnosticPDFUrl
          : undefined;

      // 6. Preparar resposta
      const resumo =
        originalFile.mimetype === PDF_MIME_TYPE
          ? PDF_SUMMARY_MESSAGE
          : GENERIC_SUMMARY_MESSAGE;
      const text = safeDiagnosis || EMPTY_DIAGNOSIS_MESSAGE;
      const pdfSentRaw = originalFile.mimetype === PDF_MIME_TYPE;
      result = {
        status: STATUS_SUCCESS,
        resumo,
        text,
        fileUrl: originalFile.fileUrl,
        audioUrl,
        pdfUrl: normalizedPdfUrl,
        pdfSentRaw,
      };

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, resultType: ${typeof result}, hasAudio: ${!!audioUrl}, hasPdf: ${!!normalizedPdfUrl} }`,
      );
    } catch (e) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: falha ao concluir diagnóstico. Causa: erro interno durante geração de resposta. Solução: revisar serviços de IA e OCR. durationMs=${dt}`,
        e instanceof Error ? e : new Error(String(e)),
      );
      throw e;
    }
    return result;
  }

  private async saveOriginalFile(
    file: Express.Multer.File,
    publicBaseUrl?: string,
  ): Promise<
    Express.Multer.File & {
      savedFileName: string;
      savedFilePath: string;
      fileUrl: string;
    }
  > {
    const method = 'saveOriginalFile';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { fileName: ${file?.originalname}, fileSize: ${file?.size} }`,
    );

    try {
      if (!file) {
        throw new Error(FILE_REQUIRED_MESSAGE);
      }
      // Criar nome único para o arquivo com padrão consistente
      const timestamp = Date.now();
      const extension =
        path.extname(file.originalname) || DEFAULT_FILE_EXTENSION;
      const fileName = `${DIAGNOSTIC_FILE_PREFIX}${timestamp}${extension}`;

      if (!existsSync(PUBLIC_STORAGE_DIR)) {
        await mkdir(PUBLIC_STORAGE_DIR, { recursive: true });
      }

      const filePath = path.join(PUBLIC_STORAGE_DIR, fileName);
      await writeFile(filePath, file.buffer);

      const baseUrl = this.resolvePublicBaseUrl(publicBaseUrl);
      const fileUrl = `${baseUrl}/${fileName}`;

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, fileName: ${fileName}, fileUrl: ${fileUrl} }`,
      );
      return {
        ...file,
        savedFileName: fileName,
        savedFilePath: filePath,
        fileUrl,
      };
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: ${FILE_SAVE_ERROR_MESSAGE}. durationMs=${dt}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private resolvePublicBaseUrl(baseUrlOverride?: string): string {
    const envBaseUrl = process.env.BASE_URL || DEFAULT_BASE_URL;
    const candidate =
      baseUrlOverride && baseUrlOverride.trim().length > 0
        ? baseUrlOverride
        : envBaseUrl;
    return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
  }

  async generateAudioFromText(
    text: string,
    voiceID?: string,
  ): Promise<AudioResponseDto> {
    const method = 'generateAudioFromText';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER — solicitação de áudio recebida, porém TTS está desativado.`,
    );

    if (!text || !text.trim()) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, { durationMs: dt, error: 'Texto não pode estar vazio' }`,
      );
      throw new Error('Texto não pode estar vazio');
    }

    const result: AudioResponseDto = {
      status: 'DISABLED',
      audioUrl: '',
      voiceID: voiceID ?? '',
      text: text.trim(),
      message: AUDIO_GENERATION_DISABLED_MESSAGE,
    };

    const dt = Date.now() - t0;
    this.logger.log(
      `${method} EXIT, { durationMs: dt, status: ${result.status} }`,
    );
    return result;
  }

  private async generatePdf(
    diagnosis: string,
    originalFile: any,
    publicBaseUrl?: string,
  ): Promise<string> {
    const method = 'generatePdf';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { diagnosisLength: ${diagnosis?.length}, filename: ${originalFile.originalname} }`,
    );

    try {
      if (
        !diagnosis ||
        !diagnosis.trim() ||
        diagnosis === 'Erro ao gerar análise com IA'
      ) {
        const dt = Date.now() - t0;
        this.logger.log(
          `${method} EXIT, { durationMs: ${dt}, result: 'default PDF URL' }`,
        );
        return '';
      }

      const result = await this.pdfGeneratorService.generateDiagnosticPdf(
        diagnosis,
        originalFile,
        publicBaseUrl ? { baseUrl: publicBaseUrl } : undefined,
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, result: ${result} }`,
      );
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: falha ao gerar PDF. Causa: erro no serviço de PDF ou dados inválidos. Solução: verifique o diagnóstico e o conteúdo extraído. durationMs=${dt}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return ''; // Fallback para PDF padrão
    }
  }

  private async requestPdfDiagnosisFromOpenRouter(
    originalFile: any,
  ): Promise<string> {
    const method = 'requestPdfDiagnosisFromOpenRouter';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { filename: ${originalFile.originalname} }`,
    );
    try {
      const pdfBuffer = await this.resolvePdfBuffer(originalFile);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error(
          `${method}: buffer do arquivo PDF ausente ou vazio para ${originalFile.originalname}.`,
        );
      }
      const pdfDataUrl = this.createPdfDataUrl(pdfBuffer);
      const preferredEngine = this.resolvePreferredPdfEngine();
      const diagnosis = await this.openRouterService.submitPdfBase64(
        pdfDataUrl,
        {
          prompt: OPENROUTER_INDICATOR_PROMPT,
          filename: this.resolvePdfFilename(originalFile),
          engine: preferredEngine,
        },
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, engine: ${preferredEngine}, diagnosisLength: ${diagnosis?.length ?? 0} }`,
      );
      return diagnosis;
    } catch (error) {
      const dt = Date.now() - t0;
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `${method}: falha ao solicitar diagnóstico ao OpenRouter. durationMs=${dt}`,
        normalizedError,
      );
      throw normalizedError;
    }
  }

  private async requestValidatedDiagnosisFromOpenRouter(
    originalFile: any,
    diagnosis: string,
  ): Promise<string> {
    const method = 'requestValidatedDiagnosisFromOpenRouter';
    const t0 = Date.now();

    const trimmedDiagnosis = diagnosis?.trim();

    if (!trimmedDiagnosis) {
      this.logger.warn(
        `${method}: ${VALIDATED_DIAGNOSIS_EMPTY_SOURCE_MESSAGE}`,
      );
      return '';
    }

    this.logger.log(
      `${method} ENTER, { filename: ${originalFile?.originalname}, initialDiagnosisLength: ${trimmedDiagnosis.length} }`,
    );

    try {
      const pdfBuffer = await this.resolvePdfBuffer(originalFile);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error(
          `${method}: buffer do arquivo PDF ausente ou vazio para ${originalFile?.originalname}.`,
        );
      }

      const pdfDataUrl = this.createPdfDataUrl(pdfBuffer);
      const preferredEngine = this.resolvePreferredPdfEngine();
      const validatedDiagnosis = await this.openRouterService.submitPdfBase64(
        pdfDataUrl,
        {
          prompt: OPENROUTER_VALIDATED_DIAGNOSTIC_PROMPT,
          filename: this.resolvePdfFilename(originalFile),
          engine: preferredEngine,
          context: trimmedDiagnosis,
        },
      );
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, engine: ${preferredEngine}, validatedDiagnosisLength: ${validatedDiagnosis?.length ?? 0} }`,
      );
      return validatedDiagnosis;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method}: falha ao validar diagnóstico com o OpenRouter. durationMs=${dt}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private async resolvePdfBuffer(
    originalFile: Express.Multer.File & { savedFilePath?: string },
  ): Promise<Buffer | undefined> {
    if (originalFile?.buffer && originalFile.buffer.length > 0) {
      return originalFile.buffer;
    }

    if (originalFile?.savedFilePath) {
      try {
        return await readFile(originalFile.savedFilePath);
      } catch (error) {
        this.logger.error(
          `${PDF_BUFFER_READ_ERROR_PREFIX} ${originalFile.savedFilePath}.`,
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    return undefined;
  }

  private createPdfDataUrl(buffer: Buffer): string {
    const base64 = buffer.toString('base64');
    return `${PDF_DATA_URL_PREFIX}${base64}`;
  }

  private resolvePdfFilename(originalFile: Express.Multer.File): string {
    if (
      originalFile?.originalname &&
      originalFile.originalname.trim().length > 0
    ) {
      return originalFile.originalname;
    }

    return DEFAULT_PDF_FILENAME;
  }

  private resolvePreferredPdfEngine(): string {
    const engineFromEnv = process.env.OPENROUTER_PDF_ENGINE;
    const sanitizedEngine = engineFromEnv?.trim();

    if (sanitizedEngine) {
      return sanitizedEngine;
    }

    return DEFAULT_OPENROUTER_ENGINE;
  }
}
