import React, { useEffect } from 'react';
import BaseLayout from './BaseLayout';

const PrintableReport = ({ periodo, rows = [], totalizadores, timestamp }) => {
  const title = `Prestação de Contas - ${periodo}`;

  useEffect(() => {
    // JavaScript para edição inline (mantido do código original)
    const makeCellsEditable = () => {
      document.querySelectorAll('td[data-field]').forEach(cell => {
        cell.contentEditable = true;
        cell.addEventListener('blur', function() {
          // Salvar alterações quando perder foco
          console.log('Campo editado:', this.getAttribute('data-field'), this.textContent);
        });
      });
    };

    const setupDownloadButton = () => {
      const downloadBtn = document.getElementById('download-edits');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
          const data = [];
          document.querySelectorAll('tbody tr').forEach(row => {
            const rowData = {
              id: row.getAttribute('data-id'),
              descricao: row.querySelector('[data-field="descricao"]')?.textContent || '',
              receitas: row.querySelector('[data-field="receitas"]')?.textContent || '',
              despesas: row.querySelector('[data-field="despesas"]')?.textContent || '',
              saldo: row.querySelector('[data-field="saldo"]')?.textContent || ''
            };
            data.push(rowData);
          });
          
          const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'relatorio_editado.json';
          a.click();
          URL.revokeObjectURL(url);
        });
      }
    };

    // Executar após o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        makeCellsEditable();
        setupDownloadButton();
      });
    } else {
      makeCellsEditable();
      setupDownloadButton();
    }
  }, []);

  const renderTableHead = () => (
    <tr>
      <th>Data</th>
      <th>Descrição</th>
      <th>Receitas (R$)</th>
      <th>Despesas (R$)</th>
      <th>Saldo (R$)</th>
    </tr>
  );

  const renderTableBody = () => (
    rows.map((row, index) => (
      <tr key={index} data-id={row.identificador_unico}>
        <td>{row.data}</td>
        <td data-field="descricao">{row.descricao}</td>
        <td data-field="receitas">{row.receitas}</td>
        <td data-field="despesas">{row.despesas}</td>
        <td data-field="saldo">{row.saldo}</td>
      </tr>
    ))
  );

  const extraContent = (
    <>
      <div className="header-info">
        <span>Curador: ____________________________</span>
        <span>Curatelado: __________________________</span>
      </div>
      <button id="download-edits">Salvar</button>
      <div className="signature">
        <div>Local, ___/___/_____<br/>Assinatura do Curador</div>
        <div>Data, ___/___/_____<br/>Assinatura do Curatelado</div>
      </div>
    </>
  );

  return (
    <BaseLayout
      title={title}
      headerTitle={title}
      totalizadores={totalizadores}
      timestamp={timestamp}
      printMode={true}
    >
      <>
        <table>
          <thead>
            {renderTableHead()}
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
        {extraContent}
      </>
    </BaseLayout>
  );
};

export default PrintableReport; 