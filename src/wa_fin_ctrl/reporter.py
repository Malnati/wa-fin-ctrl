# reporter.py
# Caminho relativo ao projeto: reporter.py
# Módulo de geração de relatórios HTML para prestação de contas
import os
import pandas as pd
import base64
import subprocess
import xml.etree.ElementTree as ET
import re
from pathlib import Path
from .env import *
from .template import TemplateRenderer

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

def _verificar_imagem_jpg_pdf(anexo):
    """Verifica se existe uma imagem JPG correspondente ao PDF."""
    if not anexo or anexo.lower() == 'nan' or not anexo.lower().endswith('.pdf'):
        return None
    
    nome_base = os.path.splitext(anexo)[0]
    jpg_path = os.path.join(ATTR_FIN_DIR_IMGS, f"{nome_base}.jpg")
    
    if os.path.exists(jpg_path):
        return f"{nome_base}.jpg"
    return None

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
    valor = str(row.get('VALOR', ''))
    validade = str(row.get('VALIDADE', ''))
    
    # Buscar texto OCR pelo nome do arquivo (campo ANEXO)
    anexo = str(row.get('ANEXO', ''))
    
    # Verificar se existe imagem JPG para PDF
    imagem_jpg = _verificar_imagem_jpg_pdf(anexo)
    
    # 1) primeiro, tenta usar o que já veio no CSV (coluna "OCR")
    texto_csv = str(row.get('OCR', '') or '').strip()
    if texto_csv and texto_csv.lower() != 'nan':
        texto_ocr = texto_csv
    else:
        # 2) fallback: puxa do XML carregado em ocr_map
        texto_ocr = ocr_map.get(anexo, '') if anexo and anexo.lower() != 'nan' else ''
    
    # Identificar origem da mensagem e direcionar valor para coluna correta
    remetente = str(row.get('REMETENTE', '')).strip().lower()
    print(f"DEBUG: Remetente: '{remetente}'")
    print(f"DEBUG: Ricardo original: '{ricardo}'")
    print(f"DEBUG: Rafael original: '{rafael}'")
    print(f"DEBUG: Valor original: '{valor}'")
    
    # Se o valor não está nas colunas RICARDO ou RAFAEL, extrair do texto OCR
    # MAS apenas se não houver um valor já corrigido na coluna VALOR
    valor_corrigido = str(row.get('VALOR', '')).strip()
    tem_valor_corrigido = valor_corrigido and valor_corrigido.lower() not in ['nan', '']
    
    if (not ricardo or ricardo.lower() in ['nan', '']) and (not rafael or rafael.lower() in ['nan', '']) and not tem_valor_corrigido:
        print(f"DEBUG: Campos RICARDO e RAFAEL estão vazios e não há valor corrigido, tentando extrair do OCR")
        # Tentar extrair valor do texto OCR
        import re
        valor_ocr = None
        
        # Padrões para encontrar valores no texto OCR
        padroes_valor = [
            r'R\$\s*([0-9.,]+)',  # R$ 123,45
            r'valor\s*R\$\s*([0-9.,]+)',  # valor R$ 123,45
            r'([0-9.,]+)\s*reais',  # 123,45 reais
            r'total\s*R\$\s*([0-9.,]+)',  # total R$ 123,45
            r'pago\s*R\$\s*([0-9.,]+)',  # pago R$ 123,45
            r'R\$\s*([0-9.,]+)\s*dados',  # R$ 123,45 dados
            r'valor\s*:\s*R\$\s*([0-9.,]+)',  # valor: R$ 123,45
            r'([0-9.,]+)\s*via\s*celular',  # 123,45 via celular
            r'([0-9.,]+)\s*realizado',  # 123,45 realizado
            r'VALOR\s*TOTAL\s*R\$\s*([0-9.,]+)',  # VALOR TOTAL R$ 123,45
            r'VALOR\s*A\s*PAGAR\s*R\$\s*([0-9.,]+)',  # VALOR A PAGAR R$ 123,45
            r'R\$\s*([0-9.,]+)\s*realizado',  # R$ 123,45 realizado
            r'valor\s*R\$\s*([0-9.,]+)\s*realizado',  # valor R$ 123,45 realizado
            r'([0-9.,]+)\s*R\$\s*realizado',  # 123,45 R$ realizado
            r'VALOR\s*PAGO\s*R\$\s*([0-9.,]+)',  # VALOR PAGO R$ 123,45
            r'VALOR\s*PAGO\s*([0-9.,]+)',  # VALOR PAGO 123,45
            r'valor\s*R\$\s*([0-9.,]+)\s*dados',  # valor R$ 123,45 dados
            r'([0-9.,]+)\s*R\$\s*dados',  # 123,45 R$ dados
            r'R\$\s*([0-9.,]+)\s*via',  # R$ 123,45 via
            r'valor\s*:\s*([0-9.,]+)',  # valor: 123,45
            r'([0-9.,]+)\s*R\$\s*via',  # 123,45 R$ via
            r'VALOR\s*TOTAL\s*([0-9.,]+)',  # VALOR TOTAL 123,45
            r'VALOR\s*A\s*PAGAR\s*([0-9.,]+)',  # VALOR A PAGAR 123,45
            r'R\$\s*([0-9.,]+)\s*realizado',  # R$ 123,45 realizado
            r'valor\s*R\$\s*([0-9.,]+)\s*realizado',  # valor R$ 123,45 realizado
            r'([0-9.,]+)\s*R\$\s*realizado',  # 123,45 R$ realizado
            r'VALOR\s*PAGO\s*R\$\s*([0-9.,]+)',  # VALOR PAGO R$ 123,45
            r'VALOR\s*PAGO\s*([0-9.,]+)',  # VALOR PAGO 123,45
            r'valor\s*R\$\s*([0-9.,]+)\s*dados',  # valor R$ 123,45 dados
            r'([0-9.,]+)\s*R\$\s*dados',  # 123,45 R$ dados
            r'R\$\s*([0-9.,]+)\s*via',  # R$ 123,45 via
            r'valor\s*:\s*([0-9.,]+)',  # valor: 123,45
            r'([0-9.,]+)\s*R\$\s*via',  # 123,45 R$ via
            r'VALOR\s*TOTAL\s*([0-9.,]+)',  # VALOR TOTAL 123,45
            r'VALOR\s*A\s*PAGAR\s*([0-9.,]+)',  # VALOR A PAGAR 123,45
            r'R\$\s*([0-9.,]+)\s*realizado',  # R$ 123,45 realizado
            r'valor\s*R\$\s*([0-9.,]+)\s*realizado',  # valor R$ 123,45 realizado
            r'([0-9.,]+)\s*R\$\s*realizado',  # 123,45 R$ realizado
            r'VALOR\s*PAGO\s*R\$\s*([0-9.,]+)',  # VALOR PAGO R$ 123,45
            r'VALOR\s*PAGO\s*([0-9.,]+)',  # VALOR PAGO 123,45
            r'valor\s*R\$\s*([0-9.,]+)\s*dados',  # valor R$ 123,45 dados
            r'([0-9.,]+)\s*R\$\s*dados',  # 123,45 R$ dados
            r'R\$\s*([0-9.,]+)\s*via',  # R$ 123,45 via
            r'valor\s*:\s*([0-9.,]+)',  # valor: 123,45
            r'([0-9.,]+)\s*R\$\s*via',  # 123,45 R$ via
            r'VALOR\s*TOTAL\s*([0-9.,]+)',  # VALOR TOTAL 123,45
            r'VALOR\s*A\s*PAGAR\s*([0-9.,]+)',  # VALOR A PAGAR 123,45
        ]
        
        for padrao in padroes_valor:
            match = re.search(padrao, texto_ocr, re.IGNORECASE)
            if match:
                valor_encontrado = match.group(1)
                try:
                    from .helper import normalize_value_to_brazilian_format
                    valor_ocr = normalize_value_to_brazilian_format(valor_encontrado)
                    print(f"DEBUG: Valor extraído '{valor_ocr}' do texto OCR para remetente '{remetente}'")
                    break
                except ValueError:
                    continue
        
        if valor_ocr:
            # Direcionar valor para coluna correta baseado no remetente
            if remetente == 'ricardo':
                ricardo = valor_ocr
                print(f"DEBUG: Valor {valor_ocr} atribuído à coluna RICARDO")
            elif remetente == 'rafael':
                rafael = valor_ocr
                print(f"DEBUG: Valor {valor_ocr} atribuído à coluna RAFAEL")
            else:
                # Se não conseguiu identificar remetente, tentar identificar pelo texto OCR
                if 'ricardo' in texto_ocr.lower() or 'itau' in texto_ocr.lower():
                    ricardo = valor_ocr
                    print(f"DEBUG: Valor {valor_ocr} atribuído à coluna RICARDO (identificado pelo texto)")
                elif 'rafael' in texto_ocr.lower() or 'nubank' in texto_ocr.lower() or 'nu pagamentos' in texto_ocr.lower():
                    rafael = valor_ocr
                    print(f"DEBUG: Valor {valor_ocr} atribuído à coluna RAFAEL (identificado pelo texto)")
                else:
                    # Fallback: usar o valor original se existir
                    if valor and valor.lower() not in ['nan', '']:
                        if remetente == 'ricardo':
                            ricardo = valor
                        elif remetente == 'rafael':
                            rafael = valor
        else:
            print(f"DEBUG: Nenhum valor encontrado no texto OCR")
    else:
        print(f"DEBUG: Campos RICARDO ou RAFAEL já têm valores")
    
    # Após toda a lógica de atribuição, garantir que ricardo/rafael recebam o valor extraído
    # MAS priorizar valores já corrigidos na coluna VALOR
    if tem_valor_corrigido:
        # Se há um valor corrigido, usar ele para a coluna apropriada
        if remetente == 'ricardo':
            ricardo = valor_corrigido
            print(f"DEBUG: Valor corrigido {valor_corrigido} atribuído à coluna RICARDO")
        elif remetente == 'rafael':
            rafael = valor_corrigido
            print(f"DEBUG: Valor corrigido {valor_corrigido} atribuído à coluna RAFAEL")
        else:
            # Se não conseguiu identificar remetente, usar o valor corrigido
            valor = valor_corrigido
            print(f"DEBUG: Valor corrigido {valor_corrigido} usado como valor geral")
    else:
        # Se não há valor corrigido, usar a lógica original
        if remetente == 'ricardo' and (not ricardo or ricardo.lower() in ['nan', '']):
            if valor and valor.lower() not in ['nan', '']:
                ricardo = valor
        # Se o remetente for Rafael e rafael está vazio, mas valor foi extraído, atribuir
        if remetente == 'rafael' and (not rafael or rafael.lower() in ['nan', '']):
            if valor and valor.lower() not in ['nan', '']:
                rafael = valor
    
    # Função utilitária para limpar valores monetários
    def limpar_valor(valor):
        if not valor:
            return ''
        
        from .helper import normalize_value_to_brazilian_format
        valor_limpo = normalize_value_to_brazilian_format(valor)
        return valor_limpo

    ricardo = limpar_valor(ricardo)
    rafael = limpar_valor(rafael)
    valor = limpar_valor(valor)

    # Flag para linha de total
    row_class = 'total-row' if 'TOTAL' in remetente.upper() else ''
    
    # Se a entrada está marcada como dismiss, altera a descrição
    if validade and validade.lower() == 'dismiss':
        descricao = 'desconsiderado'
        row_class = 'dismiss-row' if not row_class else f'{row_class} dismiss-row'
    # Se a entrada está marcada como fix-value, adiciona classe especial
    elif validade and 'fix-value' in validade.lower():
        row_class = 'fix-row' if not row_class else f'{row_class} fix-row'
        # Adiciona informação sobre a correção na descrição se não estiver vazia
        if descricao and descricao.lower() not in ['nan', '']:
            descricao = f"{descricao} (corrigido)"
        else:
            descricao = "Valor corrigido"
    
    linha = {
        'data_hora': data_hora,
        'classificacao': classificacao,
        'ricardo': ricardo,
        'rafael': rafael,
        'anexo': anexo,
        'descricao': descricao,
        'ocr': texto_ocr,  # Texto OCR carregado do XML
        'row_class': row_class,
        'valor': valor,
        'imagem_jpg': imagem_jpg  # Imagem JPG correspondente ao PDF
    }
    print(f"DEBUG LINHA: {linha}")
    
    if tem_motivo:
        motivo = str(row.get('MOTIVO_ERRO', ''))
        linha['motivo'] = motivo
    
    return linha

