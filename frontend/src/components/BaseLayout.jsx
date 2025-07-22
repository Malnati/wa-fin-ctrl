import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/BaseLayout.css';

const BaseLayout = ({ 
  title = "Relatório Financeiro", 
  headerTitle = "Relatório de Prestação de Contas",
  headerButtons,
  children,
  totalizadores,
  timestamp,
  isEditable = false,
  temMotivo = false,
  printMode = false
}) => {
  const [columnControlsVisible, setColumnControlsVisible] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    descricao: true,
    ocr: true,
    dataHora: true,
    classificacao: true
  });

  const toggleColumnControls = () => {
    setColumnControlsVisible(!columnControlsVisible);
  };

  const toggleColumn = (columnName) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  const toggleMobileView = () => {
    document.body.classList.toggle('mobile-view');
  };

  useEffect(() => {
    // Inicializar tooltips do Bootstrap
    if (window.bootstrap) {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => 
        new window.bootstrap.Tooltip(tooltipTriggerEl)
      );

      return () => {
        tooltipList.forEach(tooltip => tooltip.dispose());
      };
    }
  }, []);

  return (
    <div className="container">
      <h1>{headerTitle}</h1>
      <div className="info">Gerado automaticamente em {timestamp || new Date().toLocaleString()}</div>
      
      {totalizadores && (
        <div className="totalizadores">
          <div className="totalizador">
            <h3>Ricardo</h3>
            <div className={`valor ${totalizadores.ricardo_float === 0 ? 'zero' : ''}`}>
              R$ {totalizadores.ricardo}
            </div>
            <div className="label">Total do período</div>
          </div>
          <div className="totalizador">
            <h3>Rafael</h3>
            <div className={`valor ${totalizadores.rafael_float === 0 ? 'zero' : ''}`}>
              R$ {totalizadores.rafael}
            </div>
            <div className="label">Total do período</div>
          </div>
          <div className="totalizador">
            <h3>Total Geral</h3>
            <div className={`valor ${(totalizadores.ricardo_float + totalizadores.rafael_float) === 0 ? 'zero' : ''}`}>
              R$ {(totalizadores.ricardo_float + totalizadores.rafael_float).toFixed(2)}
            </div>
            <div className="label">Soma de ambos</div>
          </div>
        </div>
      )}
      
      <div style={{textAlign: 'right', marginBottom: '10px'}}>
        {headerButtons}
      </div>
      
      {/* Controles de colunas opcionais */}
      <div className="card mb-4">
        <div 
          className="card-header column-controls-toggle" 
          onClick={toggleColumnControls}
          data-bs-toggle="tooltip" 
          data-bs-placement="top" 
          data-bs-title="Controles de colunas opcionais. Clique para expandir/recolher."
        >
          <i className="bi bi-gear me-2"></i>
          Controles de Colunas Opcionais
          <i className={`bi ${columnControlsVisible ? 'bi-chevron-up' : 'bi-chevron-down'} ms-auto`}></i>
        </div>
        <div className="card-body" style={{display: columnControlsVisible ? 'block' : 'none'}}>
          <div className="row">
            <div className="col-md-6">
              <h6 className="mb-2">📊 Colunas Opcionais:</h6>
              <div className="form-check form-check-inline">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="toggle-descricao"
                  checked={columnVisibility.descricao}
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
                  checked={columnVisibility.ocr}
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
                  checked={columnVisibility.dataHora}
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
                  checked={columnVisibility.classificacao}
                  onChange={() => toggleColumn('classificacao')}
                />
                <label className="form-check-label" htmlFor="toggle-classificacao">
                  Classificação
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default BaseLayout; 