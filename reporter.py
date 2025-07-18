# reporter.py
# Caminho relativo ao projeto: reporter.py
# Módulo de geração de relatórios HTML para prestação de contas
import os
import pandas as pd
import base64
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from env import *
from template import TemplateRenderer

def _carregar_ocr_map():
    """Carrega o mapeamento de arquivos para textos OCR do arquivo extract.xml."""
    ocr_map = {}
    try:
        xml_path = os.path.join(ATTR_FIN_DIR_OCR, "extract.xml")
        if os.path.exists(xml_path):
            tree = ET.parse(xml_path)
            root = tree.getroot()
            for entry in root.findall('entry'):
                arquivo = entry.get('arquivo', '')
                texto = entry.text or ''
                ocr_map[arquivo] = texto
            print(f"📄 Carregados {len(ocr_map)} registros OCR de {xml_path}")
        else:
            print(f"⚠️  Arquivo OCR não encontrado: {xml_path}")
    except Exception as e:
        print(f"❌ Erro ao carregar OCR: {str(e)}")
    return ocr_map

def _preparar_linha(row, ocr_map, tem_motivo=False):
    """Prepara os dados de uma linha para o template - apenas dados puros, sem HTML."""
    data = str(row.get('DATA', ''))
    hora = str(row.get('HORA', ''))
    data_hora = f"{data} {hora}" if data != 'nan' and hora != 'nan' else ''
    
    classificacao = str(row.get('CLASSIFICACAO', ''))
    ricardo = str(row.get('RICARDO', ''))
    rafael = str(row.get('RAFAEL', ''))
    anexo = str(row.get('ANEXO', ''))
    descricao = str(row.get('DESCRICAO', ''))
    
    # Buscar texto OCR pelo nome do arquivo (campo ANEXO)
    anexo = str(row.get('ANEXO', ''))
    # 1) primeiro, tenta usar o que já veio no CSV (coluna "OCR")
    texto_csv = str(row.get('OCR', '') or '').strip()
    if texto_csv and texto_csv.lower() != 'nan':
        texto_ocr = texto_csv
    else:
        # 2) fallback: puxa do XML carregado em ocr_map
        texto_ocr = ocr_map.get(anexo, '') if anexo and anexo.lower() != 'nan' else ''
    
    # Flag para linha de total
    remetente = str(row.get('REMETENTE', ''))
    row_class = 'total-row' if 'TOTAL' in remetente.upper() else ''
    
    linha = {
        'data_hora': data_hora,
        'classificacao': classificacao,
        'ricardo': ricardo,
        'rafael': rafael,
        'anexo': anexo,
        'descricao': descricao,
        'ocr': texto_ocr,  # Texto OCR carregado do XML
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
        
        classificacao = str(row.get('CLASSIFICACAO', ''))
        if classificacao.lower() == 'transferência':
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
        
        # Carregar dados OCR
        ocr_map = _carregar_ocr_map()
        
        df = pd.read_csv(csv_path)
        tem_motivo = False  # Removendo a coluna "Motivo do Erro" de todos os relatórios
        
        # Preparar dados para o template
        rows = []
        for _, row in df.iterrows():
            rows.append(_preparar_linha(row, ocr_map, tem_motivo))
        
        context = {
            "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
            "rows": rows,
            "tem_motivo": tem_motivo,
            "attrs": {
                "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS
            }
        }
        
        TemplateRenderer.render(
            template_name="unified_report.html.j2",
            context=context,
            output_path="report.html"
        )
        print("✅ Relatório HTML gerado: report.html")
        
        # Validação OCR
        print("🔍 Validando conformidade OCR...")
        try:
            subprocess.run(['python', 'check.py', csv_path], check=True)
            print("✅ Validação OCR concluída com sucesso")
        except subprocess.CalledProcessError:
            print("❌ Falha na validação OCR - verifique as linhas sem OCR")
        except Exception as e:
            print(f"⚠️  Erro na validação OCR: {str(e)}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatório HTML: {str(e)}")

def gerar_relatorios_mensais_html(csv_path):
    try:
        if not os.path.exists(csv_path):
            print(f"❌ Arquivo {csv_path} não encontrado para gerar relatórios mensais")
            return
        print(f"📅 Gerando relatórios mensais baseados em {csv_path}...")
        
        # Carregar dados OCR
        ocr_map = _carregar_ocr_map()
        
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
            
            tem_motivo = False  # Removendo a coluna "Motivo do Erro" de todos os relatórios
            rows = []
            for _, row in dados_mes.iterrows():
                rows.append(_preparar_linha(row, ocr_map, tem_motivo))
            
            context = {
                "periodo": f"{nome_mes} {ano}",
                "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
                "rows": rows,
                "tem_motivo": tem_motivo,
                "edit_link": f"report-edit-{ano}-{mes:02d}-{nome_mes}.html",
                "attrs": {
                    "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                    "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS
                }
            }
            
            TemplateRenderer.render("unified_report.html.j2", context, nome_arquivo)
            relatorios_gerados += 1
            print(f"✅ Relatório mensal gerado: {nome_arquivo}")
            
            # Relatório mensal editável
            nome_arquivo_edit = f"report-edit-{ano}-{mes:02d}-{nome_mes}.html"
            TemplateRenderer.render("unified_report.html.j2", context, nome_arquivo_edit)
            print(f"✅ Relatório mensal editável gerado: {nome_arquivo_edit}")
        
        print(f"📅 Total de relatórios mensais gerados: {relatorios_gerados}")
        
        # Validação OCR
        print("🔍 Validando conformidade OCR...")
        try:
            subprocess.run(['python', 'check.py', csv_path], check=True)
            print("✅ Validação OCR concluída com sucesso")
        except subprocess.CalledProcessError:
            print("❌ Falha na validação OCR - verifique as linhas sem OCR")
        except Exception as e:
            print(f"⚠️  Erro na validação OCR: {str(e)}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatórios mensais: {str(e)}")

def gerar_html_impressao(df_mes, nome_arquivo, nome_mes, ano):
    try:
        rows = _preparar_linhas_impressao(df_mes)
        
        context = {
            "periodo": f"{nome_mes} {ano}",
            "rows": rows
        }
        
        context["print_mode"] = True
        TemplateRenderer.render("unified_report.html.j2", context, nome_arquivo)
        print(f"✅ HTML de impressão gerado: {nome_arquivo}")
    except Exception as e:
        print(f"❌ Erro ao gerar HTML de impressão: {str(e)}")
