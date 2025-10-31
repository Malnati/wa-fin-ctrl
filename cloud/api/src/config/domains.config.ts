// api/src/config/domains.config.ts
import type { AuthorizedDomain } from '../types/domain.types';

/**
 * Configuração estática de domínios corporativos autorizados
 * Esta lista contém os domínios que são considerados seguros e autorizados
 * para uso com a extensão Chrome.
 */
export const AUTHORIZED_DOMAINS: readonly AuthorizedDomain[] = [
  {
    domain: 'millennium.com.br',
    name: 'Millennium Brasil',
    description: 'Domínio corporativo principal da Millennium Brasil',
    active: true,
    type: 'corporate',
  },
  {
    domain: 'mbra.com.br',
    name: 'MBRA',
    description: 'Domínio alternativo da Millennium Brasil',
    active: true,
    type: 'corporate',
  },
  {
    domain: 'localhost',
    name: 'Desenvolvimento Local',
    description: 'Ambiente de desenvolvimento local',
    active: true,
    type: 'development',
  },
  {
    domain: '127.0.0.1',
    name: 'Localhost IP',
    description: 'Endereço IP local para desenvolvimento',
    active: true,
    type: 'development',
  },
] as const;
