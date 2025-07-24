-- db.ddl
-- Caminho relativo ao projeto: db/db.ddl
-- Esquema unificado do banco de dados SQLite para o sistema de processamento financeiro
-- Versão: 2.0 - Unificado e Estável

-- ========================================
-- TABELAS PRINCIPAIS (Sistema Unificado)
-- ========================================

-- 1) Tabela de processamentos
CREATE TABLE core_processamento (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo                  VARCHAR(20) NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'iniciado',
  data_hora_inicio      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_hora_fim         DATETIME NULL,
  arquivos_processados  INTEGER NOT NULL DEFAULT 0,
  arquivos_erro         INTEGER NOT NULL DEFAULT 0,
  mensagem              TEXT NULL,
  erro                  TEXT NULL
);

-- 2) Tabela de entradas financeiras (unificada)
CREATE TABLE core_entradafinanceira (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  data_hora             DATETIME NOT NULL,
  valor                 DECIMAL(10,2) NOT NULL,
  descricao             VARCHAR(500) NOT NULL,
  classificacao         VARCHAR(20) NOT NULL,
  arquivo_origem        VARCHAR(255) NULL,
  processamento_id      INTEGER NULL,
  data_criacao          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_modificacao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  desconsiderada        BOOLEAN NOT NULL DEFAULT 0,
  -- Campos unificados (antigos campos legacy integrados)
  remetente             VARCHAR(100) NULL,
  momento_mensagem      DATETIME NULL,
  momento_transacao     DATETIME NULL,
  ricardo               DECIMAL(10,2) NULL,
  rafael                DECIMAL(10,2) NULL,
  ocr_texto             TEXT NULL,
  validade              VARCHAR(50) NULL,
  motivo_erro           TEXT NULL,
  FOREIGN KEY(processamento_id) REFERENCES core_processamento(id) ON DELETE CASCADE
);

-- 3) Tabela de arquivos processados
CREATE TABLE core_arquivoprocessado (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_arquivo          VARCHAR(255) NOT NULL,
  tipo                  VARCHAR(10) NOT NULL,
  tamanho               BIGINT NOT NULL,
  data_upload           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_processamento    DATETIME NULL,
  processamento_id      INTEGER NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'pendente',
  erro                  TEXT NULL,
  -- Campo unificado para OCR
  ocr_texto             TEXT NULL,
  FOREIGN KEY(processamento_id) REFERENCES core_processamento(id) ON DELETE CASCADE
);

