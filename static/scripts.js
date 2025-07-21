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
  console.log('toggleColumnControls chamada');
  const configSection = document.getElementById('columnControlsSection');
  const toggleIcon = document.getElementById('columnControlsToggleIcon');
  
  console.log('configSection encontrado:', !!configSection);
  console.log('toggleIcon encontrado:', !!toggleIcon);
  
  if (configSection && toggleIcon) {
    if (configSection.classList.contains('show')) {
      configSection.classList.remove('show');
      configSection.style.display = 'none';
      toggleIcon.className = 'bi bi-chevron-down ms-auto';
      console.log('Controles de colunas ocultados');
    } else {
      configSection.classList.add('show');
      configSection.style.display = 'block';
      toggleIcon.className = 'bi bi-chevron-up ms-auto';
      console.log('Controles de colunas exibidos');
    }
  } else {
    console.error('Elementos columnControlsSection ou columnControlsToggleIcon não encontrados');
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
  
  // Remover input
  input.remove();
  field.style.display = '';
  
  // Atualizar valor se mudou
  if (newValue !== originalValue) {
    field.textContent = newValue;
    field.classList.add('modified');
    field.dataset.original = newValue;
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
  row.querySelectorAll('.edit-field.modified').forEach(field => {
    modifiedFields[field.dataset.field] = field.textContent.trim();
  });
  
  if (Object.keys(modifiedFields).length === 0) {
    finishRowEditing(row);
    return;
  }
  
  // Mostrar loading
  row.classList.add('row-saving');
  
  try {
    const formData = new FormData();
    formData.append('find', dataHora);
    
    // Adicionar campos modificados
    Object.entries(modifiedFields).forEach(([field, value]) => {
      formData.append(field, value);
    });
    
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      // Sucesso
      row.classList.add('row-saved');
      setTimeout(() => {
        row.classList.remove('row-saved');
        finishRowEditing(row);
        
        // Limpar valores originais
        delete originalValues[dataHora];
      }, 500);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao salvar:', error);
    row.classList.add('row-error');
    setTimeout(() => row.classList.remove('row-error'), 500);
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

// ===== CONTROLE DE COLUNAS OPCIONAIS =====

// Alternar visibilidade de colunas opcionais
function toggleColumn(columnClass, show) {
  console.log(`=== toggleColumn chamada ===`);
  console.log(`Classe da coluna: ${columnClass}`);
  console.log(`Mostrar: ${show}`);
  
  const elements = document.querySelectorAll(`.${columnClass}`);
  console.log(`Elementos encontrados com classe '${columnClass}':`, elements.length);
  
  if (elements.length === 0) {
    console.warn(`Nenhum elemento encontrado com a classe '${columnClass}'`);
    return;
  }
  
  elements.forEach((el, index) => {
    console.log(`Processando elemento ${index + 1}:`, el);
    console.log(`Classes atuais:`, el.className);
    
    if (show) {
      el.classList.remove('hidden');
      console.log(`✅ Removida classe 'hidden' do elemento ${index + 1}`);
    } else {
      el.classList.add('hidden');
      console.log(`❌ Adicionada classe 'hidden' ao elemento ${index + 1}`);
    }
    
    console.log(`Classes após mudança:`, el.className);
    console.log(`Display atual:`, window.getComputedStyle(el).display);
  });
  
  console.log(`=== Fim toggleColumn ===`);
}

// Simular visualização mobile
function toggleMobileView() {
  console.log('toggleMobileView chamada');
  const table = document.querySelector('table');
  if (table) {
    table.classList.toggle('mobile-view');
    console.log('Classe mobile-view alternada na tabela');
  } else {
    console.error('Tabela não encontrada');
  }
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
  const toggleDescricao = document.getElementById('toggle-descricao');
  const toggleOcr = document.getElementById('toggle-ocr');
  const toggleMobileViewCheckbox = document.getElementById('toggle-mobile-view');
  
  if (toggleDescricao) {
    // Inicializar estado da coluna descrição
    toggleColumn('descricao-cell', toggleDescricao.checked);
    
    toggleDescricao.addEventListener('change', (e) => {
      toggleColumn('descricao-cell', e.target.checked);
    });
  }
  
  if (toggleOcr) {
    // Inicializar estado da coluna OCR
    toggleColumn('ocr-cell', toggleOcr.checked);
    
    toggleOcr.addEventListener('change', (e) => {
      toggleColumn('ocr-cell', e.target.checked);
    });
  }
  
  if (toggleMobileViewCheckbox) {
    toggleMobileViewCheckbox.addEventListener('change', (e) => {
      toggleMobileView();
    });
  }
  
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