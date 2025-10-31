<!-- proj/02-planejamento/wbs-spec.md -->
# WBS — WA Fin Ctrl

> Base: [./wbs.md](./wbs.md)

## 1. Preparação
1.1 Revisar documentação legada e migrar para `proj/`  
1.2 Definir plano de auditoria e checklists obrigatórios  
1.3 Configurar ambientes locais (Poetry, Docker, dependências OCR)

## 2. Pipeline local
2.1 Implementar processamento incremental  
2.2 Implementar comandos auxiliares (`pdf`, `img`, `verificar`, `corrigir`)  
2.3 Integrar OCR + IA  
2.4 Gerar relatórios HTML/CSV  
2.5 Publicar API FastAPI e WebSocket  
2.6 Automatizar testes (`wa-fin.py teste`)

## 3. Plataforma cloud
3.1 Refatorar nomenclaturas e domínios (Yagnostic → WA Fin Ctrl)  
3.2 Configurar autenticação e RBAC  
3.3 Implementar ingestão de pacotes  
3.4 Criar dashboard de revisão  
3.5 Configurar notificações externas  
3.6 Monitorar métricas e quotas

## 4. Governança e compliance
4.1 Atualizar LGPD, retenção e políticas de consentimento  
4.2 Estabelecer rotina de backups e storage seguro  
4.3 Conduzir auditorias periódicas  
4.4 Manter changelog, histórico e relatórios de auditoria

## 5. Implantação e operação
5.1 Preparar playbook de deploy (local e cloud)  
5.2 Automatizar pipelines CI/CD  
5.3 Treinar usuários e produzir material de suporte  
5.4 Acompanhar métricas pós-release e coletar feedback

[Voltar ao planejamento](README-spec.md)
