import React, { useState, useEffect } from 'react';
import './PeriodSelector.css';

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailablePeriods = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (response.ok) {
          const data = await response.json();
          
          // Extrai períodos únicos dos dados
          const periods = new Set();
          if (data.rows && data.rows.length > 0) {
            data.rows.forEach(row => {
              if (row.data) {
                try {
                  const date = new Date(row.data.split('/').reverse().join('-'));
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  periods.add(`${month}-${year}`);
                } catch (e) {
                  console.warn('Erro ao processar data:', row.data);
                }
              }
            });
          }
          
          // Converte para array e ordena (mais recente primeiro)
          const sortedPeriods = Array.from(periods).sort((a, b) => {
            const [monthA, yearA] = a.split('-');
            const [monthB, yearB] = b.split('-');
            const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
            const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
            return dateB - dateA;
          });
          
          setAvailablePeriods(sortedPeriods);
        }
      } catch (error) {
        console.error('Erro ao buscar períodos disponíveis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailablePeriods();
  }, []);

  const formatPeriodDisplay = (period) => {
    if (!period) return 'Todos os Períodos';
    
    try {
      const [month, year] = period.split('-');
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthName = monthNames[parseInt(month) - 1];
      return `${monthName} ${year}`;
    } catch (e) {
      return period;
    }
  };

  const handlePeriodChange = (event) => {
    const period = event.target.value;
    onPeriodChange(period || null);
  };

  if (loading) {
    return (
      <div className="period-selector">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <span className="ms-2">Carregando períodos...</span>
      </div>
    );
  }

  return (
    <div className="period-selector">
      <div className="row align-items-center">
        <div className="col-md-6">
          <label htmlFor="periodSelect" className="form-label">
            📅 Selecionar Período:
          </label>
        </div>
        <div className="col-md-6">
          <select
            id="periodSelect"
            className="form-select"
            value={selectedPeriod || ''}
            onChange={handlePeriodChange}
          >
            <option value="">Todos os Períodos</option>
            {availablePeriods.map((period) => (
              <option key={period} value={period}>
                {formatPeriodDisplay(period)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedPeriod && (
        <div className="mt-3">
          <div className="alert alert-info">
            <strong>Período selecionado:</strong> {formatPeriodDisplay(selectedPeriod)}
            <button
              type="button"
              className="btn-close float-end"
              onClick={() => onPeriodChange(null)}
              aria-label="Limpar seleção"
            ></button>
          </div>
        </div>
      )}
      
      {availablePeriods.length === 0 && (
        <div className="mt-3">
          <div className="alert alert-warning">
            <strong>Nenhum período disponível.</strong> Execute o processamento primeiro para gerar dados.
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector; 