// Cloudflare Worker para servir os arquivos HTML estáticos
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Redireciona para index.html se for a raiz
    if (url.pathname === '/') {
      url.pathname = '/index.html';
    }
    
    // Lista de arquivos HTML disponíveis
    const htmlFiles = [
      'index-2025-04-Abril-20250526.html',
      'index-2025-05-Maio-20250526.html'
    ];
    
    // Verifica se é um arquivo HTML válido
    const filename = url.pathname.substring(1);
    if (htmlFiles.includes(filename)) {
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
    
    // Página de índice com lista de relatórios
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📊 Relatórios de Gastos</h1>
        <div class="info">
          <strong>Sistema de Prestação de Contas</strong><br>
          Relatórios gerados automaticamente a partir dos comprovantes processados.
        </div>
        <ul class="reports">
          <li><a href="/index-2025-04-Abril-20250526.html">📅 Abril 2025 (26/05)</a></li>
          <li><a href="/index-2025-05-Maio-20250526.html">📅 Maio 2025 (26/05)</a></li>
        </ul>
        <div class="info" style="margin-top: 20px;">
          <strong>ℹ️ Nota:</strong> Os relatórios completos são muito grandes para hospedar online. 
          Para acessar todos os relatórios, execute <code>python app.py processar</code> localmente.
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