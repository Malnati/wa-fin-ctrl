<!-- req/05-entrega-e-implantacao/ambientes-e-configuracoes.md -->
# Ambientes e Configurações

> Base: [./ambientes-e-configuracoes.md](./ambientes-e-configuracoes.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Documentar os parâmetros de implantação para os subprojetos do Yagnostic v5, garantindo consistência entre ambientes, rastreabilidade das variáveis sensíveis e conformidade com os fluxos de entrega descritos no plano de UI/UX. Essa referência atende diretamente [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030), além de preparar a infraestrutura para a futura capacidade colaborativa (REQ-031–REQ-035).

---

## Atualizações quando requisitos exigirem ajustes de ambiente

- Sincronize `ambientes-e-configuracoes.md` e este espelho sempre que novos `REQ-###` ou `RNF-###` alterarem domínios, variáveis, permissões ou rotas, garantindo alinhamento com `build-e-automacao.md`, `publicacao-e-versionamento.md` e `auditoria-e-rastreabilidade.md`.
- Documente dependências com arquitetura (`../01-arquitetura/`), riscos (`../02-planejamento/riscos-e-mitigacoes.md`) e métricas (`../04-qualidade-testes/qualidade-e-metricas.md`).
- Registre a mudança no `CHANGELOG.md`, atualize `req/audit-history.md` e anexe evidências de configuração em `docs/reports/` conforme `revisoes-com-ia.md`.

---

## Ambientes
Utilize a tabela abaixo para alinhar domínios, endpoints e observações específicas por ambiente. Ajuste apenas quando houver aprovação documentada em changelog e nos relatórios de governança.

| Ambiente | Propósito | Domínio/API | Observações |
| --- | --- | --- | --- |
| DEV | Desenvolvimento local, mocks de diagnóstico e áudio | `https://yagnostic-dev.mbra.com.br` | ElevenLabs desativado por padrão, fallback IndexedDB ativo para [REQ-011](../02-planejamento/requisitos-spec.md#req-011). |
| HML | Homologação corporativa | `https://yagnostic-hml.mbra.com.br` | Dados sintéticos, testes E2E e auditorias cromáticas obrigatórias para [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-016](../02-planejamento/requisitos-spec.md#req-016). |
| PRD | Produção clínica | `https://yagnostic.mbra.com.br` | Credenciais oficiais, monitoramento contínuo e publicação conforme [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030). |

> **Nota:** ao ativar fluxos colaborativos (REQ-031–REQ-035), inclua subdomínios dedicados ou feature flags para aprovação humana sem quebrar as integrações principais já cobertas por [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e [REQ-006](../02-planejamento/requisitos-spec.md#req-006).

## Variáveis e Configuração
Liste as variáveis críticas compartilhadas entre os subprojetos e mantenha-as sincronizadas com os arquivos de configuração versionados.

- `API_BASE_URL` — Base utilizada por serviços backend (Node.js) e pelo painel lateral da extensão, suportando [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e [REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- `VITE_API_URL` — URL consumida pelos clientes Vite (web ou extensão) expondo a mesma origem da API, garantindo aderência a [REQ-012](../02-planejamento/requisitos-spec.md#req-012) e [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- `UPLOAD_MAX_SIZE_MB` — Limite de upload alinhado entre cliente e servidor, prevenindo falhas em [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e respeitando SLAs de [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- `ENABLE_AUDIO` / `ELEVENLABS_API_KEY` — Flags e segredos para funcionalidades multimídia previstas na evolução colaborativa (REQ-032, REQ-034) sem ferir [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- `BRANDING_SOURCE_URL` — Endpoint de branding carregado pelos clientes conforme [REQ-016](../02-planejamento/requisitos-spec.md#req-016) e políticas de [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- `APPROVAL_STATUS_ENDPOINT` — Caminho preparado para aprovação clínica colaborativa, antecipando [REQ-031](../02-planejamento/requisitos-spec.md#req-031) enquanto mantém compatibilidade com os fluxos atuais.

### Catálogo de Variáveis Padronizadas
Atualize a matriz sempre que novos subprojetos forem criados ou quando fluxos colaborativos exigirem serviços adicionais.

| Projeto | Variável de Ambiente | Ambiente de Execução | Constante Exportada |
| --- | --- | --- | --- |
| API | `API_BASE_URL` | Node.js (`process.env`) | `API_BASE_URL` |
| UI / Extensão | `VITE_API_URL` | Vite (`import.meta.env`) | `API_BASE_URL` |
| Validadores (futuro) | `APPROVAL_STATUS_ENDPOINT` | Serviços colaborativos | `APPROVAL_STATUS_ENDPOINT` |

### Convenções por Plataforma
- Serviços Node.js utilizam nomes diretos (`API_BASE_URL`, `ENABLE_AUDIO`) e obedecem [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- Aplicações Vite expõem apenas variáveis prefixadas com `VITE_`, garantindo conformidade com [REQ-012](../02-planejamento/requisitos-spec.md#req-012).
- Constantes compartilhadas residem em `src/constants/` dos respectivos projetos, atendendo [REQ-018](../02-planejamento/requisitos-spec.md#req-018) e [REQ-021](../02-planejamento/requisitos-spec.md#req-021).

### Exemplos de Configuração
```yaml
# docker-compose.yml — extrato
services:
  api:
    environment:
      API_BASE_URL: "${API_BASE_URL:-http://localhost:3333}"
  ui:
    environment:
      VITE_API_URL: "${VITE_API_URL:-http://localhost:3333}"
```

```bash
# api/.env
API_BASE_URL=http://localhost:3333

# ui/.env
VITE_API_URL=http://localhost:3333
```

Ajuste os valores padrão para refletir cada ambiente e registre exceções no changelog da entrega em cumprimento a [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

### Validação dos Templates `.env.example`
Execute o script abaixo sempre que atualizar arquivos `.env.example`. Ele verifica se o template inclui apenas variáveis sem valor padrão definido no `docker-compose.yml`, reforçando [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

```bash
python - <<'PY'
from pathlib import Path

compose_defaults = {}
for line in Path('docker-compose.yml').read_text().splitlines():
    if '${' not in line:
        continue
    start = line.index('${') + 2
    end = line.find(':-', start)
    if end == -1:
        continue
    close = line.find('}', end)
    default = line[end + 2:close]
    compose_defaults[line[start:end]] = default

violations = {}
for template in Path('.').rglob('.env.example'):
    template_vars = {
        line.split('=', 1)[0]
        for line in template.read_text().splitlines()
        if line and not line.startswith('#')
    }
    invalid = [
        var for var in sorted(template_vars)
        if compose_defaults.get(var, '').strip()
    ]
    if invalid:
        violations[str(template)] = invalid

if violations:
    for template, vars_ in violations.items():
        print(f'❌ Variáveis proibidas no template {template}: {vars_}')
else:
    print('✅ Templates .env.example contêm apenas segredos sem default no compose')
PY
```

O resultado esperado é a mensagem ✅. Qualquer violação deve ser tratada antes de promover artefatos para ambientes superiores.

## Provisionamento
1. Configure variáveis em cofres do CI/CD (por exemplo, GitHub Secrets) e replique-as para `.env` locais via mecanismos seguros, assegurando [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
2. Execute `npm install` e `npm run build` nos subprojetos JavaScript/TypeScript (UI, API, extensões) para gerar artefatos determinísticos, conforme [REQ-018](../02-planejamento/requisitos-spec.md#req-018) e [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
3. Publique bundles estáticos em ambiente com TLS e disponibilize APIs via Docker/Compose utilizando imagens assinadas, preservando [REQ-012](../02-planejamento/requisitos-spec.md#req-012) e [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
4. Registre evidências de deploy e automações no changelog correspondente para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Monitoramento e Alertas
- Exponha health-checks HTTP (ex.: `/health`) e métricas (`/metrics`) para todos os serviços containerizados, atendendo [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e preparando dados para [REQ-034](../02-planejamento/requisitos-spec.md#req-034).
- Configure dashboards (Grafana, Kibana ou equivalente) com métricas de latência, filas e consumo de recursos para suportar [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Defina alertas operacionais alinhados aos SLAs documentados em `req/02-planejamento/riscos-e-mitigacoes.md`, vinculando-os a [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e aos fluxos colaborativos (REQ-031–REQ-035).

## Segurança e Conformidade
- Não versione tokens ou chaves; documente processos de rotação periódica para cumprir [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Mascaramento de dados sensíveis deve ser habilitado em logs e relatórios, garantindo [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e preparando auditorias de [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- Garanta que acessos administrativos estejam condicionados a consentimentos/documentos válidos registrados na fase de Visão, mantendo [REQ-025](../02-planejamento/requisitos-spec.md#req-025) e [REQ-026](../02-planejamento/requisitos-spec.md#req-026).

## Documentação e Auditoria
- Cada deploy deve registrar changelog com número do commit, ambiente e artefatos publicados para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Relatórios de testes, auditorias e evidências devem ser armazenados em `docs/reports/` ou diretório equivalente, referenciados pelo número do changelog, atendendo [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Configurações divergentes precisam de aprovação prévia na governança técnica (`req/06-governanca-tecnica-e-controle-de-qualidade/`), garantindo aderência a [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

[Voltar ao índice](README-spec.md)
