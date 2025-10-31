// Fallback de tipos para Express.Multer.File quando usando @types/express@5
// Garante que referências a `Express.Multer.File` compilem sem depender da versão 4 dos tipos.

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname?: string;
        originalname: string;
        encoding?: string;
        mimetype: string;
        size?: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer: Buffer;
      }
    }
  }
}

export {};
