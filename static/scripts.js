// Funções comuns para os relatórios
function showModal(src) {
  document.getElementById('modal-img').src = src;
  document.getElementById('modal').classList.add('show');
}

function hideModal() {
  document.getElementById('modal').classList.remove('show');
}

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
  
  // Criar input para edição
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-field editing form-control form-control-sm';
  input.value = field.textContent === 'Clique para editar' ? '' : field.textContent;
  input.dataset.field = field.dataset.field;
  
  // Substituir o span pelo input
  field.style.display = 'none';
  field.parentNode.insertBefore(input, field);
  
  // Focar no input
  input.focus();
  input.select();
  
  // Event listeners para o input
  input.addEventListener('blur', () => finishEditing(input, field));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEditing(input, field);
    } else if (e.key === 'Escape') {
      cancelEditing(input, field);
    }
  });
}

// Função para finalizar edição de um campo
function finishEditing(input, field) {
  const newValue = input.value.trim();
  const originalValue = field.dataset.original;
  
  // Restaurar o span
  field.style.display = '';
  field.textContent = newValue || 'Clique para editar';
  
  // Atualizar dados se o valor mudou
  if (newValue !== originalValue) {
    field.dataset.original = newValue;
    field.classList.add('modified');
  } else {
    field.classList.remove('modified');
  }
  
  // Remover input
  input.remove();
  
  // Verificar se ainda há campos sendo editados na linha
  const row = field.closest('tr');
  const editingInputs = row.querySelectorAll('.edit-field.editing');
  if (editingInputs.length === 0) {
    // Nenhum campo sendo editado, verificar se há modificações
    const modifiedFields = row.querySelectorAll('.edit-field.modified');
    if (modifiedFields.length > 0) {
      // Mostrar botões de salvar/cancelar
      showSaveCancelButtons(row);
    } else {
      // Nenhuma modificação, sair do modo de edição
      exitEditMode(row);
    }
  }
}

// Função para cancelar edição de um campo
function cancelEditing(input, field) {
  // Restaurar valor original
  field.style.display = '';
  field.textContent = field.dataset.original || 'Clique para editar';
  field.classList.remove('modified');
  
  // Remover input
  input.remove();
}

// Função para mostrar botões de salvar/cancelar
function showSaveCancelButtons(row) {
  const actions = row.querySelector('.row-actions');
  actions.querySelector('.btn-save').style.display = 'inline-flex';
  actions.querySelector('.btn-cancel').style.display = 'inline-flex';
  actions.querySelector('.btn-dismiss').style.display = 'none';
  actions.querySelector('.btn-rotate').style.display = 'none';
  actions.querySelector('.btn-reprocess').style.display = 'none';
}

// Função para sair do modo de edição
function exitEditMode(row) {
  row.classList.remove('row-editing');
  const actions = row.querySelector('.row-actions');
  actions.querySelector('.btn-save').style.display = 'none';
  actions.querySelector('.btn-cancel').style.display = 'none';
  actions.querySelector('.btn-dismiss').style.display = 'inline-flex';
  actions.querySelector('.btn-rotate').style.display = 'inline-flex';
  actions.querySelector('.btn-reprocess').style.display = 'inline-flex';
  
  // Limpar estado de edição
  if (editingRow === row) {
    editingRow = null;
  }
}

// Função para salvar alterações de uma linha
async function saveRowChanges(dataHora) {
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  // Coletar dados modificados
  const modifiedFields = row.querySelectorAll('.edit-field.modified');
  if (modifiedFields.length === 0) {
    exitEditMode(row);
    return;
  }
  
  const formData = new FormData();
  formData.append('find', dataHora);
  
  // Adicionar campos modificados
  modifiedFields.forEach(field => {
    const fieldName = field.dataset.field;
    const newValue = field.textContent === 'Clique para editar' ? '' : field.textContent;
    
    switch (fieldName) {
      case 'ricardo':
      case 'rafael':
        formData.append('value', newValue);
        break;
      case 'classificacao':
        formData.append('class_', newValue);
        break;
      case 'descricao':
        formData.append('desc', newValue);
        break;
    }
  });
  
  try {
    // Mostrar loading
    row.classList.add('row-saving');
    
    // Fazer requisição para a API
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Sucesso
      row.classList.remove('row-saving');
      row.classList.add('row-saved');
      
      // Limpar modificações
      modifiedFields.forEach(field => {
        field.classList.remove('modified');
      });
      
      // Sair do modo de edição
      exitEditMode(row);
      
      // Feedback visual
      setTimeout(() => {
        row.classList.remove('row-saved');
      }, 500);
      
      console.log('Alterações salvas com sucesso:', result);
    } else {
      throw new Error(result.message || 'Erro ao salvar alterações');
    }
    
  } catch (error) {
    console.error('Erro ao salvar alterações:', error);
    
    // Remover loading e mostrar erro
    row.classList.remove('row-saving');
    row.classList.add('row-error');
    
    // Feedback visual de erro
    setTimeout(() => {
      row.classList.remove('row-error');
    }, 500);
    
    alert(`Erro ao salvar alterações: ${error.message}`);
  }
}

