import os
import pandas as pd
import base64
from pathlib import Path

# === CONSTANTES DE DIRETÓRIOS E ARQUIVOS ===
DIR_INPUT = "input"
DIR_IMGS = "imgs"
ARQ_CALCULO = "calculo.csv"

def gerar_relatorio_html(csv_path):
    try:
        if not os.path.exists(csv_path):
            print(f"❌ O relatório report.html não foi gerado pela ausência da planilha de cálculos ({csv_path})")
            return
        if os.path.exists("report.html"):
            timestamp = pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')
            arquivo_backup = f"report-{timestamp}.bak"
            os.rename("report.html", arquivo_backup)
            print(f"📁 Relatório anterior renomeado para: {arquivo_backup}")
        print(f"📊 Gerando novo relatório HTML baseado em {csv_path}...")
        df = pd.read_csv(csv_path)
        tem_motivo = 'MOTIVO_ERRO' in df.columns
        html = '''<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Prestação de Contas</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #2c3e50; margin-bottom: 30px; font-size: 28px; border-bottom: 3px solid #3498db; padding-bottom: 15px; }
    .info { text-align: center; margin-bottom: 20px; color: #7f8c8d; font-style: italic; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: center; vertical-align: middle; }
    th { background-color: #3498db; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    tr:hover { background-color: #e3f2fd; }
    .total-row { background-color: #fff3cd !important; font-weight: bold; border-top: 3px solid #ffc107; }
    .total-row:hover { background-color: #fff3cd !important; }
    img.thumb { max-height: 50px; max-width: 80px; cursor: pointer; transition: transform 0.3s ease; border-radius: 5px; border: 1px solid #ddd; }
    img.thumb:hover { transform: scale(3); z-index: 9999; position: relative; border: 2px solid #3498db; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .modal { display: none; position: fixed; z-index: 9999; padding-top: 0; left: 0; top: 0; width: 100vw; height: 100vh; overflow: auto; background-color: rgba(0,0,0,0.95); }
    .modal-content { margin: auto; display: block; width: 100%; height: 100%; object-fit: contain; }
    .modal.show { display: block; }
    .valor { font-weight: bold; color: #27ae60; }
    .data-hora { font-family: monospace; font-size: 12px; white-space: nowrap; }
    .classificacao { padding: 4px 8px; border-radius: 15px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .transferencia { background-color: #e8f5e8; color: #2e7d32; }
    .pagamento { background-color: #fff3e0; color: #f57c00; }
    @media (max-width: 768px) { .container { margin: 10px; padding: 15px; } table { font-size: 12px; } th, td { padding: 8px 4px; } h1 { font-size: 22px; } img.thumb { max-height: 40px; max-width: 60px; } img.thumb:hover { transform: scale(2.5); } table th:nth-child(1), table td:nth-child(1) { font-size: 10px; white-space: normal; word-break: break-word; } table th:nth-child(2), table td:nth-child(2) { font-size: 0; width: 30px; position: relative; } table th:nth-child(2) button { font-size: 0; border: none; background: none; padding: 4px; display: block; width: 100%; height: 100%; cursor: pointer; } table th:nth-child(2) { position: relative; z-index: 1; cursor: pointer; } table th:nth-child(2)::after { display: none; } span.classificacao.transferencia::before { content: "⇆"; } span.classificacao.pagamento::before { content: "💸"; } span.classificacao { font-size: 0; display: inline-block; width: 1em; height: 1em; } table th:nth-child(3)::after { content: "RI"; } table th:nth-child(4)::after { content: "RA"; } table th:nth-child(5)::after { content: "📎"; } table th:nth-child(6), table td:nth-child(6) { display: none; } }  </style>
</head>
<body>
  <!-- Mensagem de carregamento -->
  <div id="loading-overlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;">
    <div style="text-align:center;font-family:sans-serif;">
    <div style="font-size:18px;color:#333;font-family:sans-serif;">Carregando relatório, aguarde por favor...</div>
    </div>
  </div>
  <div class="container">
    <h1>Relatório de Prestação de Contas</h1>
    <div class="info">
      Gerado automaticamente em ''' + pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S') + '''
    </div>
    <table>
      <thead>
        <tr>
          <th>Data-Hora</th>
          <th><button id="toggle-payments" style="background:none;border:none;cursor:pointer;font-size:16px;" aria-label="Alternar pagamentos"></button></th>
          <th>Ricardo (R$)</th>
          <th>Rafael (R$)</th>
          <th>Anexo</th>
          <th>Descrição</th>'''
        if tem_motivo:
            html += '<th>Motivo do Erro</th>'
        html += '''
        </tr>
      </thead>
      <tbody>
