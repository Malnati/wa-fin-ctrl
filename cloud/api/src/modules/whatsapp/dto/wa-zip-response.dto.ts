// cloud/api/src/modules/whatsapp/dto/wa-zip-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class WaZipProcessedFileDto {
  @ApiProperty({
    description: 'Nome original do arquivo enviado ao OpenRouter',
    example: 'recibo-2025-02-15.pdf',
  })
  origem!: string;

  @ApiProperty({
    description: 'Autor identificado a partir do _chat.txt correspondente',
    example: 'Ricardo',
  })
  author!: string;

  @ApiProperty({
    description: 'Caminho relativo (a partir de cloud/api) do JSON com o texto extraído',
    example: 'extracted/recibo-2025-02-15.json',
  })
  jsonPath!: string;

  @ApiProperty({
    description: 'Caminho relativo do arquivo TXT contendo o autor associado à mídia',
    example: 'extracted/recibo-2025-02-15.txt',
  })
  authorTxtPath!: string;
}