// Função para cancelar alterações de uma linha
function cancelRowChanges(dataHora) {
  const row = document.querySelector(`tr[data-data-hora="${dataHora}"]`);
  if (!row) return;
  
  // Restaurar valores originais
  if (originalValues[dataHora]) {
    row.querySelectorAll('.edit-field').forEach(field => {
      const fieldName = field.dataset.field;
      const originalValue = originalValues[dataHora][fieldName] || '';
      field.textContent = originalValue || 'Clique para editar';
      field.dataset.original = originalValue;
      field.classList.remove('modified');
    });
  }
  
  // Sair do modo de edição
  exitEditMode(row);
  
  // Limpar valores originais
  delete originalValues[dataHora];
}

// Função para marcar linha como desconsiderada
async function dismissRow(dataHora) {
  if (!confirm('Tem certeza que deseja marcar esta linha como desconsiderada?')) {
    return;
  }
  
  const formData = new FormData();
  formData.append('find', dataHora);
  formData.append('dismiss', 'true');
  
  try {
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Recarregar a página para mostrar as alterações
      location.reload();
    } else {
      throw new Error(result.message || 'Erro ao marcar como desconsiderada');
    }
    
  } catch (error) {
    console.error('Erro ao marcar como desconsiderada:', error);
    alert(`Erro ao marcar como desconsiderada: ${error.message}`);
  }
}

// Função para rotacionar imagem
async function rotateImage(dataHora) {
  const degrees = prompt('Digite os graus de rotação (90, 180 ou 270):');
  if (!degrees || !['90', '180', '270'].includes(degrees)) {
    alert('Por favor, digite 90, 180 ou 270 graus.');
    return;
  }
  
  const formData = new FormData();
  formData.append('find', dataHora);
  formData.append('rotate', degrees);
  
  try {
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert('Imagem rotacionada com sucesso! A página será recarregada.');
      location.reload();
    } else {
      throw new Error(result.message || 'Erro ao rotacionar imagem');
    }
    
  } catch (error) {
    console.error('Erro ao rotacionar imagem:', error);
    alert(`Erro ao rotacionar imagem: ${error.message}`);
  }
}

// Função para reprocessar com IA
async function reprocessAI(dataHora) {
  if (!confirm('Tem certeza que deseja reprocessar esta entrada com IA? Isso pode alterar valores, descrições e classificações.')) {
    return;
  }
  
  const formData = new FormData();
  formData.append('find', dataHora);
  formData.append('ia', 'true');
  
  try {
    const response = await fetch('/fix', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert('Reprocessamento com IA concluído! A página será recarregada.');
      location.reload();
    } else {
      throw new Error(result.message || 'Erro ao reprocessar com IA');
    }
    
  } catch (error) {
    console.error('Erro ao reprocessar com IA:', error);
    alert(`Erro ao reprocessar com IA: ${error.message}`);
  }
}

// Inicialização comum
document.addEventListener('DOMContentLoaded', () => {
  console.log('JavaScript carregado - inicializando relatório...');
  
  // Inicializar tooltips do Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
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
    
    // COMENTADO: Esconde pagamentos por padrão - estava causando relatório em branco
    // document.querySelectorAll('tbody tr').forEach(row => {
    //   if (row.querySelector('.classificacao.pagamento')) {
    //     row.style.display = 'none';
    //   }
    // });
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