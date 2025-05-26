// Cloudflare Worker para servir os arquivos HTML estáticos
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Redireciona para index.html se for a raiz
    if (url.pathname === '/') {
      url.pathname = '/index.html';
    }
    
    // Verifica se é um arquivo HTML válido (padrão index-yyyy-MM- ou index.html)
    const filename = url.pathname.substring(1);
    const isValidHtmlFile = filename === 'index.html' || 
                           /^index-\d{4}-\d{2}-.+\.html$/.test(filename);
    
    if (isValidHtmlFile) {
      // Busca arquivo via GitHub Raw com tratamento robusto de erros
      try {
        console.log(`Tentando buscar arquivo: ${filename}`);
        
        // Tenta buscar de diferentes fontes possíveis
        const possibleUrls = [
          `https://raw.githubusercontent.com/ricardomalnati/gastos-tia-claudia/main/${filename}`,
          `https://raw.githubusercontent.com/mal/gastos-tia-claudia/main/${filename}`
        ];
        
        for (let i = 0; i < possibleUrls.length; i++) {
          const githubUrl = possibleUrls[i];
          try {
            console.log(`Tentando URL ${i + 1}: ${githubUrl}`);
            
            // Timeout de 10 segundos para busca de arquivo
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const githubResponse = await fetch(githubUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'gastos-tia-claudia-worker'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (githubResponse.ok) {
              console.log(`Arquivo encontrado em: ${githubUrl}`);
              const content = await githubResponse.text();
              
              return new Response(content, {
                headers: {
                  'Content-Type': 'text/html;charset=UTF-8',
                  'Cache-Control': 'public, max-age=1800',
                  'X-Source': 'github-raw'
                }
              });
            } else {
              console.log(`Arquivo não encontrado em: ${githubUrl} (status: ${githubResponse.status})`);
            }
          } catch (e) {
            console.error(`Erro ao buscar ${githubUrl}:`, e.message);
            // Tenta próxima URL
          }
        }
      } catch (error) {
        console.error('Erro geral ao buscar arquivo via GitHub:', error);
      }
      
      // Se não conseguir buscar o arquivo, retorna mensagem de erro clara
      const errorPage = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório: ${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; transition: background 0.3s; }
          .btn:hover { background: #2980b9; }
          .btn-secondary { background: #6c757d; }
          .btn-secondary:hover { background: #5a6268; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📋 ${filename}</h1>
          <div class="error">
            <strong>❌ Relatório não disponível online</strong><br>
            O arquivo <code>${filename}</code> não foi encontrado no repositório online ou é muito grande para ser servido via Cloudflare Workers.
          </div>
          <div class="info">
            <strong>💡 Como acessar este relatório:</strong><br>
            1. <strong>Método recomendado:</strong> Execute <code>python app.py processar</code> localmente<br>
            2. Abra o arquivo <code>${filename}</code> diretamente no seu navegador<br>
            3. Verifique se o arquivo existe na raiz do projeto<br>
            4. Se o arquivo não existir, execute o processamento para gerá-lo
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn">⬅️ Voltar ao Menu Principal</a>
            <a href="/${filename}" class="btn btn-secondary">🔄 Tentar Novamente</a>
          </div>
          <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            <strong>Dica:</strong> Os relatórios mais recentes podem não estar disponíveis online imediatamente.<br>
            Use o comando local para acesso instantâneo a todos os dados.
          </div>
        </div>
      </body>
      </html>`;
      
      return new Response(errorPage, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8'
        }
      });
    }
    
    // Busca dinamicamente os arquivos HTML disponíveis
    let availableReports = [];
    
    // Gera possibilidades dinâmicas baseadas em padrões temporais
    const months = [
      { num: '01', name: 'Janeiro' },
      { num: '02', name: 'Fevereiro' }, 
      { num: '03', name: 'Marco' },
      { num: '04', name: 'Abril' },
      { num: '05', name: 'Maio' },
      { num: '06', name: 'Junho' },
      { num: '07', name: 'Julho' },
      { num: '08', name: 'Agosto' },
      { num: '09', name: 'Setembro' },
      { num: '10', name: 'Outubro' },
      { num: '11', name: 'Novembro' },
      { num: '12', name: 'Dezembro' }
    ];
    
    // Função para testar se arquivo existe via GitHub (com timeout)
    const testFileExists = async (filename) => {
      const possibleUrls = [
        `https://raw.githubusercontent.com/ricardomalnati/gastos-tia-claudia/main/${filename}`,
        `https://raw.githubusercontent.com/mal/gastos-tia-claudia/main/${filename}`
      ];
      
      for (const githubUrl of possibleUrls) {
        try {
          // Adiciona timeout de 3 segundos para evitar travamento
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(githubUrl, { 
            method: 'HEAD',
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            return true;
          }
        } catch (e) {
          // Continua tentando (inclui erros de timeout)
        }
      }
      return false;
    };
    
    // Testa index.html principal
    if (await testFileExists('index.html')) {
      availableReports.push('index.html');
    }
    
    // Gera e testa padrões dinamicamente (limitado para não fazer muitas requisições)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Testa apenas os últimos 6 meses para evitar muitas requisições
    for (let i = 0; i < 6; i++) {
      let testMonth = currentMonth - i;
      let testYear = currentYear;
      
      if (testMonth <= 0) {
        testMonth += 12;
        testYear -= 1;
      }
      
      const monthStr = testMonth.toString().padStart(2, '0');
      const monthName = months.find(m => m.num === monthStr)?.name || monthStr;
      
      // Testa padrões mais comuns primeiro
      const patterns = [
        `index-${testYear}-${monthStr}-${monthName}-20250526.html`,
        `index-${testYear}-${monthStr}-${monthName}.html`
      ];
      
      for (const pattern of patterns) {
        if (await testFileExists(pattern)) {
          availableReports.push(pattern);
          break; // Se encontrou um padrão, não testa os outros para este mês
        }
      }
    }
    
    // Testa padrão de data atual
    const today = new Date();
    const datePattern = today.toISOString().slice(0,10).replace(/-/g,'');
    const timePattern = datePattern + '_' + today.toTimeString().slice(0,8).replace(/:/g,'');
    
    if (await testFileExists(`index-${datePattern}.html`)) {
      availableReports.push(`index-${datePattern}.html`);
    }
    if (await testFileExists(`index-${timePattern}.html`)) {
      availableReports.push(`index-${timePattern}.html`);
    }
    
    // Remove duplicatas e ordena
    availableReports = [...new Set(availableReports)];
    availableReports.sort((a, b) => {
      // index.html primeiro
      if (a === 'index.html') return -1;
      if (b === 'index.html') return 1;
      // Depois por data (mais recente primeiro)
      return b.localeCompare(a);
    });
    
    // Se não encontrou nenhum relatório via detecção dinâmica, adiciona uma lista mínima como fallback
    if (availableReports.length === 0) {
      console.warn('Nenhum relatório encontrado via detecção dinâmica. Usando fallback.');
      // Adiciona relatórios conhecidos que existem fisicamente no projeto
      availableReports = [
        'index.html',
        'index-2025-04-Abril-20250526.html',
        'index-2025-05-Maio-20250526.html'
      ];
    }

    // Gera a lista HTML dos relatórios
    const reportsListHtml = availableReports.map(filename => {
      let displayName = '';
      let icon = '📋';
      
      if (filename === 'index.html') {
        displayName = 'Relatório Geral';
        icon = '📊';
      } else {
        // Extrai informações do nome do arquivo
        const match = filename.match(/index-(\d{4})-(\d{2})-(.+)\.html/);
        if (match) {
          const [, year, month, description] = match;
          const monthNames = {
            '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
            '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
            '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
          };
          const monthName = monthNames[month] || month;
          displayName = `${monthName} ${year}${description.includes('20250526') ? ' (26/05)' : ''}`;
          icon = '📅';
        } else {
          displayName = filename.replace('.html', '');
        }
      }
      
      return `<li><a href="/${filename}">${icon} ${displayName}</a></li>`;
    }).join('');

    // Página de índice com lista dinâmica de relatórios
    const indexPage = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gastos Tia Claudia - Relatórios</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .reports { list-style: none; padding: 0; }
        .reports li { margin: 10px 0; }
        .reports a { display: block; padding: 15px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; transition: background 0.3s; }
        .reports a:hover { background: #2980b9; }
        .info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .empty { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📊 Relatórios de Gastos</h1>
        <div class="info">
          <strong>Sistema de Prestação de Contas</strong><br>
          Relatórios gerados automaticamente a partir dos comprovantes processados.
        </div>
        ${availableReports.length > 0 ? 
          `<ul class="reports">${reportsListHtml}</ul>` : 
          `<div class="empty">
            <strong>📭 Nenhum relatório disponível online</strong><br>
            Execute <code>python app.py processar</code> localmente para gerar os relatórios.
          </div>`
        }
        <div class="info" style="margin-top: 20px;">
          <strong>ℹ️ Nota:</strong> Apenas relatórios menores que 25MB são hospedados online. 
          Para acessar todos os relatórios, execute <code>python app.py processar</code> localmente.
          <br><br>
          <strong>🔄 Última atualização:</strong> ${new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </body>
    </html>`;
    
    return new Response(indexPage, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8'
      }
    });
  }
}; 