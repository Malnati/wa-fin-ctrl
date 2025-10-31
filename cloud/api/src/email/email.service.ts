// Caminho relativo ao projeto: src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Mensagem {
  id: string;
  mensagem: {
    destinatarios: string[];
    assunto: string;
    corpo: string;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly gmail;
  private readonly mensagens: Mensagem[];
  private readonly destinos: Record<string, string>;

  constructor() {
    this.gmail = google.gmail({ version: 'v1', auth: this.getAuth() });
    this.mensagens = this.loadMensagens();
    this.destinos = this.loadDestinos();
  }

  private getAuth() {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;

      if (!clientId || !clientSecret) {
        throw new Error(
          'GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar definidos nas variáveis de ambiente',
        );
      }

      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      if (refreshToken) {
        auth.setCredentials({
          refresh_token: refreshToken,
        });
      } else {
        this.logger.warn(
          'getAuth: GOOGLE_REFRESH_TOKEN não definido. Causa: variável de ambiente ausente. Solução: configure GOOGLE_REFRESH_TOKEN.',
        );
      }

      return auth;
    } catch (error) {
      this.logger.error(
        'getAuth: falha ao configurar autenticação do Gmail. Causa: variáveis de ambiente inválidas. Solução: verifique GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI.',
        error as Error,
      );
      throw error;
    }
  }

  private loadMensagens(): Mensagem[] {
    try {
      const file = readFileSync(join(__dirname, 'mensagens.json'), 'utf8');
      return JSON.parse(file);
    } catch (error) {
      this.logger.error(
        'loadMensagens: falha ao carregar mensagens. Causa: mensagens.json ausente ou inválido. Solução: garanta que o arquivo exista e contenha JSON válido.',
        error as Error,
      );
      throw error;
    }
  }

  private loadDestinos(): Record<string, string> {
    try {
      const file = readFileSync(join(__dirname, 'destinos.json'), 'utf8');
      return JSON.parse(file);
    } catch (error) {
      this.logger.error(
        'loadDestinos: falha ao carregar destinos. Causa: destinos.json ausente ou inválido. Solução: verifique o arquivo e seu conteúdo JSON.',
        error as Error,
      );
      throw error;
    }
  }

  async enviar(
    id: string,
    destinatarios?: string[],
    assunto?: string,
    corpo?: string,
  ): Promise<void> {
    const mensagem = this.mensagens.find((m) => m.id === id);

    if (!mensagem) {
      throw new Error(`Mensagem com id ${id} não encontrada`);
    }

    const destFromFile = mensagem.mensagem.destinatarios.map(
      (d) => this.destinos[d] || d,
    );

    const finalDest =
      destinatarios && destinatarios.length > 0 ? destinatarios : destFromFile;
    const finalAssunto = assunto ?? mensagem.mensagem.assunto;
    const finalCorpo = corpo ?? mensagem.mensagem.corpo;

    const rawMessage = this.createEmail(finalDest, finalAssunto, finalCorpo);

    try {
      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage },
      });
    } catch (error) {
      this.logger.error(
        'enviar: falha ao enviar e-mail via Gmail API. Causa: credenciais inválidas ou problema de rede. Solução: verifique as credenciais do Gmail e a conectividade.',
        error as Error,
      );
      throw error;
    }
  }

  private createEmail(to: string[], subject: string, body: string): string {
    try {
      const messageParts = [
        `To: ${to.join(', ')}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        body,
      ];
      const message = messageParts.join('\n');
      return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (error) {
      this.logger.error(
        'createEmail: erro ao montar e-mail. Causa: dados de entrada inválidos. Solução: verifique destinatários, assunto e corpo.',
        error as Error,
      );
      throw error;
    }
  }
}
