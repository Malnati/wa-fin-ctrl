-- 1) Tabela principal: mensagens
CREATE TABLE mensagens (
  momento_mensagem  DATETIME PRIMARY KEY,
  remetente         TEXT,
  mensagem          TEXT,
  anexo             TEXT,
  ocr               TEXT,
  validade          TEXT
);

-- 2) Tabela calculo, referenciando mensagens
CREATE TABLE calculo (
  momento_mensagem   DATETIME,
  momento_transacao  DATETIME,
  remetente          TEXT,
  classificacao      TEXT,
  ricardo            TEXT,
  rafael             TEXT,
  anexo              TEXT,
  descricao          TEXT,
  valor              REAL,
  ocr                TEXT,
  validade           TEXT,
  motivo_erro        TEXT,
  FOREIGN KEY(momento_mensagem) REFERENCES mensagens(momento_mensagem)
);

-- 3) Tabela ocr_extract, com relacionamento
CREATE TABLE ocr_extract (
  arquivo            TEXT PRIMARY KEY,
  texto              TEXT,
  momento_mensagem   DATETIME,
  FOREIGN KEY(momento_mensagem) REFERENCES mensagens(momento_mensagem)
);

-- 4) Tabela history, adicionando campo de relacionamento
CREATE TABLE history (
  "index"            INTEGER,
  execution          TEXT,
  command            TEXT,
  arguments          TEXT,
  success            INTEGER,
  momento_mensagem   DATETIME,
  FOREIGN KEY(momento_mensagem) REFERENCES mensagens(momento_mensagem)
);