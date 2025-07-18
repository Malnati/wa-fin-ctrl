// Funções comuns para os relatórios
function showModal(src) {
  document.getElementById('modal-img').src = src;
  document.getElementById('modal').classList.add('show');
}

function hideModal() {
  document.getElementById('modal').classList.remove('show');
}

// Inicialização comum
document.addEventListener('DOMContentLoaded', () => {
  console.log('JavaScript carregado - inicializando relatório...');
  
  // Configurar modal para thumbnails
  document.querySelectorAll('tbody tr').forEach(r => {
    r.querySelectorAll('img.thumb').forEach(img => {
      img.onclick = () => showModal(img.src);
    });
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