def _preparar_linhas_impressao(df_mes):
    """Prepara os dados para o template de impressão."""
    def to_float(v):
        try:
            from .helper import normalize_value_to_brazilian_format
            valor_brasileiro = normalize_value_to_brazilian_format(v)
            return float(valor_brasileiro.replace(',', '.'))
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
            receitas = f"{valor:.2f}".replace('.', ',')
            despesas = ''
            saldo += valor
        elif classificacao.lower() == 'desconhecido':
            # Registros desconhecidos são tratados como despesas (pagamentos não identificados)
            receitas = ''
            despesas = f"{valor:.2f}".replace('.', ',')
            saldo -= valor
        else:
            # Pagamentos e outros tipos
            receitas = ''
            despesas = f"{valor:.2f}".replace('.', ',')
            saldo -= valor
        
        rows.append({
            'identificador_unico': identificador_unico,
            'data': data,
            'descricao': descricao,
            'receitas': receitas,
            'despesas': despesas,
            'saldo': f"{saldo:.2f}".replace('.', ',')
        })
    
    return rows

def _calcular_totalizadores_pessoas(rows):
    """Calcula totalizadores por pessoa, excluindo registros com 'dismiss'."""
    def parse_valor(valor_str):
        """Converte string de valor para float."""
        if not valor_str or valor_str.lower() in ['nan', '']:
            return 0.0
        try:
            from .helper import normalize_value_to_brazilian_format
            valor_brasileiro = normalize_value_to_brazilian_format(valor_str)
            return float(valor_brasileiro.replace(',', '.'))
        except (ValueError, TypeError):
            return 0.0
    
    total_ricardo = 0.0
    total_rafael = 0.0
    
    for row in rows:
        # Pula registros marcados como dismiss
        if row.get('row_class', '').find('dismiss-row') != -1:
            continue
        
        # Soma valores de Ricardo
        valor_ricardo = parse_valor(row.get('ricardo', ''))
        total_ricardo += valor_ricardo
        
        # Soma valores de Rafael
        valor_rafael = parse_valor(row.get('rafael', ''))
        total_rafael += valor_rafael
    
    return {
        'ricardo': f"{total_ricardo:.2f}".replace('.', ','),
        'rafael': f"{total_rafael:.2f}".replace('.', ','),
        'ricardo_float': total_ricardo,
        'rafael_float': total_rafael
    }

