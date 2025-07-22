import React from 'react';
import BaseLayout from './BaseLayout';
import Row from './Row';

const Report = ({ 
  periodo, 
  rows = [], 
  attrs = {}, 
  editLink, 
  printLink, 
  totalizadores, 
  timestamp,
  isEditable = false,
  temMotivo = false,
  printMode = false
}) => {
  const title = periodo ? `Relatório de Prestação de Contas - ${periodo}` : 'Relatório de Prestação de Contas';
  
  const headerButtons = !printMode ? (
    <div>
      {editLink && (
        <a href={editLink} target="_blank" className="btn-edit">
          Editar Relatório
        </a>
      )}
      {printLink && (
        <a href={printLink} target="_blank" className="btn-edit">
          Imprimir
        </a>
      )}
    </div>
  ) : null;

  const renderTableHead = () => {
    if (printMode) {
      return (
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th>Receitas (R$)</th>
          <th>Despesas (R$)</th>
          <th>Saldo (R$)</th>
        </tr>
      );
    }

    return (
      <tr>
        <th className="desktop-only data-hora-cell">Data-Hora</th>
        <th className="classificacao-cell">
          <button id="toggle-payments" className="toggle-payments-btn" aria-label="Alternar pagamentos">
            ⇄
          </button>
        </th>
        <th>Ricardo (R$)</th>
        <th>Rafael (R$)</th>
        <th>Anexo</th>
        <th className="optional-column descricao-cell">Descrição</th>
        <th className="optional-column desktop-only ocr-cell">OCR</th>
        {temMotivo && <th>Motivo do Erro</th>}
        {isEditable && <th>Ações</th>}
      </tr>
    );
  };

  const renderTableBody = () => {
    if (printMode) {
      return rows.map((row, index) => (
        <tr key={index} data-id={row.identificador_unico}>
          <td>{row.data}</td>
          <td data-field="descricao">{row.descricao}</td>
          <td data-field="receitas">{row.receitas}</td>
          <td data-field="despesas">{row.despesas}</td>
          <td data-field="saldo">{row.saldo}</td>
        </tr>
      ));
    }

    return rows.map((row, index) => (
      <Row 
        key={index}
        row={row}
        index={index}
        attrs={attrs}
        isEditable={isEditable}
        temMotivo={temMotivo}
      />
    ));
  };

  return (
    <BaseLayout
      title={title}
      headerTitle={title}
      headerButtons={headerButtons}
      totalizadores={totalizadores}
      timestamp={timestamp}
      isEditable={isEditable}
      temMotivo={temMotivo}
    >
      <table>
        <thead>
          {renderTableHead()}
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
    </BaseLayout>
  );
};

export default Report; 