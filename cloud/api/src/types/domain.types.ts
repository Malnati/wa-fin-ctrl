// api/src/types/domain.types.ts

export type DomainType = 'corporate' | 'development' | 'test';

export interface AuthorizedDomain {
  domain: string;
  name: string;
  description: string;
  active: boolean;
  type: DomainType;
}

export interface DomainsResponse {
  domains: AuthorizedDomain[];
  total: number;
  timestamp: string;
}
