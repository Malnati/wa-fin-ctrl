// Funções comuns para os relatórios
function showModal(src) {
  console.log('showModal chamada com src:', src);
  document.getElementById('modal-img').src = src;
  document.getElementById('modal').classList.add('show');
}

function hideModal() {
  console.log('hideModal chamada');
  document.getElementById('modal').classList.remove('show');
}

// Alternar exibição dos controles de colunas opcionais
function toggleColumnControls() {
  console.log('=== toggleColumnControls CHAMADA ===');
  console.log('Data/Hora:', new Date().toLocaleString());
  
  const configSection = document.getElementById('columnControlsSection');
  const toggleIcon = document.getElementById('columnControlsToggleIcon');
  
  console.log('configSection encontrado:', !!configSection);
  console.log('toggleIcon encontrado:', !!toggleIcon);
  
  if (configSection && toggleIcon) {
    const isCurrentlyVisible = configSection.classList.contains('show');
    console.log('Estado atual - visível:', isCurrentlyVisible);
    
    if (isCurrentlyVisible) {
      console.log('Ocultando controles de colunas...');
      configSection.classList.remove('show');
      configSection.style.display = 'none';
      toggleIcon.className = 'bi bi-chevron-down ms-auto';
      console.log('✅ Controles de colunas OCULTADOS');
    } else {
      console.log('Mostrando controles de colunas...');
      configSection.classList.add('show');
      configSection.style.display = 'block';
      toggleIcon.className = 'bi bi-chevron-up ms-auto';
      console.log('✅ Controles de colunas MOSTRADOS');
    }
  } else {
    console.error('❌ Elementos não encontrados!');
    console.error('configSection:', configSection);
    console.error('toggleIcon:', toggleIcon);
  }
}

// Função para alternar visibilidade de colunas
function toggleColumn(columnClass, show) {
  console.log(`toggleColumn chamada: ${columnClass}, show: ${show}`);
  
  // Encontrar elementos das células (td)
  const cellElements = document.querySelectorAll(`td.${columnClass}`);
  console.log(`Elementos de células encontrados com classe ${columnClass}:`, cellElements.length);
  
  // Encontrar elementos dos cabeçalhos (th) - usar o mesmo padrão de classe
  const headerElements = document.querySelectorAll(`th.${columnClass}`);
  console.log(`Elementos de cabeçalhos encontrados com classe ${columnClass}:`, headerElements.length);
  
  // Combinar todos os elementos
  const allElements = [...cellElements, ...headerElements];
  console.log(`Total de elementos (células + cabeçalhos):`, allElements.length);
  
  allElements.forEach(el => {
    if (show) {
      el.classList.remove('hidden');
      console.log(`Removendo classe 'hidden' de elemento:`, el);
    } else {
      el.classList.add('hidden');
      console.log(`Adicionando classe 'hidden' a elemento:`, el);
    }
  });
}

// Função para alternar visualização mobile
function toggleMobileView() {
  console.log('=== toggleMobileView CHAMADA ===');
  console.log('Data/Hora:', new Date().toLocaleString());
  
  const table = document.querySelector('table');
  if (table) {
    const isMobile = table.classList.contains('mobile-view');
    console.log('Estado atual - mobile:', isMobile);
    
    if (isMobile) {
      console.log('Removendo visualização mobile...');
      table.classList.remove('mobile-view');
      console.log('✅ Visualização mobile REMOVIDA');
    } else {
      console.log('Aplicando visualização mobile...');
      table.classList.add('mobile-view');
      console.log('✅ Visualização mobile APLICADA');
    }
  } else {
    console.error('❌ Tabela não encontrada!');
  }
}

// Garantir que a função esteja disponível globalmente
window.toggleColumnControls = toggleColumnControls;

// ===== FUNCIONALIDADES DE EDIÇÃO =====

// Estado global para controle de edição
let editingRow = null;
let originalValues = {};

