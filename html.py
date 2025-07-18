# html.py
# Caminho relativo ao projeto: html.py
# Módulo de geração de relatórios HTML para prestação de contas
import os
import pandas as pd
import base64
from pathlib import Path
from env import *
from template import TemplateRenderer

def _preparar_linha(row, tem_motivo=False):
    """Prepara os dados de uma linha para o template."""
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
            for diretorio in [ATTR_FIN_DIR_IMGS, ATTR_FIN_DIR_INPUT]:
                if diretorio:  # Verifica se o diretório não está vazio
                    caminho_completo = Path(diretorio) / anexo
                    if caminho_completo.is_file():
                        img_path = caminho_completo
                        break
            if img_path:
                # Referenciar imagem por caminho relativo em vez de base64
                if img_path.parent.name == ATTR_FIN_DIR_IMGS:
                    img_html = f'<img src="{ATTR_FIN_DIR_IMGS}/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                elif img_path.parent.name == ATTR_FIN_DIR_INPUT:
                    img_html = f'<img src="{ATTR_FIN_DIR_INPUT}/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
                else:
                    img_html = f'<img src="{img_path}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">'
            else:
                img_html = f'<span style="color: #f39c12; font-size: 11px;">Não encontrado: {anexo}</span>'
    
    descricao = str(row.get('DESCRICAO', ''))
    descricao_html = descricao if descricao != 'nan' else ''
    
    linha = {
        'data_hora': data_hora,
        'classificacao_html': classificacao_html,
        'ricardo_html': ricardo_html,
        'rafael_html': rafael_html,
        'img_html': img_html,
        'descricao_html': descricao_html,
        'row_class': row_class
    }
    
    if tem_motivo:
        motivo = str(row.get('MOTIVO_ERRO', ''))
        linha['motivo'] = motivo
    
    return linha

def _preparar_linhas_impressao(df_mes):
    """Prepara os dados para o template de impressão."""
    def to_float(v):
        try:
            return float(str(v).replace('.', '').replace(',', '.'))
        except:
            return 0.0
    
    saldo = 0.0
    rows = []
    
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
        
        rows.append({
            'identificador_unico': identificador_unico,
            'data': data,
            'descricao': descricao,
            'receitas': receitas,
            'despesas': despesas,
            'saldo': f"{saldo:.2f}"
        })
    
    return rows

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
        
        # Preparar dados para o template
        rows = []
        for _, row in df.iterrows():
            rows.append(_preparar_linha(row, tem_motivo))
        
        context = {
            "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
            "rows": rows,
            "tem_motivo": tem_motivo
        }
        
        TemplateRenderer.render(
            template_name="report.html.j2",
            context=context,
            output_path="report.html"
        )
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
            
            # Relatório mensal normal
            nome_arquivo = f"report-{ano}-{mes:02d}-{nome_mes}.html"
            if os.path.exists(nome_arquivo):
                timestamp = pd.Timestamp.now().strftime('%Y%m%d')
                arquivo_backup = f"report-{ano}-{mes:02d}-{nome_mes}-{timestamp}.bak"
                os.rename(nome_arquivo, arquivo_backup)
                print(f"📁 Relatório mensal anterior renomeado para: {arquivo_backup}")
            
            tem_motivo = 'MOTIVO_ERRO' in dados_mes.columns
            rows = []
            for _, row in dados_mes.iterrows():
                rows.append(_preparar_linha(row, tem_motivo))
            
            context = {
                "periodo": f"{nome_mes} {ano}",
                "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
                "rows": rows,
                "tem_motivo": tem_motivo,
                "edit_link": f"report-edit-{ano}-{mes:02d}-{nome_mes}.html"
            }
            
            TemplateRenderer.render("monthly_report.html.j2", context, nome_arquivo)
            relatorios_gerados += 1
            print(f"✅ Relatório mensal gerado: {nome_arquivo}")
            
            # Relatório mensal editável
            nome_arquivo_edit = f"report-edit-{ano}-{mes:02d}-{nome_mes}.html"
            TemplateRenderer.render("monthly_report_editable.html.j2", context, nome_arquivo_edit)
            print(f"✅ Relatório mensal editável gerado: {nome_arquivo_edit}")
        
        print(f"📅 Total de relatórios mensais gerados: {relatorios_gerados}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatórios mensais: {str(e)}")

def gerar_html_impressao(df_mes, nome_arquivo, nome_mes, ano):
    try:
        rows = _preparar_linhas_impressao(df_mes)
        
        context = {
            "periodo": f"{nome_mes} {ano}",
            "rows": rows
        }
        
        TemplateRenderer.render("print_report.html.j2", context, nome_arquivo)
        print(f"✅ HTML de impressão gerado: {nome_arquivo}")
    except Exception as e:
        print(f"❌ Erro ao gerar HTML de impressão: {str(e)}")
