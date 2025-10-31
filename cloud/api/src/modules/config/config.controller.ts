// api/src/modules/config/config.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConfigResponseDto } from './dto/config-response.dto';

const CONFIG_ROUTE = 'api/config';
const CONFIG_API_TAG = 'Config';
const GOOGLE_CLIENT_ID_KEY = 'GOOGLE_CLIENT_ID';
const AUTHORIZED_DOMAINS_KEY = 'AUTHORIZED_DOMAINS';
const DEFAULT_AUTHORIZED_DOMAINS_VALUE = '[]';
const EMPTY_GOOGLE_CLIENT_ID = '';
const EMPTY_ALLOWED_ORIGINS: string[] = [];
const STRING_TYPE_LABEL = 'string';
const MINIMUM_ORIGIN_LENGTH = 0;

function parseAllowedOrigins(rawValue: string): string[] {
  const normalizedValue = rawValue || DEFAULT_AUTHORIZED_DOMAINS_VALUE;

  try {
    const parsedValue = JSON.parse(normalizedValue);
    if (!Array.isArray(parsedValue)) {
      return [...EMPTY_ALLOWED_ORIGINS];
    }

    const filteredOrigins = parsedValue.filter(
      (origin) =>
        typeof origin === STRING_TYPE_LABEL &&
        origin.length > MINIMUM_ORIGIN_LENGTH,
    );

    return filteredOrigins.length > MINIMUM_ORIGIN_LENGTH
      ? [...new Set(filteredOrigins)]
      : [...EMPTY_ALLOWED_ORIGINS];
  } catch {
    return [...EMPTY_ALLOWED_ORIGINS];
  }
}

@ApiTags(CONFIG_API_TAG)
@Controller(CONFIG_ROUTE)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOkResponse({ type: ConfigResponseDto })
  getConfig(): ConfigResponseDto {
    const clientId =
      this.configService.get<string>(GOOGLE_CLIENT_ID_KEY) ??
      EMPTY_GOOGLE_CLIENT_ID;
    const authorizedOrigins = parseAllowedOrigins(
      this.configService.get<string>(AUTHORIZED_DOMAINS_KEY) ??
        DEFAULT_AUTHORIZED_DOMAINS_VALUE,
    );

    return {
      googleClientId: clientId,
      allowedOrigins: authorizedOrigins,
    };
  }
}