// Função para iniciar edição de um campo
function startEditing(field) {
  if (editingRow && editingRow !== field.closest('tr')) {
    cancelRowChanges(editingRow.dataset.dataHora);
  }
  
  const row = field.closest('tr');
  const dataHora = row.dataset.dataHora;
  
  // Salvar valores originais se for a primeira edição da linha
  if (!originalValues[dataHora]) {
    originalValues[dataHora] = {};
    row.querySelectorAll('.edit-field').forEach(f => {
      originalValues[dataHora][f.dataset.field] = f.dataset.original;
    });
  }
  
  // Marcar linha como em edição
  row.classList.add('row-editing');
  editingRow = row;
  
  // Transformar campo em input
  const input = document.createElement('input');
  input.type = 'text';
  input.value = field.textContent.trim();
  input.className = 'form-control form-control-sm';
  input.style.width = '100%';
  input.style.minWidth = '80px';
  
  // Substituir o span pelo input
  field.style.display = 'none';
  field.parentNode.insertBefore(input, field);
  input.focus();
  input.select();
  
  // Event listeners para o input
  input.addEventListener('blur', () => finishEditing(field, input));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEditing(field, input);
    } else if (e.key === 'Escape') {
      cancelEditing(field, input);
    }
  });
}

// Função para finalizar edição
function finishEditing(field, input) {
  const newValue = input.value.trim();
  const originalValue = field.dataset.original;
  
  console.log('finishEditing chamada:', {
    field: field.dataset.field,
    newValue: newValue,
    originalValue: originalValue,
    changed: newValue !== originalValue
  });
  
  // Remover input
  input.remove();
  field.style.display = '';
  
  // Atualizar valor se mudou
  if (newValue !== originalValue) {
    field.textContent = newValue;
    field.classList.add('modified');
    field.dataset.original = newValue;
    console.log('Campo marcado como modificado:', field.dataset.field);
  }
  
  // Verificar se há outras modificações na linha
  const row = field.closest('tr');
  const hasModifications = row.querySelectorAll('.edit-field.modified').length > 0;
  
  if (hasModifications) {
    // Mostrar botões de salvar/cancelar
    row.querySelector('.btn-save').style.display = 'inline-flex';
    row.querySelector('.btn-cancel').style.display = 'inline-flex';
  } else {
    // Finalizar edição da linha
    finishRowEditing(row);
  }
}

// Função para cancelar edição
function cancelEditing(field, input) {
  // Remover input
  input.remove();
  field.style.display = '';
  
  // Restaurar valor original
  field.textContent = field.dataset.original;
  field.classList.remove('modified');
}

// Função para finalizar edição da linha
function finishRowEditing(row) {
  row.classList.remove('row-editing');
  editingRow = null;
  
  // Esconder botões de salvar/cancelar
  row.querySelector('.btn-save').style.display = 'none';
  row.querySelector('.btn-cancel').style.display = 'none';
  
  // Mostrar botões normais
  row.querySelectorAll('.btn-dismiss, .btn-rotate, .btn-reprocess').forEach(btn => {
    btn.style.display = 'inline-flex';
  });
}

// Função para salvar alterações de uma linha
async function saveRowChanges(dataHora) {
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  // Coletar campos modificados
  const modifiedFields = {};
  const modifiedElements = row.querySelectorAll('.edit-field.modified');
  console.log('Elementos modificados encontrados:', modifiedElements.length);
  
  modifiedElements.forEach(field => {
    const fieldName = field.dataset.field;
    const fieldValue = field.textContent.trim();
    modifiedFields[fieldName] = fieldValue;
    console.log(`Campo modificado: ${fieldName} = "${fieldValue}"`);
  });
  
  console.log('Campos modificados coletados:', modifiedFields);
  
  if (Object.keys(modifiedFields).length === 0) {
    console.log('Nenhum campo modificado encontrado, finalizando edição');
    finishRowEditing(row);
    return;
  }
  
  // Mostrar loading
  row.classList.add('row-saving');
  
  try {
    const formData = new FormData();
    formData.append('find', dataHora);
    
    // Mapear campos modificados para parâmetros da API
    if (modifiedFields.ricardo) {
      formData.append('value', modifiedFields.ricardo);
    }
    if (modifiedFields.rafael) {
      formData.append('value', modifiedFields.rafael);
    }
    if (modifiedFields.descricao) {
      formData.append('desc', modifiedFields.descricao);
    }
    if (modifiedFields.classificacao) {
      formData.append('class_', modifiedFields.classificacao);
    }
    
    console.log('Enviando dados para API:', {
      find: dataHora,
      modifiedFields: modifiedFields
    });
    
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    console.log('Resposta da API:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Resultado da API:', result);
      // Sucesso
      row.classList.add('row-saved');
      console.log('Alterações salvas com sucesso, aguardando recarregamento...');
      
      // Aguarda um pouco para o WebSocket processar e depois recarrega
      setTimeout(() => {
        row.classList.remove('row-saved');
        finishRowEditing(row);
        
        // Limpar valores originais
        delete originalValues[dataHora];
        
        // Recarrega a página para mostrar as mudanças
        console.log('Recarregando página para mostrar alterações...');
        location.reload();
      }, 1000);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao salvar:', error);
    row.classList.add('row-error');
    setTimeout(() => row.classList.remove('row-error'), 500);
    
    // Mostra erro mais detalhado
    alert(`Erro ao salvar alterações: ${error.message}`);
  } finally {
    row.classList.remove('row-saving');
  }
}

