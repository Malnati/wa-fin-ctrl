import React from 'react';
import './PrintableReport.css';

const PrintableReport = ({ 
  periodo, 
  rows, 
  mensagens = [], 
  xmlData = [], 
  totalizadores, 
  timestamp,
  totalRegistros = 0,
  totalMensagens = 0,
  totalPaginasXml = 0
}) => {
  const formatCurrency = (value) => {
    if (!value || value === '0' || value === '0.0') return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  return (
    <div className="printable-report">
      {/* Cabeçalho */}
      <div className="report-header">
        <h1>📊 Relatório Financeiro WhatsApp</h1>
        <h2>Período: {periodo || 'Todos os Períodos'}</h2>
        <div className="report-meta">
          <p><strong>Data de geração:</strong> {timestamp ? 
            new Date(timestamp).toLocaleString('pt-BR') : 
            'Não disponível'
          }</p>
          <p><strong>Total de registros:</strong> {totalRegistros}</p>
          <p><strong>Total de mensagens:</strong> {totalMensagens}</p>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="financial-summary">
        <h3>💰 Resumo Financeiro</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <h4>Ricardo</h4>
            <p className="amount">{formatCurrency(totalizadores?.ricardo_float || 0)}</p>
          </div>
          <div className="summary-item">
            <h4>Rafael</h4>
            <p className="amount">{formatCurrency(totalizadores?.rafael_float || 0)}</p>
          </div>
          <div className="summary-item">
            <h4>Total Geral</h4>
            <p className="amount total">
              {formatCurrency((totalizadores?.ricardo_float || 0) + (totalizadores?.rafael_float || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Transações */}
      <div className="transactions-section">
        <h3>💳 Transações Financeiras</h3>
        {rows.length === 0 ? (
          <p className="no-data">Nenhuma transação encontrada para o período selecionado.</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Hora</th>
                <th>Remetente</th>
                <th>Classificação</th>
                <th>Ricardo</th>
                <th>Rafael</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={row.validade === 'dismiss' ? 'dismissed' : ''}>
                  <td>{row.data}</td>
                  <td>{row.hora}</td>
                  <td>{row.remetente}</td>
                  <td>{row.classificacao}</td>
                  <td className="amount">
                    {row.ricardo ? formatCurrency(row.ricardo_float) : '-'}
                  </td>
                  <td className="amount">
                    {row.rafael ? formatCurrency(row.rafael_float) : '-'}
                  </td>
                  <td>{row.descricao}</td>
                  <td className="amount">
                    {row.valor ? formatCurrency(row.valor) : '-'}
                  </td>
                  <td>
                    {row.validade === 'dismiss' && '❌ Desconsiderado'}
                    {row.validade === 'ai-check' && '🤖 AI Check'}
                    {!row.validade && '✅ OK'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mensagens */}
      {mensagens.length > 0 && (
        <div className="messages-section">
          <h3>💬 Mensagens do WhatsApp</h3>
          <table className="messages-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Hora</th>
                <th>Remetente</th>
                <th>Mensagem</th>
                <th>Anexo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mensagens.map((msg, index) => (
                <tr key={index} className={msg.validade === 'dismiss' ? 'dismissed' : ''}>
                  <td>{msg.data}</td>
                  <td>{msg.hora}</td>
                  <td>{msg.remetente}</td>
                  <td className="message-text">
                    {msg.mensagem && msg.mensagem.length > 100 
                      ? msg.mensagem.substring(0, 100) + '...' 
                      : msg.mensagem
                    }
                  </td>
                  <td>{msg.anexo ? `📎 ${msg.anexo}` : '-'}</td>
                  <td>
                    {msg.validade === 'dismiss' && '❌ Desconsiderado'}
                    {msg.validade === 'ai-check' && '🤖 AI Check'}
                    {!msg.validade && '✅ OK'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dados OCR */}
      {xmlData.length > 0 && (
        <div className="ocr-section">
          <h3>📄 Dados OCR Extraídos</h3>
          <p><strong>Total de páginas processadas:</strong> {totalPaginasXml}</p>
          
          {xmlData.map((page, pageIndex) => (
            <div key={pageIndex} className="ocr-page">
              <h4>Página {page.page_number}</h4>
              <div className="page-info">
                <p><strong>Dimensões:</strong> {page.width} x {page.height}</p>
                <p><strong>Blocos de texto:</strong> {page.text_blocks.length}</p>
              </div>
              
              <div className="text-blocks">
                <h5>Texto Extraído:</h5>
                {page.text_blocks.map((block, blockIndex) => (
                  <div key={blockIndex} className="text-block">
                    <small className="block-coords">
                      [{block.x}, {block.y}] {block.width}x{block.height}
                    </small>
                    <div className="block-text">{block.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé */}
      <div className="report-footer">
        <p>Relatório gerado automaticamente pelo sistema WA Fin Ctrl</p>
        <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );
};

export default PrintableReport; 