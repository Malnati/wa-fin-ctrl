import React, { useState } from 'react';
import Row from './Row';
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
  const [activeTab, setActiveTab] = useState('transacoes');

  const formatCurrency = (value) => {
    if (!value || value === '0' || value === '0.0') return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const getStatusClass = (validade) => {
    if (validade === 'dismiss') return 'table-danger';
    if (validade === 'ai-check') return 'table-warning';
    return '';
  };

  return (
    <div className="container mt-4">
      {/* Cabeçalho */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">
                📊 Relatório Financeiro - {periodo || 'Todos os Períodos'}
              </h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <h5>Total Registros</h5>
                    <p className="h3 text-primary">{totalRegistros}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h5>Total Mensagens</h5>
                    <p className="h3 text-info">{totalMensagens}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h5>Ricardo</h5>
                    <p className="h3 text-success">{formatCurrency(totalizadores?.ricardo_float || 0)}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h5>Rafael</h5>
                    <p className="h3 text-warning">{formatCurrency(totalizadores?.rafael_float || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <small className="text-muted">
                  Última atualização: {timestamp ? 
                    new Date(timestamp).toLocaleString('pt-BR') : 
                    'Não disponível'
                  }
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <ul className="nav nav-tabs mb-4" id="reportTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'transacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('transacoes')}
            type="button"
          >
            💰 Transações ({rows.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'mensagens' ? 'active' : ''}`}
            onClick={() => setActiveTab('mensagens')}
            type="button"
          >
            💬 Mensagens ({mensagens.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ocr')}
            type="button"
          >
            📄 OCR ({totalPaginasXml})
          </button>
        </li>
      </ul>

      {/* Conteúdo das abas */}
      <div className="tab-content" id="reportTabContent">
        {/* Aba Transações */}
        <div className={`tab-pane fade ${activeTab === 'transacoes' ? 'show active' : ''}`}>
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Transações Financeiras</h5>
              <div>
                {isEditable && (
                  <button className="btn btn-sm btn-outline-primary me-2">
                    ✏️ Editar
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir
                </button>
              </div>
            </div>
            <div className="card-body">
              {rows.length === 0 ? (
                <div className="alert alert-info">
                  Nenhuma transação encontrada para o período selecionado.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Remetente</th>
                        <th>Classificação</th>
                        <th>Ricardo</th>
                        <th>Rafael</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Anexo</th>
                        {temMotivo && <th>Motivo</th>}
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index} className={getStatusClass(row.validade)}>
                          <td>{row.data}</td>
                          <td>{row.hora}</td>
                          <td>{row.remetente}</td>
                          <td>{row.classificacao}</td>
                          <td className="text-end">
                            {row.ricardo ? formatCurrency(row.ricardo_float) : '-'}
                          </td>
                          <td className="text-end">
                            {row.rafael ? formatCurrency(row.rafael_float) : '-'}
                          </td>
                          <td>{row.descricao}</td>
                          <td className="text-end">{row.valor ? formatCurrency(row.valor) : '-'}</td>
                          <td>
                            {row.anexo ? (
                              <span className="badge bg-secondary">📎 {row.anexo}</span>
                            ) : '-'}
                          </td>
                          {temMotivo && (
                            <td>
                              {row.motivo_erro && row.motivo_erro !== 'nan' ? (
                                <span className="badge bg-danger">{row.motivo_erro}</span>
                              ) : '-'}
                            </td>
                          )}
                          <td>
                            {row.validade === 'dismiss' && (
                              <span className="badge bg-danger">❌ Desconsiderado</span>
                            )}
                            {row.validade === 'ai-check' && (
                              <span className="badge bg-warning">🤖 AI Check</span>
                            )}
                            {!row.validade && (
                              <span className="badge bg-success">✅ OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aba Mensagens */}
        <div className={`tab-pane fade ${activeTab === 'mensagens' ? 'show active' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Mensagens do WhatsApp</h5>
            </div>
            <div className="card-body">
              {mensagens.length === 0 ? (
                <div className="alert alert-info">
                  Nenhuma mensagem encontrada para o período selecionado.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Remetente</th>
                        <th>Mensagem</th>
                        <th>Anexo</th>
                        <th>OCR</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensagens.map((msg, index) => (
                        <tr key={index} className={getStatusClass(msg.validade)}>
                          <td>{msg.data}</td>
                          <td>{msg.hora}</td>
                          <td>{msg.remetente}</td>
                          <td>
                            <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                              {msg.mensagem}
                            </div>
                          </td>
                          <td>
                            {msg.anexo ? (
                              <span className="badge bg-secondary">📎 {msg.anexo}</span>
                            ) : '-'}
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px', wordWrap: 'break-word', fontSize: '0.8em' }}>
                              {msg.ocr && msg.ocr !== 'nan' ? msg.ocr.substring(0, 100) + '...' : '-'}
                            </div>
                          </td>
                          <td>
                            {msg.validade === 'dismiss' && (
                              <span className="badge bg-danger">❌ Desconsiderado</span>
                            )}
                            {msg.validade === 'ai-check' && (
                              <span className="badge bg-warning">🤖 AI Check</span>
                            )}
                            {!msg.validade && (
                              <span className="badge bg-success">✅ OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aba OCR */}
        <div className={`tab-pane fade ${activeTab === 'ocr' ? 'show active' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Dados OCR Extraídos</h5>
            </div>
            <div className="card-body">
              {xmlData.length === 0 ? (
                <div className="alert alert-info">
                  Nenhum dado OCR encontrado.
                </div>
              ) : (
                <div className="accordion" id="ocrAccordion">
                  {xmlData.map((page, pageIndex) => (
                    <div className="accordion-item" key={pageIndex}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#ocrPage${pageIndex}`}
                        >
                          📄 Página {page.page_number} ({page.text_blocks.length} blocos de texto)
                        </button>
                      </h2>
                      <div
                        id={`ocrPage${pageIndex}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#ocrAccordion"
                      >
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-6">
                              <h6>Informações da Página:</h6>
                              <ul className="list-unstyled">
                                <li><strong>Número:</strong> {page.page_number}</li>
                                <li><strong>Largura:</strong> {page.width}</li>
                                <li><strong>Altura:</strong> {page.height}</li>
                                <li><strong>Blocos de texto:</strong> {page.text_blocks.length}</li>
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6>Texto Extraído:</h6>
                              <div 
                                className="border p-3 bg-light" 
                                style={{ 
                                  maxHeight: '300px', 
                                  overflowY: 'auto',
                                  fontSize: '0.9em',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {page.text_blocks.map((block, blockIndex) => (
                                  <div key={blockIndex} className="mb-2">
                                    <small className="text-muted">
                                      [{block.x}, {block.y}] {block.width}x{block.height}
                                    </small>
                                    <div>{block.text}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report; 