// Função para cancelar alterações de uma linha
function cancelRowChanges(dataHora) {
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  // Restaurar valores originais
  if (originalValues[dataHora]) {
    Object.entries(originalValues[dataHora]).forEach(([field, value]) => {
      const fieldElement = row.querySelector(`[data-field="${field}"]`);
      if (fieldElement) {
        fieldElement.textContent = value;
        fieldElement.classList.remove('modified');
        fieldElement.dataset.original = value;
      }
    });
  }
  
  finishRowEditing(row);
  delete originalValues[dataHora];
}

// Função para marcar linha como desconsiderada
async function dismissRow(dataHora) {
  if (!confirm('Deseja marcar esta linha como desconsiderada?')) return;
  
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  row.classList.add('row-saving');
  
  try {
    const formData = new FormData();
    formData.append('find', dataHora);
    formData.append('dismiss', 'true');
    
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      row.classList.add('dismiss-row');
      row.querySelector('.descricao-cell').textContent = 'desconsiderado';
      console.log('Linha marcada como desconsiderada, recarregando página...');
      
      // Aguarda um pouco e recarrega a página
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao desconsiderar:', error);
    alert('Erro ao desconsiderar linha');
  } finally {
    row.classList.remove('row-saving');
  }
}

// Função para rotacionar imagem
async function rotateImage(dataHora) {
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  const degrees = prompt('Digite os graus para rotacionar (90, 180, 270):');
  if (!degrees || !['90', '180', '270'].includes(degrees)) return;
  
  row.classList.add('row-saving');
  
  try {
    const formData = new FormData();
    formData.append('find', dataHora);
    formData.append('rotate', degrees);
    
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert('Imagem rotacionada com sucesso!');
      // Recarregar a página para mostrar a imagem rotacionada
      location.reload();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao rotacionar:', error);
    alert('Erro ao rotacionar imagem');
  } finally {
    row.classList.remove('row-saving');
  }
}

// Função para reprocessar com IA
async function reprocessAI(dataHora) {
  if (!confirm('Deseja reprocessar esta linha com IA?')) return;
  
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  row.classList.add('row-saving');
  
  try {
    const formData = new FormData();
    formData.append('find', dataHora);
    formData.append('ia', 'true');
    
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert('Reprocessamento com IA iniciado!');
      // Recarregar a página para mostrar os novos dados
      location.reload();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao reprocessar:', error);
    alert('Erro ao reprocessar com IA');
  } finally {
    row.classList.remove('row-saving');
  }
}

// Função para configurar WebSocket
function setupWebSocket() {
    try {
        const ws = new WebSocket(`ws://${window.location.host}/ws`);
        
        ws.onopen = function() {
            console.log('WebSocket conectado com sucesso');
        };
        
        ws.onmessage = function(event) {
            if (event.data === 'reload') {
                console.log('Recebido comando de reload via WebSocket');
                location.reload();
            }
        };
        
        ws.onclose = function() {
            console.log('WebSocket fechado, tentando reconectar...');
            setTimeout(setupWebSocket, 1000);
        };
        
        ws.onerror = function(error) {
            console.error('Erro no WebSocket:', error);
            // Fallback para polling se WebSocket falhar
            setupPolling();
        };
        
        return ws;
    } catch (error) {
        console.error('Erro ao configurar WebSocket:', error);
        // Fallback para polling
        setupPolling();
        return null;
    }
}

