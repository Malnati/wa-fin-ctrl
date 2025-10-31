// api/src/modules/whatsapp/dto/wa-zip-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class WaZipProcessedFileDto {
  @ApiProperty({
    description: 'Nome original do arquivo enviado ao OpenRouter',
    example: 'recibo-2025-02-15.pdf',
  })
  origem!: string;

  @ApiProperty({
    description: 'Caminho relativo (a partir de cloud/api) do JSON com o texto extraído',
    example: 'extracted/recibo-2025-02-15.json',
  })
  jsonPath!: string;
}