'''
        for _, row in df.iterrows():
            data = str(row.get('DATA', ''))
            hora = str(row.get('HORA', ''))
            data_hora = f"{data} {hora}" if data != 'nan' and hora != 'nan' else ''
            classificacao = str(row.get('CLASSIFICACAO', ''))
            if classificacao.lower() == 'transferência':
                class_css = 'transferencia'
            elif classificacao.lower() == 'pagamento':
                class_css = 'pagamento'
            else:
                class_css = ''
            classificacao_html = f'<span class="classificacao {class_css}">{classificacao}</span>' if classificacao != 'nan' else ''
            ricardo = str(row.get('RICARDO', ''))
            rafael = str(row.get('RAFAEL', ''))
            ricardo_html = f'<span class="valor">{ricardo}</span>' if ricardo != 'nan' and ricardo != '' else ''
            rafael_html = f'<span class="valor">{rafael}</span>' if rafael != 'nan' and rafael != '' else ''
            remetente = str(row.get('REMETENTE', ''))
            row_class = 'total-row' if 'TOTAL' in remetente.upper() else ''
            if row_class == 'total-row':
                img_html = ''
            else:
                anexo = str(row.get('ANEXO', ''))
                img_html = ""
                if anexo != 'nan' and anexo != '' and anexo.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = None
                    for diretorio in ['imgs', 'input']:
                        caminho_completo = Path(diretorio) / anexo
                        if caminho_completo.is_file():
                            img_path = caminho_completo
                            break
                    if img_path:
                        # Referenciar imagem por caminho relativo em vez de base64
                        if img_path.parent.name == 'imgs':
                            img_html = f'<img src="imgs/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                        elif img_path.parent.name == 'input':
                            img_html = f'<img src="input/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                        else:
                            img_html = f'<img src="{img_path}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                    else:
                        img_html = f'<span style="color: #f39c12; font-size: 11px;">Não encontrado: {anexo}</span>'
            descricao = str(row.get('DESCRICAO', ''))
            descricao_html = descricao if descricao != 'nan' else ''
            html += f'''        <tr class="{row_class}">
          <td class="data-hora">{data_hora}</td>
          <td>{classificacao_html}</td>
          <td>{ricardo_html}</td>
          <td>{rafael_html}</td>
          <td>{img_html}</td>
          <td style="text-align: left; font-size: 12px;">{descricao_html}</td>'''
            if tem_motivo:
                motivo = str(row.get('MOTIVO_ERRO', ''))
                html += f'<td style="color:#e67e22;font-size:12px;">{motivo}</td>'
            html += '</tr>\n'
        html += '''      </tbody>
    </table>
  </div>
  <div id="modal" class="modal" onclick="hideModal()">
    <img class="modal-content" id="modal-img">
  </div>
  <script>
    function showModal(imgSrc) {
      const modal = document.getElementById('modal');
      const modalImg = document.getElementById('modal-img');
      modalImg.src = imgSrc;
      modal.classList.add('show');
    }
    function hideModal() {
      const modal = document.getElementById('modal');
      modal.classList.remove('show');
    }
    let showPayments = false;
    document.addEventListener('DOMContentLoaded', () => {
      const toggleBtn = document.getElementById('toggle-payments');
      toggleBtn.addEventListener('click', () => {
        showPayments = !showPayments;
        document.querySelectorAll('tbody tr').forEach(row => {
          const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');
          row.style.display = isPayment ? (showPayments ? '' : 'none') : '';
        });
      });
      document.querySelectorAll('tbody tr').forEach(row => {
        const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');
        if (isPayment) row.style.display = 'none';
      });
    });
    document.addEventListener('DOMContentLoaded', () => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    });
  </script>