def gerar_relatorio_html(csv_path, backup=True):
    print(f"DEBUG: Iniciando gerar_relatorio_html com csv_path: {csv_path}")
    try:
        if not os.path.exists(csv_path):
            print(f"❌ O relatório report.html não foi gerado pela ausência da planilha de cálculos ({csv_path})")
            return
        
        report_path = os.path.join(ATTR_FIN_DIR_DOCS, "report.html")
        if os.path.exists(report_path) and backup:
            timestamp = pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')
            arquivo_backup = f"report-{timestamp}.bak"
            os.rename(report_path, arquivo_backup)
            print(f"📁 Relatório anterior renomeado para: {arquivo_backup}")
        elif os.path.exists(report_path) and not backup:
            os.remove(report_path)
            print("🗑️ Relatório anterior removido (backup desabilitado)")
        print(f"📊 Gerando novo relatório HTML baseado em {csv_path}...")
        
        # Carregar dados OCR
        ocr_map = _carregar_ocr_map()
        
        df = pd.read_csv(csv_path)
        tem_motivo = False  # Removendo a coluna "Motivo do Erro" de todos os relatórios
        
        # Preparar dados para o template
        rows = []
        for _, row in df.iterrows():
            rows.append(_preparar_linha(row, ocr_map, tem_motivo))
        
        # Calcular totalizadores por pessoa
        totalizadores = _calcular_totalizadores_pessoas(rows)
        
        context = {
            "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
            "rows": rows,
            "tem_motivo": tem_motivo,
            "totalizadores": totalizadores,
            "is_editable": False,  # Relatório geral é apenas para visualização
            "attrs": {
                "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS
            }
        }
        
        print(f"DEBUG: Chamando TemplateRenderer.render com output_path: {report_path}")
        TemplateRenderer.render(
            template_name="unified_report.html.j2",
            context=context,
            output_path=report_path
        )
        print("✅ Relatório HTML gerado: report.html")
        
        # Gera o index.html a partir do template
        print("📄 Gerando página de entrada: index.html")
        
        # Detecta relatórios mensais disponíveis
        monthly_reports = []
        docs_dir = ATTR_FIN_DIR_DOCS
        if os.path.exists(docs_dir):
            for file in os.listdir(docs_dir):
                if file.startswith("report-") and file.endswith(".html"):
                    # Extrai informações do nome do arquivo: report-2025-04-Abril.html
                    match = re.match(r"report-(\d{4})-(\d{2})-(.+)\.html", file)
                    if match:
                        year = match.group(1)
                        month = match.group(3)
                        display_name = f"📅 {month} {year}"
                        monthly_reports.append({
                            "filename": file,
                            "display_name": display_name
                        })
        
        # Ordena por data (mais recente primeiro)
        monthly_reports.sort(key=lambda x: x["filename"], reverse=True)
        
        # Contexto para o template
        index_context = {
            "monthly_reports": monthly_reports
        }
        
        # Renderiza o template
        index_path = os.path.join(ATTR_FIN_DIR_DOCS, "index.html")
        TemplateRenderer.render(
            template_name="index.html.j2",
            context=index_context,
            output_path=index_path
        )
        print("✅ Página de entrada gerada: index.html")
        
        # Validação OCR
        print("🔍 Validando conformidade OCR...")
        try:
            # Executa o check.py usando o caminho correto
            import sys
            from pathlib import Path
            check_script = Path(__file__).parent / 'check.py'
            subprocess.run([sys.executable, str(check_script), csv_path], check=True)
            print("✅ Validação OCR concluída com sucesso")
        except subprocess.CalledProcessError:
            print("❌ Falha na validação OCR - verifique as linhas sem OCR")
        except Exception as e:
            print(f"⚠️  Erro na validação OCR: {str(e)}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatório HTML: {str(e)}")

