import React, { useState } from 'react';
import './Report.css';

const Report = ({ 
  periodo, 
  rows, 
  mensagens = [], 
  xmlData = [], 
  totalizadores, 
  timestamp, 
  isEditable, 
  temMotivo,
  totalRegistros = 0,
  totalMensagens = 0,
  totalPaginasXml = 0
}) => {
  const [showColumnControls, setShowColumnControls] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    descricao: true,
    ocr: true,
    dataHora: true,
    classificacao: true
  });

  const formatCurrency = (value) => {
    if (!value || value === '0' || value === '0.0') return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const getStatusClass = (validade) => {
    if (validade === 'dismiss') return 'dismiss-row';
    if (validade === 'ai-check') return 'fix-row';
    return '';
  };

  const getClassificationClass = (classificacao) => {
    if (!classificacao) return '';
    const lower = classificacao.toLowerCase();
    if (lower === 'transferência') return 'transferencia';
    if (lower === 'pagamento') return 'pagamento';
    return 'desconhecido';
  };

  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const formatDataHora = (data, hora) => {
    if (!data) return '';
    return `${data} ${hora || ''}`.trim();
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getTotalGeral = () => {
    const ricardo = totalizadores?.ricardo_float || 0;
    const rafael = totalizadores?.rafael_float || 0;
    return ricardo + rafael;
  };

  return (
    <div className="container">
      <h1>Relatório de Prestação de Contas</h1>
      <div className="info">Gerado automaticamente em {timestamp ? 
        new Date(timestamp).toLocaleString('pt-BR') : 
        'Não disponível'
      }</div>
      
      {/* Totalizadores */}
      {totalizadores && (
        <div className="totalizadores">
          <div className="totalizador">
            <h3>Ricardo</h3>
            <div className={`valor ${totalizadores.ricardo_float === 0 ? 'zero' : ''}`}>
              {formatCurrency(totalizadores.ricardo_float)}
            </div>
            <div className="label">Total do período</div>
          </div>
          <div className="totalizador">
            <h3>Rafael</h3>
            <div className={`valor ${totalizadores.rafael_float === 0 ? 'zero' : ''}`}>
              {formatCurrency(totalizadores.rafael_float)}
            </div>
            <div className="label">Total do período</div>
          </div>
          <div className="totalizador">
            <h3>Total Geral</h3>
            <div className={`valor ${getTotalGeral() === 0 ? 'zero' : ''}`}>
              {formatCurrency(getTotalGeral())}
            </div>
            <div className="label">Soma de ambos</div>
          </div>
        </div>
      )}

      {/* Controles de colunas opcionais */}
      <div className="card mb-4">
        <div 
          className="card-header column-controls-toggle" 
          onClick={() => setShowColumnControls(!showColumnControls)}
        >
          <i className="bi bi-gear me-2"></i>
          Controles de Colunas Opcionais
          <i className={`bi ${showColumnControls ? 'bi-chevron-up' : 'bi-chevron-down'} ms-auto`}></i>
        </div>
        {showColumnControls && (
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="mb-2">📊 Colunas Opcionais:</h6>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="toggle-descricao"
                    checked={visibleColumns.descricao}
                    onChange={() => toggleColumn('descricao')}
                  />
                  <label className="form-check-label" htmlFor="toggle-descricao">
                    Descrição
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="toggle-ocr"
                    checked={visibleColumns.ocr}
                    onChange={() => toggleColumn('ocr')}
                  />
                  <label className="form-check-label" htmlFor="toggle-ocr">
                    OCR
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="toggle-data-hora"
                    checked={visibleColumns.dataHora}
                    onChange={() => toggleColumn('dataHora')}
                  />
                  <label className="form-check-label" htmlFor="toggle-data-hora">
                    Data-Hora
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="toggle-classificacao"
                    checked={visibleColumns.classificacao}
                    onChange={() => toggleColumn('classificacao')}
                  />
                  <label className="form-check-label" htmlFor="toggle-classificacao">
                    Classificação
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabela principal */}
      <table>
        <thead>
          <tr>
            {visibleColumns.dataHora && (
              <th className="desktop-only data-hora-cell">Data-Hora</th>
            )}
            {visibleColumns.classificacao && (
              <th className="classificacao-cell">
                <button className="toggle-payments-btn" aria-label="Alternar pagamentos">
                  ⇄
                </button>
              </th>
            )}
            <th>Ricardo (R$)</th>
            <th>Rafael (R$)</th>
            <th>Anexo</th>
            {visibleColumns.descricao && (
              <th className="optional-column descricao-cell">Descrição</th>
            )}
            {visibleColumns.ocr && (
              <th className="optional-column desktop-only ocr-cell">OCR</th>
            )}
            {temMotivo && <th>Motivo do Erro</th>}
            {isEditable && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr 
              key={index} 
              className={`${getStatusClass(row.validade)}`}
              data-row-id={index}
              data-data-hora={formatDataHora(row.data, row.hora)}
            >
              {visibleColumns.dataHora && (
                <td className="data-hora data-hora-cell desktop-only align-middle text-center">
                  {formatDataHora(row.data, row.hora)}
                </td>
              )}
              {visibleColumns.classificacao && (
                <td className="classificacao-cell align-middle text-center">
                  {row.classificacao && row.classificacao !== 'nan' && row.classificacao !== '' ? (
                    <span className={`form-control-plaintext form-control-sm clickable-field classificacao ${getClassificationClass(row.classificacao)}`}>
                      {row.classificacao}
                    </span>
                  ) : (
                    <span className="form-control-plaintext form-control-sm clickable-field classificacao empty-field">
                      Clique para editar
                    </span>
                  )}
                </td>
              )}
              <td className="valor-cell align-middle text-center">
                {row.ricardo && row.ricardo !== 'nan' && row.ricardo !== '' ? (
                  <span className="valor">{row.ricardo}</span>
                ) : (
                  <span className="valor empty-field">Clique para editar</span>
                )}
              </td>
              <td className="valor-cell align-middle text-center">
                {row.rafael && row.rafael !== 'nan' && row.rafael !== '' ? (
                  <span className="valor">{row.rafael}</span>
                ) : (
                  <span className="valor empty-field">Clique para editar</span>
                )}
              </td>
              <td className="align-middle text-center">
                {row.anexo && row.anexo !== 'nan' && row.anexo !== '' && (
                  <img 
                    src={`/imgs/${row.anexo}`}
                    className="thumb"
                    alt={`Comprovante ${row.anexo}`}
                    title={row.anexo}
                  />
                )}
              </td>
              {visibleColumns.descricao && (
                <td className="descricao-cell optional-column align-middle text-center" style={{textAlign: 'left', fontSize: '12px'}}>
                  {row.descricao && row.descricao !== 'nan' && row.descricao !== '' ? (
                    <span>{row.descricao}</span>
                  ) : (
                    <span className="empty-field">Clique para editar</span>
                  )}
                </td>
              )}
              {visibleColumns.ocr && (
                <td className="ocr-cell optional-column desktop-only align-middle text-center" style={{textAlign: 'left', fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {row.ocr && row.ocr !== 'nan' && (
                    <>
                      {row.anexo && row.anexo.toLowerCase().endsWith('.pdf') && '📄 '}
                      {row.anexo && (row.anexo.toLowerCase().endsWith('.jpg') || row.anexo.toLowerCase().endsWith('.jpeg') || row.anexo.toLowerCase().endsWith('.png')) && '🖼️ '}
                      {truncateText(row.ocr, 100)}
                    </>
                  )}
                </td>
              )}
              {temMotivo && (
                <td className="align-middle text-center" style={{color: '#e67e22', fontSize: '12px'}}>
                  {row.motivo_erro && row.motivo_erro !== 'nan' && row.motivo_erro}
                </td>
              )}
              {isEditable && (
                <td className="actions-cell align-middle text-center">
                  <div className="row-actions">
                    <button className="btn-save" title="Salvar alterações" style={{display: 'none'}}>
                      💾
                    </button>
                    <button className="btn-cancel" title="Cancelar alterações" style={{display: 'none'}}>
                      ❌
                    </button>
                    <button className="btn-dismiss" title="Marcar como desconsiderado">
                      🚫
                    </button>
                    <button className="btn-rotate" title="Rotacionar imagem" disabled={!row.anexo || row.anexo === 'nan' || row.anexo === ''}>
                      🔄
                    </button>
                    <button className="btn-reprocess" title="Reprocessar com IA" disabled={!row.anexo || row.anexo === 'nan' || row.anexo === ''}>
                      🤖
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para imagens */}
      <div id="modal" className="modal">
        <img id="modal-img" className="modal-content" />
      </div>
    </div>
  );
};

export default Report; 