</body>
</html>'''
        with open("report.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("✅ Relatório HTML gerado: report.html")
    except Exception as e:
        print(f"❌ Erro ao gerar relatório HTML: {str(e)}")

def gerar_relatorios_mensais_html(csv_path):
    try:
        if not os.path.exists(csv_path):
            print(f"❌ Arquivo {csv_path} não encontrado para gerar relatórios mensais")
            return
        print(f"📅 Gerando relatórios mensais baseados em {csv_path}...")
        df = pd.read_csv(csv_path)
        df['DATA_DT'] = pd.to_datetime(df['DATA'], format='%d/%m/%Y', errors='coerce')
        df = df.dropna(subset=['DATA_DT'])
        if len(df) == 0:
            print("⚠️  Nenhum dado com data válida encontrado")
            return
        df['ANO_MES'] = df['DATA_DT'].dt.to_period('M')
        grupos_mensais = df.groupby('ANO_MES')
        nomes_meses = {
            1: 'Janeiro', 2: 'Fevereiro', 3: 'Marco', 4: 'Abril',
            5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
            9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
        }
        relatorios_gerados = 0
        for periodo, dados_mes in grupos_mensais:
            ano = periodo.year
            mes = periodo.month
            nome_mes = nomes_meses[mes]
            dados_mes = dados_mes[dados_mes['DATA_DT'].dt.month == mes].copy()
            nome_arquivo = f"report-{ano}-{mes:02d}-{nome_mes}.html"
            if os.path.exists(nome_arquivo):
                timestamp = pd.Timestamp.now().strftime('%Y%m%d')
                arquivo_backup = f"report-{ano}-{mes:02d}-{nome_mes}-{timestamp}.bak"
                os.rename(nome_arquivo, arquivo_backup)
                print(f"📁 Relatório mensal anterior renomeado para: {arquivo_backup}")
            gerar_html_mensal(dados_mes, nome_arquivo, nome_mes, ano)
            relatorios_gerados += 1
            print(f"✅ Relatório mensal gerado: {nome_arquivo}")
            nome_arquivo_edit = f"report-edit-{ano}-{mes:02d}-{nome_mes}.html"
            gerar_html_mensal_editavel(dados_mes, nome_arquivo_edit, nome_mes, ano)
            print(f"✅ Relatório mensal editável gerado: {nome_arquivo_edit}")
        print(f"📅 Total de relatórios mensais gerados: {relatorios_gerados}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatórios mensais: {str(e)}")

def gerar_html_mensal(df_mes, nome_arquivo, nome_mes, ano):
    try:
        tem_motivo = 'MOTIVO_ERRO' in df_mes.columns
        meses_num = {
            'Janeiro': '01', 'Fevereiro': '02', 'Marco': '03', 'Abril': '04',
            'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
            'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
        }
        mes_num = meses_num.get(nome_mes, '01')
        html = '''<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Prestação de Contas - ''' + f"{nome_mes} {ano}" + '''</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #2c3e50; margin-bottom: 30px; font-size: 28px; border-bottom: 3px solid #3498db; padding-bottom: 15px; }
    .info { text-align: center; margin-bottom: 20px; color: #7f8c8d; font-style: italic; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: center; vertical-align: middle; }
    th { background-color: #3498db; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    tr:hover { background-color: #e3f2fd; }
    .total-row { background-color: #fff3cd !important; font-weight: bold; border-top: 3px solid #ffc107; }
    .total-row:hover { background-color: #fff3cd !important; }
    img.thumb { max-height: 50px; max-width: 80px; cursor: pointer; transition: transform 0.3s ease; border-radius: 5px; border: 1px solid #ddd; }
    img.thumb:hover { transform: scale(3); z-index: 9999; position: relative; border: 2px solid #3498db; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .modal { display: none; position: fixed; z-index: 9999; padding-top: 0; left: 0; top: 0; width: 100vw; height: 100vh; overflow: auto; background-color: rgba(0,0,0,0.95); }
    .modal-content { margin: auto; display: block; width: 100%; height: 100%; object-fit: contain; }
    .modal.show { display: block; }
    .valor { font-weight: bold; color: #27ae60; }
    .data-hora { font-family: monospace; font-size: 12px; white-space: nowrap; }
    .classificacao { padding: 4px 8px; border-radius: 15px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .transferencia { background-color: #e8f5e8; color: #2e7d32; }
    .pagamento { background-color: #fff3e0; color: #f57c00; }
    @media (max-width: 768px) { .container { margin: 10px; padding: 15px; } table { font-size: 12px; } th, td { padding: 8px 4px; } h1 { font-size: 22px; } img.thumb { max-height: 40px; max-width: 60px; } img.thumb:hover { transform: scale(2.5); } table th:nth-child(1), table td:nth-child(1) { font-size: 10px; white-space: normal; word-break: break-word; } table th:nth-child(2), table td:nth-child(2) { font-size: 0; width: 30px; position: relative; } table th:nth-child(2) button { font-size: 0; border: none; background: none; padding: 4px; display: block; width: 100%; height: 100%; cursor: pointer; } table th:nth-child(2) { position: relative; z-index: 1; cursor: pointer; } table th:nth-child(2)::after { display: none; } span.classificacao.transferencia::before { content: "⇆"; } span.classificacao.pagamento::before { content: "💸"; } span.classificacao { font-size: 0; display: inline-block; width: 1em; height: 1em; } table th:nth-child(3)::after { content: "RI"; } table th:nth-child(4)::after { content: "RA"; } table th:nth-child(5)::after { content: "📎"; } table th:nth-child(6), table td:nth-child(6) { display: none; } }  </style>
</head>
<body>
  <!-- Mensagem de carregamento -->
  <div id="loading-overlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;">
    <div style="font-size:18px;color:#333;font-family:sans-serif;">Carregando relatório, aguarde por favor...</div>
  </div>
  <div class="container">
    <h1>Relatório de Prestação de Contas - ''' + f"{nome_mes} {ano}" + '''</h1>
    <div class="info">Gerado automaticamente em ''' + pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S') + '''</div>
    <div style="text-align: right; margin-bottom: 10px;">
      <a href="report-edit-''' + f"{ano}-{mes_num}-{nome_mes}" + '''.html" target="_blank">
        <button>Editar Relatório</button>
      </a>
    </div>
    <table>
      <thead>
        <tr>
          <th>Data-Hora</th>
          <th><button id="toggle-payments" style="background:none;border:none;cursor:pointer;font-size:16px;" aria-label="Alternar pagamentos"></button></th>
          <th>Ricardo (R$)</th>
          <th>Rafael (R$)</th>
          <th>Anexo</th>
          <th>Descrição</th>'''
        if tem_motivo:
            html += '<th>Motivo do Erro</th>'
        html += '''
        </tr>
      </thead>
      <tbody>
'''
        for _, row in df_mes.iterrows():
            data = str(row.get('DATA', ''))
            hora = str(row.get('HORA', ''))
            data_hora = f"{data} {hora}" if data != 'nan' and hora != 'nan' else ''
            classificacao = str(row.get('CLASSIFICACAO', ''))
            if classificacao.lower() == 'transferência':
                class_css = 'transferencia'
            elif classificacao.lower() == 'pagamento':
                class_css = 'pagamento'
            else:
                class_css = ''
            classificacao_html = f'<span class="classificacao {class_css}">{classificacao}</span>' if classificacao != 'nan' else ''
            ricardo = str(row.get('RICARDO', ''))
            rafael = str(row.get('RAFAEL', ''))
            ricardo_html = f'<span class="valor">{ricardo}</span>' if ricardo != 'nan' and ricardo != '' else ''
            rafael_html = f'<span class="valor">{rafael}</span>' if rafael != 'nan' and rafael != '' else ''
            remetente = str(row.get('REMETENTE', ''))
            row_class = 'total-row' if 'TOTAL' in remetente.upper() else ''
            if row_class == 'total-row':
                img_html = ''
            else:
                anexo = str(row.get('ANEXO', ''))
                img_html = ""
                if anexo != 'nan' and anexo != '' and anexo.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = None
                    for diretorio in ['imgs', 'input']:
                        caminho_completo = Path(diretorio) / anexo
                        if caminho_completo.is_file():
                            img_path = caminho_completo
                            break
                    if img_path:
                        # Referenciar imagem por caminho relativo em vez de base64
                        if img_path.parent.name == 'imgs':
                            img_html = f'<img src="imgs/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                        elif img_path.parent.name == 'input':
                            img_html = f'<img src="input/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                        else:
                            img_html = f'<img src="{img_path}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                    else:
                        img_html = f'<span style="color: #f39c12; font-size: 11px;">Não encontrado: {anexo}</span>'
            descricao = str(row.get('DESCRICAO', ''))
            descricao_html = descricao if descricao != 'nan' else ''
            html += f'''        <tr class="{row_class}">
          <td class="data-hora">{data_hora}</td>
          <td>{classificacao_html}</td>
          <td>{ricardo_html}</td>
          <td>{rafael_html}</td>
          <td>{img_html}</td>
          <td style="text-align: left; font-size: 12px;">{descricao_html}</td>'''
            if tem_motivo:
                motivo = str(row.get('MOTIVO_ERRO', ''))
                html += f'<td style="color:#e67e22;font-size:12px;">{motivo}</td>'
            html += '</tr>\n'
        html += '''      </tbody>
    </table>
  </div>
  <div id="modal" class="modal" onclick="hideModal()">
    <img class="modal-content" id="modal-img">
  </div>
  <script>
    function showModal(imgSrc) {
      const modal = document.getElementById('modal');
      const modalImg = document.getElementById('modal-img');
      modalImg.src = imgSrc;
      modal.classList.add('show');
    }
    function hideModal() {
      const modal = document.getElementById('modal');
      modal.classList.remove('show');
    }
    let showPayments = false;
    document.addEventListener('DOMContentLoaded', () => {
      const toggleBtn = document.getElementById('toggle-payments');
      toggleBtn.addEventListener('click', () => {
        showPayments = !showPayments;
        document.querySelectorAll('tbody tr').forEach(row => {
          const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');
          row.style.display = isPayment ? (showPayments ? '' : 'none') : '';
        });
      });
      document.querySelectorAll('tbody tr').forEach(row => {
        const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');
        if (isPayment) row.style.display = 'none';
      });
    });
    document.addEventListener('DOMContentLoaded', () => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    });
  </script>
</body>
</html>'''
        with open(nome_arquivo, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Relatório HTML mensal gerado: {nome_arquivo}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatório mensal: {str(e)}")

def gerar_html_mensal_editavel(df_mes, nome_arquivo, nome_mes, ano):
    try:
        tem_motivo = 'MOTIVO_ERRO' in df_mes.columns
        meses_num = {
            'Janeiro': '01', 'Fevereiro': '02', 'Marco': '03', 'Abril': '04',
            'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
            'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
        }
        mes_num = meses_num.get(nome_mes, '01')
        html = '''<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Prestação de Contas - ''' + f"{nome_mes} {ano}" + '''</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #2c3e50; margin-bottom: 30px; font-size: 28px; border-bottom: 3px solid #3498db; padding-bottom: 15px; }
    .info { text-align: center; margin-bottom: 20px; color: #7f8c8d; font-style: italic; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: center; vertical-align: middle; }
    th { background-color: #3498db; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    tr:hover { background-color: #e3f2fd; }
    .total-row { background-color: #fff3cd !important; font-weight: bold; border-top: 3px solid #ffc107; }
    .total-row:hover { background-color: #fff3cd !important; }
    img.thumb { max-height: 50px; max-width: 80px; cursor: pointer; transition: transform 0.3s ease; border-radius: 5px; border: 1px solid #ddd; }
    img.thumb:hover { transform: scale(3); z-index: 9999; position: relative; border: 2px solid #3498db; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .modal { display: none; position: fixed; z-index: 9999; padding-top: 0; left: 0; top: 0; width: 100vw; height: 100vh; overflow: auto; background-color: rgba(0,0,0,0.95); }
    .modal-content { margin: auto; display: block; width: 100%; height: 100%; object-fit: contain; }
    .modal.show { display: block; }
    .valor { font-weight: bold; color: #27ae60; }
    .data-hora { font-family: monospace; font-size: 12px; white-space: nowrap; }
    .classificacao { padding: 4px 8px; border-radius: 15px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .transferencia { background-color: #e8f5e8; color: #2e7d32; }
    .pagamento { background-color: #fff3e0; color: #f57c00; }
    @media (max-width: 768px) { .container { margin: 10px; padding: 15px; } table { font-size: 12px; } th, td { padding: 8px 4px; } h1 { font-size: 22px; } img.thumb { max-height: 40px; max-width: 60px; } img.thumb:hover { transform: scale(2.5); } table th:nth-child(1), table td:nth-child(1) { font-size: 10px; white-space: normal; word-break: break-word; } table th:nth-child(2), table td:nth-child(2) { font-size: 0; width: 30px; position: relative; } table th:nth-child(2) button { font-size: 0; border: none; background: none; padding: 4px; display: block; width: 100%; height: 100%; cursor: pointer; } table th:nth-child(2) { position: relative; z-index: 1; cursor: pointer; } table th:nth-child(2)::after { display: none; } span.classificacao.transferencia::before { content: "⇆"; } span.classificacao.pagamento::before { content: "💸"; } span.classificacao { font-size: 0; display: inline-block; width: 1em; height: 1em; } table th:nth-child(3)::after { content: "RI"; } table th:nth-child(4)::after { content: "RA"; } table th:nth-child(5)::after { content: "📎"; } table th:nth-child(6), table td:nth-child(6) { display: none; } }  </style>
</head>
<body>
  <!-- Mensagem de carregamento -->
  <div id="loading-overlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;">
    <div style="font-size:18px;color:#333;font-family:sans-serif;">Carregando relatório, aguarde por favor...</div>
  </div>
  <div class="container">
    <h1>Relatório de Prestação de Contas - ''' + f"{nome_mes} {ano}" + '''</h1>
    <div class="info">Gerado automaticamente em ''' + pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S') + '''</div>
    <div style="text-align: right; margin-bottom: 10px;">
      <a href="report-edit-''' + f"{ano}-{mes_num}-{nome_mes}" + '''.html" target="_blank">
        <button>Editar Relatório</button>
      </a>
    </div>
    <table>
      <thead>
        <tr>
          <th>Data-Hora</th>
          <th><button id="toggle-payments" style="background:none;border:none;cursor:pointer;font-size:16px;" aria-label="Alternar pagamentos"></button></th>
          <th>Ricardo (R$)</th>
          <th>Rafael (R$)</th>
          <th>Anexo</th>
          <th>Descrição</th>'''
        if tem_motivo:
            html += '<th>Motivo do Erro</th>'
        html += '''
        </tr>
      </thead>
      <tbody>
'''
        for _, row in df_mes.iterrows():
            data = str(row.get('DATA', ''))
            hora = str(row.get('HORA', ''))
            data_hora = f"{data} {hora}" if data != 'nan' and hora != 'nan' else ''
            classificacao = str(row.get('CLASSIFICACAO', ''))
            if classificacao.lower() == 'transferência':
                class_css = 'transferencia'
            elif classificacao.lower() == 'pagamento':
                class_css = 'pagamento'
            else:
                class_css = ''
            classificacao_html = f'<span class="classificacao {class_css}">{classificacao}</span>' if classificacao != 'nan' else ''
            ricardo = str(row.get('RICARDO', ''))
            rafael = str(row.get('RAFAEL', ''))
            ricardo_html = f'<span class="valor">{ricardo}</span>' if ricardo != 'nan' and ricardo != '' else ''
            rafael_html = f'<span class="valor">{rafael}</span>' if rafael != 'nan' and rafael != '' else ''
            remetente = str(row.get('REMETENTE', ''))
            row_class = 'total-row' if 'TOTAL' in remetente.upper() else ''
            if row_class == 'total-row':
                img_html = ''
            else:
                anexo = str(row.get('ANEXO', ''))
                img_html = ""
                if anexo != 'nan' and anexo != '' and anexo.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = None
                    for diretorio in ['imgs', 'input']:
                        caminho_completo = Path(diretorio) / anexo
                        if caminho_completo.is_file():
                            img_path = caminho_completo
                            break
                    if img_path:
                        try:
                            with open(img_path, "rb") as f:
                                encoded = base64.b64encode(f.read()).decode()
                                ext = img_path.suffix.replace(".", "").lower()
                                if ext == 'jpg':
                                    ext = 'jpeg'
                                img_html = f'<img src="imgs/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                        except Exception as e:
                                print(f"Erro ao processar imagem {anexo}: {e}")
                                img_html = f'<span style="color: #e74c3c; font-size: 11px;">Erro: {anexo}</span>'
                    else:
                        img_html = f'<span style="color: #f39c12; font-size: 11px;">Não encontrado: {anexo}</span>'
            descricao = str(row.get('DESCRICAO', ''))
            descricao_html = descricao if descricao != 'nan' else ''
            html += f'''        <tr class="{row_class}">
          <td class="data-hora">{data_hora}</td>
          <td>{classificacao_html}</td>
          <td>{ricardo_html}</td>
          <td>{rafael_html}</td>
          <td>{img_html}</td>
          <td style="text-align: left; font-size: 12px;">{descricao_html}</td>'''
            if tem_motivo:
                motivo = str(row.get('MOTIVO_ERRO', ''))
                html += f'<td style="color:#e67e22;font-size:12px;">{motivo}</td>'
            html += '</tr>\n'
        html += '''      </tbody>
    </table>
  </div>
  <div id="modal" class="modal" onclick="hideModal()">
    <img class="modal-content" id="modal-img">
  </div>
  <script>
    function showModal(imgSrc) {
      const modal = document.getElementById('modal');
      const modalImg = document.getElementById('modal-img');
      modalImg.src = imgSrc;
      modal.classList.add('show');
    }
    function hideModal() {
      const modal = document.getElementById('modal');
      modal.classList.remove('show');
    }
    let showPayments = false;
    document.addEventListener('DOMContentLoaded', () => {
      const toggleBtn = document.getElementById('toggle-payments');
      toggleBtn.addEventListener('click', () => {
        showPayments = !showPayments;
        document.querySelectorAll('tbody tr').forEach(row => {
          const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');
          row.style.display = isPayment ? (showPayments ? '' : 'none') : '';
        });
      });
      document.querySelectorAll('tbody tr').forEach(row => {
        const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');
        if (isPayment) row.style.display = 'none';
      });
    });
    document.addEventListener('DOMContentLoaded', () => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    });
  </script>
</body>
</html>'''
        with open(nome_arquivo, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Relatório HTML mensal editável gerado: {nome_arquivo}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatório mensal editável: {str(e)}")

def gerar_html_impressao(df_mes, nome_arquivo, nome_mes, ano):
    try:
        html = f"""<!DOCTYPE html>
    <html lang=\"pt-br\">
    <head>
      <meta charset=\"UTF-8\">
      <style>
        @page {{ size: A4 portrait; margin: 2cm; }}
        body {{ font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; }}
        h1 {{ text-align: center; margin-bottom: 20px; font-size: 18px; }}
        .header-info {{ margin-bottom: 20px; }}
        .header-info span {{ display: inline-block; width: 45%; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
        th, td {{ border: 1px solid #000; padding: 4px; text-align: left; }}
        th {{ background-color: #f0f0f0; }}
        .signature {{ margin-top: 40px; }}
        .signature div {{ display: inline-block; width: 45%; text-align: center; }}
        #download-edits {{ margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }}
        #download-edits:hover {{ background-color: #0056b3; }}
      </style>
    </head>
    <body>
      <h1>Prestação de Contas - {nome_mes} {ano}</h1>
      <div class=\"header-info\">
        <span>Curador: ____________________________</span>
        <span>Curatelado: __________________________</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Receitas (R$)</th>
            <th>Despesas (R$)</th>
            <th>Saldo (R$)</th>
          </tr>
        </thead>
        <tbody>
    """
        def to_float(v):
            try:
                return float(str(v).replace('.', '').replace(',', '.'))
            except:
                return 0.0
        saldo = 0.0
        for index, row in df_mes.iterrows():
            data = row.get('DATA', '')
            descricao = row.get('DESCRICAO', '')
            valor = to_float(row.get('VALOR', '0'))
            identificador_unico = f"{index}_{data}_{valor}"
            if row.get('CLASSIFICACAO', '').lower() == 'transferência':
                receitas = f"{valor:.2f}"
                despesas = ''
                saldo += valor
            else:
                receitas = ''
                despesas = f"{valor:.2f}"
                saldo -= valor
            html += f'      <tr data-id="{identificador_unico}"><td>{data}</td><td data-field="descricao">{descricao}</td><td data-field="receitas">{receitas}</td><td data-field="despesas">{despesas}</td><td data-field="saldo">{saldo:.2f}</td></tr>\n'
        html += """    </tbody>
      </table>
      <button id=\"download-edits\">Salvar</button>
      <div class=\"signature\">
        <div>Local, ___/___/_____<br>Assinatura do Curador</div>
        <div>Data, ___/___/_____<br>Assinatura do Curatelado</div>
      </div>
      <script>/* ... mesmo JS de edição inline ... */</script>
    </body>
    </html>"""
        with open(nome_arquivo, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ HTML de impressão gerado: {nome_arquivo}")
    except Exception as e:
        print(f"❌ Erro ao gerar HTML de impressão: {str(e)}")