def gerar_relatorios_mensais_html(csv_path, backup=True):
    print(f"📅 Gerando relatórios mensais HTML baseado em {csv_path}...")
    try:
        if not os.path.exists(csv_path):
            print(f"❌ Relatórios mensais não foram gerados pela ausência da planilha de cálculos ({csv_path})")
            return
        
        # Carregar dados OCR
        ocr_map = _carregar_ocr_map()
        
        # Carregar dados
        df = pd.read_csv(csv_path)
        df['DATA_DT'] = pd.to_datetime(df['DATA'], format='%d/%m/%Y', errors='coerce')
        df['ANO_MES'] = df['DATA_DT'].dt.to_period('M')
        
        # Agrupar por mês
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
            arquivo_path = os.path.join(ATTR_FIN_DIR_DOCS, nome_arquivo)
            if os.path.exists(arquivo_path) and backup:
                timestamp = pd.Timestamp.now().strftime('%Y%m%d')
                arquivo_backup = f"report-{ano}-{mes:02d}-{nome_mes}-{timestamp}.bak"
                os.rename(arquivo_path, arquivo_backup)
                print(f"📁 Relatório mensal anterior renomeado para: {arquivo_backup}")
            elif os.path.exists(arquivo_path) and not backup:
                os.remove(arquivo_path)
                print(f"🗑️ Relatório mensal anterior removido: {nome_arquivo} (backup desabilitado)")
            
            tem_motivo = False  # Removendo a coluna "Motivo do Erro" de todos os relatórios
            rows = []
            for _, row in dados_mes.iterrows():
                rows.append(_preparar_linha(row, ocr_map, tem_motivo))
            
            # Calcular totalizadores por pessoa para este mês
            totalizadores = _calcular_totalizadores_pessoas(rows)
            
            context = {
                "periodo": f"{nome_mes} {ano}",
                "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
                "rows": rows,
                "tem_motivo": tem_motivo,
                "totalizadores": totalizadores,
                "edit_link": f"report-edit-{ano}-{mes:02d}-{nome_mes}.html",
                "is_editable": False,  # Relatório mensal normal é apenas para visualização
                "attrs": {
                    "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                    "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS
                }
            }
            
            TemplateRenderer.render("unified_report.html.j2", context, arquivo_path)
            relatorios_gerados += 1
            print(f"✅ Relatório mensal gerado: {nome_arquivo}")
            
            # Relatório mensal editável (sem botão de edição)
            nome_arquivo_edit = f"report-edit-{ano}-{mes:02d}-{nome_mes}.html"
            arquivo_edit_path = os.path.join(ATTR_FIN_DIR_DOCS, nome_arquivo_edit)
            context_edit = {
                "periodo": f"{nome_mes} {ano}",
                "timestamp": pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S'),
                "rows": rows,
                "tem_motivo": tem_motivo,
                "totalizadores": totalizadores,
                # Não incluir edit_link para relatórios de edição
                "is_editable": True,  # Relatório editável tem funcionalidades de edição
                "attrs": {
                    "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                    "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS
                }
            }
            TemplateRenderer.render("unified_report.html.j2", context_edit, arquivo_edit_path)
            print(f"✅ Relatório mensal editável gerado: {nome_arquivo_edit}")
        
        print(f"📅 Total de relatórios mensais gerados: {relatorios_gerados}")
        
        # Validação OCR
        print("🔍 Validando conformidade OCR...")
        try:
            # Executa o check.py usando o caminho correto
            import sys
            from pathlib import Path
            check_script = Path(__file__).parent / 'check.py'
            subprocess.run([sys.executable, str(check_script), csv_path], check=True)
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

if __name__ == "__main__":
    print("🚀 Iniciando geração de relatórios...")
    gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO)
    gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO)
    print("✅ Geração de relatórios concluída!")
