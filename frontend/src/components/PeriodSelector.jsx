import React from 'react';

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  // Gera opções de meses para os últimos 2 anos
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Adiciona opção "Todos os períodos"
    options.push(
      <option key="all" value="">
        Todos os períodos
      </option>
    );
    
    // Gera opções para os últimos 2 anos
    for (let year = currentYear - 1; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        // Para o ano atual, só inclui meses até o atual
        if (year === currentYear && month > currentMonth + 1) {
          break;
        }
        
        const monthStr = month.toString().padStart(2, '0');
        const yearMonth = `${year}-${monthStr}`;
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        options.push(
          <option key={yearMonth} value={yearMonth}>
            {monthNames[month - 1]} {year}
          </option>
        );
      }
    }
    
    return options;
  };

  return (
    <div className="period-selector mb-3">
      <label htmlFor="period-select" className="form-label">
        <strong>Selecionar Período:</strong>
      </label>
      <select
        id="period-select"
        className="form-select"
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value)}
        style={{ maxWidth: '300px' }}
      >
        {generateMonthOptions()}
      </select>
    </div>
  );
};

export default PeriodSelector; 