-- 4) Tabela de histórico de correções
CREATE TABLE core_correcaohistorico (
  "index"               INTEGER PRIMARY KEY AUTOINCREMENT,
  execution             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  command               VARCHAR(20) NOT NULL,
  data_hora_entrada     DATETIME NOT NULL,
  valor_original        VARCHAR(20) NULL,
  valor_novo            VARCHAR(20) NULL,
  classificacao_original VARCHAR(20) NULL,
  classificacao_nova    VARCHAR(20) NULL,
  descricao_original    VARCHAR(500) NULL,
  descricao_nova        VARCHAR(500) NULL,
  dismiss               BOOLEAN NOT NULL DEFAULT 0,
  rotate_degrees        INTEGER NULL,
  ia_reprocessamento    BOOLEAN NOT NULL DEFAULT 0,
  success               BOOLEAN NOT NULL DEFAULT 1,
  mensagem_erro         TEXT NULL,
  entrada_financeira_id INTEGER NULL,
  -- Campo unificado para argumentos
  arguments             TEXT NULL,
  FOREIGN KEY(entrada_financeira_id) REFERENCES core_entradafinanceira(id) ON DELETE SET NULL
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para tabelas principais
CREATE INDEX idx_entradafinanceira_data_hora ON core_entradafinanceira(data_hora);
CREATE INDEX idx_entradafinanceira_classificacao ON core_entradafinanceira(classificacao);
CREATE INDEX idx_entradafinanceira_desconsiderada ON core_entradafinanceira(desconsiderada);
CREATE INDEX idx_entradafinanceira_arquivo_origem ON core_entradafinanceira(arquivo_origem);
CREATE INDEX idx_entradafinanceira_processamento ON core_entradafinanceira(processamento_id);
CREATE INDEX idx_entradafinanceira_remetente ON core_entradafinanceira(remetente);
CREATE INDEX idx_entradafinanceira_momento_mensagem ON core_entradafinanceira(momento_mensagem);

CREATE INDEX idx_arquivoprocessado_nome ON core_arquivoprocessado(nome_arquivo);
CREATE INDEX idx_arquivoprocessado_tipo ON core_arquivoprocessado(tipo);
CREATE INDEX idx_arquivoprocessado_status ON core_arquivoprocessado(status);
CREATE INDEX idx_arquivoprocessado_processamento ON core_arquivoprocessado(processamento_id);

CREATE INDEX idx_correcaohistorico_execution ON core_correcaohistorico(execution);
CREATE INDEX idx_correcaohistorico_command ON core_correcaohistorico(command);
CREATE INDEX idx_correcaohistorico_data_hora ON core_correcaohistorico(data_hora_entrada);
CREATE INDEX idx_correcaohistorico_success ON core_correcaohistorico(success);

CREATE INDEX idx_processamento_tipo ON core_processamento(tipo);
CREATE INDEX idx_processamento_status ON core_processamento(status);
CREATE INDEX idx_processamento_data_inicio ON core_processamento(data_hora_inicio);

-- ========================================
-- TRIGGERS PARA SINCRONIZAÇÃO
-- ========================================

-- Trigger para atualizar data_modificacao automaticamente
CREATE TRIGGER update_entradafinanceira_modificacao 
AFTER UPDATE ON core_entradafinanceira
BEGIN
    UPDATE core_entradafinanceira 
    SET data_modificacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- ========================================
-- VIEWS PARA FACILITAR CONSULTAS
-- ========================================

-- View unificada de entradas financeiras com informações completas
CREATE VIEW v_entradas_completas AS
SELECT 
    e.id,
    e.data_hora,
    e.valor,
    e.descricao,
    e.classificacao,
    e.arquivo_origem,
    e.desconsiderada,
    e.data_criacao,
    e.data_modificacao,
    e.remetente,
    e.momento_mensagem,
    e.momento_transacao,
    e.ricardo,
    e.rafael,
    e.ocr_texto,
    e.validade,
    e.motivo_erro,
    p.tipo as tipo_processamento,
    p.status as status_processamento,
    p.data_hora_inicio as inicio_processamento
FROM core_entradafinanceira e
LEFT JOIN core_processamento p ON e.processamento_id = p.id;

-- View de estatísticas de processamento
CREATE VIEW v_estatisticas_processamento AS
SELECT 
    p.id,
    p.tipo,
    p.status,
    p.data_hora_inicio,
    p.data_hora_fim,
    p.arquivos_processados,
    p.arquivos_erro,
    COUNT(e.id) as total_entradas,
    SUM(CASE WHEN e.desconsiderada = 0 THEN 1 ELSE 0 END) as entradas_validas,
    SUM(CASE WHEN e.desconsiderada = 1 THEN 1 ELSE 0 END) as entradas_desconsideradas,
    SUM(CASE WHEN e.ricardo IS NOT NULL THEN e.ricardo ELSE 0 END) as total_ricardo,
    SUM(CASE WHEN e.rafael IS NOT NULL THEN e.rafael ELSE 0 END) as total_rafael
FROM core_processamento p
LEFT JOIN core_entradafinanceira e ON p.id = e.processamento_id
GROUP BY p.id;

-- View para compatibilidade com sistema anterior (se necessário)
CREATE VIEW v_entradas_legacy AS
SELECT 
    momento_mensagem as momento_mensagem,
    remetente,
    descricao as mensagem,
    arquivo_origem as anexo,
    ocr_texto as ocr,
    validade,
    momento_transacao,
    classificacao,
    ricardo,
    rafael,
    valor,
    motivo_erro
FROM core_entradafinanceira
WHERE momento_mensagem IS NOT NULL;

-- ========================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

-- Este DDL cria um banco de dados verdadeiramente unificado que:
-- 1. Integra todos os dados em tabelas principais
-- 2. Mantém campos necessários do sistema anterior
-- 3. Inclui índices para performance
-- 4. Inclui triggers para sincronização automática
-- 5. Inclui views para facilitar consultas
-- 6. Elimina a necessidade de tabelas legacy separadas

-- Estrutura unificada:
-- - core_entradafinanceira: Contém todos os dados financeiros (antigos mensagens + calculo)
-- - core_arquivoprocessado: Contém dados de arquivos + OCR
-- - core_correcaohistorico: Contém histórico de comandos + correções
-- - core_processamento: Contém metadados de processamento

-- Views de compatibilidade:
-- - v_entradas_legacy: Para consultas no formato anterior
-- - v_entradas_completas: Para consultas unificadas
-- - v_estatisticas_processamento: Para relatórios