// Função para configurar polling como fallback
function setupPolling() {
    console.log('Configurando polling como fallback...');
    let lastUpdate = Date.now();
    
    setInterval(async () => {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const data = await response.json();
                if (data.last_update * 1000 > lastUpdate) {
                    console.log('Detectada atualização via polling');
                    lastUpdate = data.last_update * 1000;
                    location.reload();
                }
            }
        } catch (error) {
            console.error('Erro no polling:', error);
        }
    }, 2000); // Verifica a cada 2 segundos
}

// Função para recarregar após comandos específicos
async function processAndReload(force = false, backup = false) {
    try {
        const formData = new FormData();
        formData.append('force', force);
        formData.append('backup', backup);
        
        const response = await fetch('/process', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Processamento concluído:', result.message);
            
            // Aguarda um pouco antes de recarregar para dar tempo do WebSocket
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao processar:', error);
        alert('Erro ao processar arquivos');
    }
}

// Função para verificar se WebSocket está disponível
async function checkWebSocketAvailability() {
    try {
        const response = await fetch('/api/status');
        if (response.ok) {
            const data = await response.json();
            return data.websocket_available;
        }
    } catch (error) {
        console.error('Erro ao verificar disponibilidade do WebSocket:', error);
    }
    return false;
}

// ===== INICIALIZAÇÃO =====

// Inicialização comum
document.addEventListener('DOMContentLoaded', () => {
  console.log('JavaScript carregado - inicializando relatório...');
  
  // Inicializar tooltips do Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: 'hover'
    });
  });
  
  // Configurar modal para thumbnails
  document.querySelectorAll('tbody tr').forEach(r => {
    r.querySelectorAll('img.thumb').forEach(img => {
      img.onclick = () => showModal(img.src);
    });
  });
  
  // Configurar campos editáveis
  document.querySelectorAll('.edit-field').forEach(field => {
    field.addEventListener('click', () => startEditing(field));
  });
  
  // Configurar controles de colunas opcionais
  console.log('=== PROCURANDO ELEMENTOS DOS CONTROLES ===');
  
  // Aguardar um pouco para garantir que o DOM esteja completamente carregado
  setTimeout(() => {
    console.log('=== VERIFICAÇÃO TARDIA DOS ELEMENTOS ===');
    
    const toggleDescricao = document.getElementById('toggle-descricao');
    const toggleOcr = document.getElementById('toggle-ocr');
    const toggleMobileViewCheckbox = document.getElementById('toggle-mobile-view');
    const columnControlsSection = document.getElementById('columnControlsSection');
    const toggleButton = document.querySelector('[onclick="toggleColumnControls()"]');
    const toggleIcon = document.getElementById('columnControlsToggleIcon');
    
    console.log('toggleDescricao encontrado:', !!toggleDescricao);
    console.log('toggleOcr encontrado:', !!toggleOcr);
    console.log('toggleMobileViewCheckbox encontrado:', !!toggleMobileViewCheckbox);
    console.log('columnControlsSection encontrado:', !!columnControlsSection);
    console.log('Botão toggle encontrado:', !!toggleButton);
    console.log('toggleIcon encontrado:', !!toggleIcon);
    
    // Verificar se os elementos existem antes de configurar
    if (toggleDescricao && toggleOcr && columnControlsSection) {
      console.log('=== CONFIGURANDO CONTROLES DE COLUNAS ===');
      console.log('Estado inicial toggleDescricao:', toggleDescricao.checked);
      console.log('Estado inicial toggleOcr:', toggleOcr.checked);
      
      // Inicializar estado da coluna descrição
      toggleColumn('descricao-cell', toggleDescricao.checked);
      
      toggleDescricao.addEventListener('change', (e) => {
        console.log('=== EVENTO CHANGE toggleDescricao ===');
        console.log('Novo estado:', e.target.checked);
        toggleColumn('descricao-cell', e.target.checked);
      });
      
      // Inicializar estado da coluna OCR
      toggleColumn('ocr-cell', toggleOcr.checked);
      
      toggleOcr.addEventListener('change', (e) => {
        console.log('=== EVENTO CHANGE toggleOcr ===');
        console.log('Novo estado:', e.target.checked);
        toggleColumn('ocr-cell', e.target.checked);
      });
      
      console.log('Event listeners adicionados com sucesso!');
    } else {
      console.error('ERRO: Elementos dos controles não encontrados!');
      console.log('toggleDescricao:', toggleDescricao);
      console.log('toggleOcr:', toggleOcr);
      console.log('columnControlsSection:', columnControlsSection);
    }
    
    if (toggleMobileViewCheckbox) {
      toggleMobileViewCheckbox.addEventListener('change', (e) => {
        console.log('=== EVENTO CHANGE toggleMobileView ===');
        console.log('Novo estado:', e.target.checked);
        toggleMobileView();
      });
    }
  }, 100); // Aguardar 100ms para garantir que o DOM esteja carregado
  
  // Toggle pagamentos
  let showPay = false;
  const toggleBtn = document.getElementById('toggle-payments');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      showPay = !showPay;
      document.querySelectorAll('tbody tr').forEach(row => {
        const pay = row.querySelector('.classificacao.pagamento');
        row.style.display = pay ? (showPay ? '' : 'none') : '';
      });
    };
  }
  
  // Remove overlay
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    console.log('Removendo loading overlay...');
    overlay.style.display = 'none';
  } else {
    console.log('Loading overlay não encontrado');
  }
  
  // Exibe erros de motivo no console
  document.querySelectorAll('tbody tr[data-motivo]').forEach(r => {
    console.error('Erro linha', r.dataset.rowId, r.dataset.motivo);
  });
  
  // Funcionalidade de edição inline (para modo de impressão)
  if (document.querySelector('td[data-field]')) {
    // Tornar células editáveis
    document.querySelectorAll('td[data-field]').forEach(cell => {
      cell.contentEditable = true;
      cell.addEventListener('blur', function() {
        // Salvar alterações quando perder foco
        console.log('Campo editado:', this.getAttribute('data-field'), this.textContent);
      });
    });
    
    // Botão de download
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
  }
  
  // Inicializa sistema de atualização em tempo real
  async function initializeRealtimeUpdates() {
    try {
      const wsAvailable = await checkWebSocketAvailability();
      if (wsAvailable) {
        console.log('Inicializando WebSocket...');
        setupWebSocket();
      } else {
        console.log('WebSocket não disponível, usando polling...');
        setupPolling();
      }
    } catch (error) {
      console.error('Erro ao inicializar atualizações em tempo real:', error);
      // Fallback para polling
      setupPolling();
    }
  }
  
  initializeRealtimeUpdates();
  
  console.log('Inicialização do relatório concluída');
});

// Melhorias de acessibilidade
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar tooltips para imagens sem alt
  document.querySelectorAll('img.thumb').forEach(img => {
    if (!img.alt || img.alt === '') {
      img.alt = 'Comprovante de despesa';
    }
  });
  
  // Melhorar navegação por teclado
  document.querySelectorAll('.toggle-payments-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
  
  // Adicionar indicador visual para o estado do toggle
  const toggleBtn = document.getElementById('toggle-payments');
  if (toggleBtn) {
    let showPayments = false;
    toggleBtn.addEventListener('click', () => {
      showPayments = !showPayments;
      toggleBtn.setAttribute('aria-pressed', showPayments);
      toggleBtn.textContent = showPayments ? '🔒' : '⇄';
    });
  }
}); 

// Exportar funções de edição globalmente para uso nos onclick dos botões
window.startEditing = startEditing;
window.finishEditing = finishEditing;
window.cancelEditing = cancelEditing;
window.saveRowChanges = saveRowChanges;
window.cancelRowChanges = cancelRowChanges;
window.dismissRow = dismissRow;
window.rotateImage = rotateImage;
window.reprocessAI = reprocessAI; 