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
      try {
        // Tenta buscar o arquivo usando Assets
        if (env.ASSETS) {
          const assetResponse = await env.ASSETS.fetch(request);
          if (assetResponse.status === 200) {
            return new Response(assetResponse.body, {
              headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar arquivo via Assets:', error);
      }
      
      // Se não conseguir via Assets, retorna mensagem informativa
      const infoPage = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório: ${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .btn:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📋 ${filename}</h1>
          <div class="alert">
            <strong>⚠️ Carregando relatório...</strong><br>
            O arquivo está sendo processado. Se não carregar automaticamente, use as opções abaixo.
          </div>
          <div class="info">
            <strong>💡 Como acessar este relatório:</strong><br>
            1. Execute o script Python localmente: <code>python app.py processar</code><br>
            2. Abra o arquivo <code>${filename}</code> diretamente no seu navegador<br>
            3. O arquivo está localizado na raiz do projeto
          </div>
          <a href="/" class="btn">⬅️ Voltar ao Menu</a>
          <a href="#" onclick="window.location.reload()" class="btn">🔄 Recarregar</a>
        </div>
        <script>
          // Tenta recarregar após 2 segundos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        </script>
      </body>
      </html>`;
      
      return new Response(infoPage, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8'
        }
      });
    }
    
    // Busca dinamicamente os arquivos HTML disponíveis
    let availableReports = [];
    
    // Gera possibilidades dinâmicas baseadas em padrões temporais
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1]; // Ano anterior, atual e próximo
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
    
    // Testa index.html principal
    try {
      if (env.ASSETS) {
        const testResponse = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
        if (testResponse.status === 200) {
          availableReports.push('index.html');
        }
      }
    } catch (e) {
      // index.html não existe
    }
    
    // Gera e testa padrões dinamicamente
    for (const year of years) {
      for (const month of months) {
        // Padrões possíveis baseados no que foi observado nos arquivos existentes
        const patterns = [
          `index-${year}-${month.num}-${month.name}.html`,
          `index-${year}-${month.num}-${month.name}-20250526.html`,
          `index-${year}-${month.num}-${month.name}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}.html`
        ];
        
        for (const pattern of patterns) {
          try {
            if (env.ASSETS) {
              const testResponse = await env.ASSETS.fetch(new Request(`${url.origin}/${pattern}`));
              if (testResponse.status === 200) {
                availableReports.push(pattern);
              }
            }
          } catch (e) {
            // Arquivo não existe, continua
          }
        }
      }
    }
    
    // Testa também padrões de backup/timestamp
    const currentDate = new Date();
    const datePatterns = [
      currentDate.toISOString().slice(0,10).replace(/-/g,''),
      currentDate.toISOString().slice(0,10).replace(/-/g,'') + '_' + currentDate.toTimeString().slice(0,8).replace(/:/g,'')
    ];
    
    for (const datePattern of datePatterns) {
      try {
        if (env.ASSETS) {
          const testResponse = await env.ASSETS.fetch(new Request(`${url.origin}/index-${datePattern}.html`));
          if (testResponse.status === 200) {
            availableReports.push(`index-${datePattern}.html`);
          }
        }
      } catch (e) {
        // Arquivo não existe
      }
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