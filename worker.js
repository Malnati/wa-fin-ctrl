// Cloudflare Worker para servir os arquivos HTML estáticos
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Redireciona para index.html se for a raiz
    if (url.pathname === '/') {
      url.pathname = '/index.html';
    }
    
    // Lista de arquivos HTML disponíveis
    const htmlFiles = [
      'index.html',
      'index-2025-04-Abril.html',
      'index-2025-05-Maio.html',
      'index-2025-04-Abril-20250526.html',
      'index-2025-05-Maio-20250526.html',
      'index-20250526_080942.html'
    ];
    
    // Verifica se é um arquivo HTML válido
    const filename = url.pathname.substring(1);
    if (htmlFiles.includes(filename)) {
      try {
        // Busca o arquivo no KV ou Assets
        const file = await fetch(`https://raw.githubusercontent.com/seu-usuario/gastos-tia-claudia/main/${filename}`);
        
        if (file.ok) {
          return new Response(await file.text(), {
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar arquivo:', error);
      }
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
          <li><a href="/index.html">📋 Relatório Geral</a></li>
          <li><a href="/index-2025-04-Abril.html">📅 Abril 2025</a></li>
          <li><a href="/index-2025-05-Maio.html">📅 Maio 2025</a></li>
          <li><a href="/index-2025-04-Abril-20250526.html">📅 Abril 2025 (26/05)</a></li>
          <li><a href="/index-2025-05-Maio-20250526.html">📅 Maio 2025 (26/05)</a></li>
          <li><a href="/index-20250526_080942.html">📅 Relatório 26/05 08:09</a></li>
        </ul>
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