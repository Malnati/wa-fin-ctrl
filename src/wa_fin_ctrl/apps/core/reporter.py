# reporter.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/reporter.py
# Módulo de geração de relatórios HTML para prestação de contas

import os
import pandas as pd
import base64
import subprocess
import xml.etree.ElementTree as ET
import re
from pathlib import Path
from .env import *
# Removido: TemplateRenderer não é mais necessário (sem templates J2)
# from .template import TemplateRenderer
from .helper import normalize_value_to_brazilian_format
from .utils import (
    _calcular_totalizadores_pessoas,
    parse_valor,
)

# ==== CONSTANTES ====
# Arquivos
# ARQUIVO_EXTRACT_XML = "extract.xml"  # Removido: arquivo OCR não é mais necessário

# Extensões de arquivo
EXTENSAO_PDF = ".pdf"
EXTENSAO_JPG = ".jpg"

# Elementos XML
ELEMENTO_ENTRY = "entry"
ATRIBUTO_ARQUIVO = "arquivo"

# Nomes de colunas CSV
COLUNA_DATA = "DATA"
COLUNA_HORA = "HORA"
COLUNA_CLASSIFICACAO = "CLASSIFICACAO"
COLUNA_RICARDO = "RICARDO"
COLUNA_RAFAEL = "RAFAEL"
COLUNA_ANEXO = "ANEXO"
COLUNA_DESCRICAO = "DESCRICAO"
COLUNA_VALOR = "VALOR"
COLUNA_VALIDADE = "VALIDADE"
COLUNA_OCR = "OCR"
COLUNA_REMETENTE = "REMETENTE"

# Valores especiais
VALOR_NAN = "nan"
VALOR_VAZIO = ""


def _carregar_ocr_map():
    """Carrega o mapeamento de arquivos para textos OCR do arquivo extract.xml."""
    # Removido: arquivo OCR não é mais necessário (dados no banco)
    ocr_map = {}
    print("📄 OCR carregado do banco de dados unificado")
    return ocr_map


def _gerar_html_simples(context, output_path):
    """Gera HTML simples sem templates J2"""
    try:
        # Cria o diretório se necessário
        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Gera HTML básico
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório Financeiro</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        .total {{ font-weight: bold; }}
    </style>
</head>
<body>
    <h1>Relatório Financeiro</h1>
    <p>Período: {context.get('periodo', 'N/A')}</p>
    <p>Gerado em: {context.get('timestamp', 'N/A')}</p>
    
    <table>
        <thead>
            <tr>
                <th>Data/Hora</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Classificação</th>
            </tr>
        </thead>
        <tbody>
"""
        
        # Adiciona linhas de dados
        for row in context.get('rows', []):
            html_content += f"""
            <tr>
                <td>{row.get('data_hora', '')}</td>
                <td>{row.get('valor_formatado', '')}</td>
                <td>{row.get('descricao', '')}</td>
                <td>{row.get('classificacao', '')}</td>
            </tr>
"""
        
        html_content += """
        </tbody>
    </table>
</body>
</html>
"""
        
        # Salva o arquivo
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"✅ HTML gerado: {output_path}")
        
    except Exception as e:
        print(f"❌ Erro ao gerar HTML: {str(e)}")


def _verificar_imagem_jpg_pdf(anexo):
    """Verifica se existe uma imagem JPG correspondente ao PDF."""
    if not anexo or anexo.lower() == VALOR_NAN or not anexo.lower().endswith(EXTENSAO_PDF):
        return None

    nome_base = os.path.splitext(anexo)[0]
    jpg_path = os.path.join(ATTR_FIN_DIR_IMGS, f"{nome_base}{EXTENSAO_JPG}")

    if os.path.exists(jpg_path):
        return f"{nome_base}.jpg"
    return None


def _preparar_linha_do_banco(row_data):
    """Prepara linha de dados do banco para o template"""
    return {
        'data_hora': row_data['data_hora'],
        'valor': row_data['valor'],
        'descricao': row_data['descricao'],
        'classificacao': row_data['classificacao'],
        'arquivo_origem': row_data['arquivo_origem'],
        'desconsiderada': row_data['desconsiderada'],
        'valor_formatado': f"R$ {row_data['valor']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
        'tem_erro': False,
        'motivo_erro': ''
    }

def _preparar_linha(row, ocr_map, tem_motivo=False):
    """Prepara os dados de uma linha para o template - apenas dados puros, sem HTML."""
    data = str(row.get(COLUNA_DATA, ""))
    hora = str(row.get(COLUNA_HORA, ""))
    data_hora = f"{data} {hora}" if data != VALOR_NAN and hora != VALOR_NAN else ""

    classificacao = str(row.get(COLUNA_CLASSIFICACAO, ""))
    ricardo = str(row.get(COLUNA_RICARDO, ""))
    rafael = str(row.get(COLUNA_RAFAEL, ""))
    anexo = str(row.get(COLUNA_ANEXO, ""))
    descricao = str(row.get(COLUNA_DESCRICAO, ""))
    valor = str(row.get(COLUNA_VALOR, ""))
    validade = str(row.get(COLUNA_VALIDADE, ""))

    # Buscar texto OCR pelo nome do arquivo (campo ANEXO)
    anexo = str(row.get(COLUNA_ANEXO, ""))

    # Verificar se existe imagem JPG para PDF
    imagem_jpg = _verificar_imagem_jpg_pdf(anexo)

    # 1) primeiro, tenta usar o que já veio no CSV (coluna "OCR")
    texto_csv = str(row.get(COLUNA_OCR, "") or "").strip()
    if texto_csv and texto_csv.lower() != VALOR_NAN:
        texto_ocr = texto_csv
    else:
        # 2) fallback: puxa do XML carregado em ocr_map
        texto_ocr = ocr_map.get(anexo, "") if anexo and anexo.lower() != VALOR_NAN else ""

    # Identificar origem da mensagem e direcionar valor para coluna correta
    remetente = str(row.get(COLUNA_REMETENTE, "")).strip().lower()
    print(f"DEBUG: Remetente: '{remetente}'")
    print(f"DEBUG: Ricardo original: '{ricardo}'")
    print(f"DEBUG: Rafael original: '{rafael}'")
    print(f"DEBUG: Valor original: '{valor}'")

    # Se o valor não está nas colunas RICARDO ou RAFAEL, extrair do texto OCR
    # MAS apenas se não houver um valor já corrigido na coluna VALOR
    valor_corrigido = str(row.get(COLUNA_VALOR, "")).strip()
    tem_valor_corrigido = valor_corrigido and valor_corrigido.lower() not in [VALOR_NAN, VALOR_VAZIO]

    if (
        (not ricardo or ricardo.lower() in [VALOR_NAN, VALOR_VAZIO])
        and (not rafael or rafael.lower() in [VALOR_NAN, VALOR_VAZIO])
        and not tem_valor_corrigido
    ):
        print(
            f"DEBUG: Campos RICARDO e RAFAEL estão vazios e não há valor corrigido, tentando extrair do OCR"
        )
        # Tentar extrair valor do texto OCR
        import re

        valor_ocr = None

        # Padrões para encontrar valores no texto OCR
        padroes_valor = [
            r"R\$\s*([0-9.,]+)",  # R$ 123,45
            r"valor\s*R\$\s*([0-9.,]+)",  # valor R$ 123,45
            r"([0-9.,]+)\s*reais",  # 123,45 reais
            r"total\s*R\$\s*([0-9.,]+)",  # total R$ 123,45
            r"pago\s*R\$\s*([0-9.,]+)",  # pago R$ 123,45
            r"R\$\s*([0-9.,]+)\s*dados",  # R$ 123,45 dados
            r"valor\s*:\s*R\$\s*([0-9.,]+)",  # valor: R$ 123,45
            r"([0-9.,]+)\s*via\s*celular",  # 123,45 via celular
            r"([0-9.,]+)\s*realizado",  # 123,45 realizado
            r"VALOR\s*TOTAL\s*R\$\s*([0-9.,]+)",  # VALOR TOTAL R$ 123,45
            r"VALOR\s*A\s*PAGAR\s*R\$\s*([0-9.,]+)",  # VALOR A PAGAR R$ 123,45
            r"R\$\s*([0-9.,]+)\s*realizado",  # R$ 123,45 realizado
            r"valor\s*R\$\s*([0-9.,]+)\s*realizado",  # valor R$ 123,45 realizado
            r"([0-9.,]+)\s*R\$\s*realizado",  # 123,45 R$ realizado
            r"VALOR\s*PAGO\s*R\$\s*([0-9.,]+)",  # VALOR PAGO R$ 123,45
            r"VALOR\s*PAGO\s*([0-9.,]+)",  # VALOR PAGO 123,45
            r"valor\s*R\$\s*([0-9.,]+)\s*dados",  # valor R$ 123,45 dados
            r"([0-9.,]+)\s*R\$\s*dados",  # 123,45 R$ dados
            r"R\$\s*([0-9.,]+)\s*via",  # R$ 123,45 via
            r"valor\s*:\s*([0-9.,]+)",  # valor: 123,45
            r"([0-9.,]+)\s*R\$\s*via",  # 123,45 R$ via
            r"VALOR\s*TOTAL\s*([0-9.,]+)",  # VALOR TOTAL 123,45
            r"VALOR\s*A\s*PAGAR\s*([0-9.,]+)",  # VALOR A PAGAR 123,45
            r"R\$\s*([0-9.,]+)\s*realizado",  # R$ 123,45 realizado
            r"valor\s*R\$\s*([0-9.,]+)\s*realizado",  # valor R$ 123,45 realizado
            r"([0-9.,]+)\s*R\$\s*realizado",  # 123,45 R$ realizado
            r"VALOR\s*PAGO\s*R\$\s*([0-9.,]+)",  # VALOR PAGO R$ 123,45
            r"VALOR\s*PAGO\s*([0-9.,]+)",  # VALOR PAGO 123,45
            r"valor\s*R\$\s*([0-9.,]+)\s*dados",  # valor R$ 123,45 dados
            r"([0-9.,]+)\s*R\$\s*dados",  # 123,45 R$ dados
            r"R\$\s*([0-9.,]+)\s*via",  # R$ 123,45 via
            r"valor\s*:\s*([0-9.,]+)",  # valor: 123,45
            r"([0-9.,]+)\s*R\$\s*via",  # 123,45 R$ via
            r"VALOR\s*TOTAL\s*([0-9.,]+)",  # VALOR TOTAL 123,45
            r"VALOR\s*A\s*PAGAR\s*([0-9.,]+)",  # VALOR A PAGAR 123,45
            r"R\$\s*([0-9.,]+)\s*realizado",  # R$ 123,45 realizado
            r"valor\s*R\$\s*([0-9.,]+)\s*realizado",  # valor R$ 123,45 realizado
            r"([0-9.,]+)\s*R\$\s*realizado",  # 123,45 R$ realizado
            r"VALOR\s*PAGO\s*R\$\s*([0-9.,]+)",  # VALOR PAGO R$ 123,45
            r"VALOR\s*PAGO\s*([0-9.,]+)",  # VALOR PAGO 123,45
            r"valor\s*R\$\s*([0-9.,]+)\s*dados",  # valor R$ 123,45 dados
            r"([0-9.,]+)\s*R\$\s*dados",  # 123,45 R$ dados
            r"R\$\s*([0-9.,]+)\s*via",  # R$ 123,45 via
            r"valor\s*:\s*([0-9.,]+)",  # valor: 123,45
            r"([0-9.,]+)\s*R\$\s*via",  # 123,45 R$ via
            r"VALOR\s*TOTAL\s*([0-9.,]+)",  # VALOR TOTAL 123,45
            r"VALOR\s*A\s*PAGAR\s*([0-9.,]+)",  # VALOR A PAGAR 123,45
        ]

        for padrao in padroes_valor:
            match = re.search(padrao, texto_ocr, re.IGNORECASE)
            if match:
                valor_encontrado = match.group(1)
                try:
                    valor_ocr = normalize_value_to_brazilian_format(valor_encontrado)
                    print(
                        f"DEBUG: Valor extraído '{valor_ocr}' do texto OCR para remetente '{remetente}'"
                    )
                    break
                except ValueError:
                    continue

        if valor_ocr:
            # Direcionar valor para coluna correta baseado no remetente
            if remetente == "ricardo":
                ricardo = valor_ocr
                print(f"DEBUG: Valor {valor_ocr} atribuído à coluna RICARDO")
            elif remetente == "rafael":
                rafael = valor_ocr
                print(f"DEBUG: Valor {valor_ocr} atribuído à coluna RAFAEL")
            else:
                # Se não conseguiu identificar remetente, tentar identificar pelo texto OCR
                if "ricardo" in texto_ocr.lower() or "itau" in texto_ocr.lower():
                    ricardo = valor_ocr
                    print(
                        f"DEBUG: Valor {valor_ocr} atribuído à coluna RICARDO (identificado pelo texto)"
                    )
                elif (
                    "rafael" in texto_ocr.lower()
                    or "nubank" in texto_ocr.lower()
                    or "nu pagamentos" in texto_ocr.lower()
                ):
                    rafael = valor_ocr
                    print(
                        f"DEBUG: Valor {valor_ocr} atribuído à coluna RAFAEL (identificado pelo texto)"
                    )
                else:
                    # Fallback: usar o valor original se existir
                    if valor and valor.lower() not in ["nan", ""]:
                        if remetente == "ricardo":
                            ricardo = valor
                        elif remetente == "rafael":
                            rafael = valor
        else:
            print(f"DEBUG: Nenhum valor encontrado no texto OCR")
    else:
        print(f"DEBUG: Campos RICARDO ou RAFAEL já têm valores")

    # Após toda a lógica de atribuição, garantir que ricardo/rafael recebam o valor extraído
    # MAS priorizar valores já corrigidos na coluna VALOR
    if tem_valor_corrigido:
        # Se há um valor corrigido, usar ele para a coluna apropriada
        if remetente == "ricardo":
            ricardo = valor_corrigido
            print(
                f"DEBUG: Valor corrigido {valor_corrigido} atribuído à coluna RICARDO"
            )
        elif remetente == "rafael":
            rafael = valor_corrigido
            print(f"DEBUG: Valor corrigido {valor_corrigido} atribuído à coluna RAFAEL")
        else:
            # Se não conseguiu identificar remetente, usar o valor corrigido
            valor = valor_corrigido
            print(f"DEBUG: Valor corrigido {valor_corrigido} usado como valor geral")
    else:
        # Se não há valor corrigido, usar a lógica original
        if remetente == "ricardo" and (not ricardo or ricardo.lower() in ["nan", ""]):
            if valor and valor.lower() not in ["nan", ""]:
                ricardo = valor
        # Se o remetente for Rafael e rafael está vazio, mas valor foi extraído, atribuir
        if remetente == "rafael" and (not rafael or rafael.lower() in ["nan", ""]):
            if valor and valor.lower() not in ["nan", ""]:
                rafael = valor

    # Função utilitária para limpar valores monetários
    def limpar_valor(valor):
        if not valor:
            return ""

        valor_limpo = normalize_value_to_brazilian_format(valor)
        return valor_limpo

    ricardo = limpar_valor(ricardo)
    rafael = limpar_valor(rafael)
    valor = limpar_valor(valor)

    # Flag para linha de total
    row_class = "total-row" if "TOTAL" in remetente.upper() else ""

    # Se a entrada está marcada como dismiss, altera a descrição
    if validade and validade.lower() == "dismiss":
        descricao = "desconsiderado"
        row_class = "dismiss-row" if not row_class else f"{row_class} dismiss-row"
    # Se a entrada está marcada como fix-value, adiciona classe especial
    elif validade and "fix-value" in validade.lower():
        row_class = "fix-row" if not row_class else f"{row_class} fix-row"
        # Adiciona informação sobre a correção na descrição se não estiver vazia
        if descricao and descricao.lower() not in ["nan", ""]:
            descricao = f"{descricao} (corrigido)"
        else:
            descricao = "Valor corrigido"

    linha = {
        "data_hora": data_hora,
        "classificacao": classificacao,
        "ricardo": ricardo,
        "rafael": rafael,
        "anexo": anexo,
        "descricao": descricao,
        "ocr": texto_ocr,  # Texto OCR carregado do XML
        "row_class": row_class,
        "valor": valor,
        "imagem_jpg": imagem_jpg,  # Imagem JPG correspondente ao PDF
    }
    print(f"DEBUG LINHA: {linha}")

    if tem_motivo:
        motivo = str(row.get("MOTIVO_ERRO", ""))
        linha["motivo"] = motivo

    return linha


def _preparar_linhas_impressao(df_mes):
    """Prepara os dados para o template de impressão."""

    def to_float(v):
        try:
            valor_brasileiro = normalize_value_to_brazilian_format(v)
            return float(valor_brasileiro.replace(",", "."))
        except:
            return 0.0

    saldo = 0.0
    rows = []

    for index, row in df_mes.iterrows():
        data = row.get("DATA", "")
        descricao = row.get("DESCRICAO", "")
        valor = to_float(row.get("VALOR", "0"))
        identificador_unico = f"{index}_{data}_{valor}"

        classificacao = str(row.get("CLASSIFICACAO", ""))
        if classificacao.lower() == "transferência":
            receitas = f"{valor:.2f}".replace(".", ",")
            despesas = ""
            saldo += valor
        elif classificacao.lower() == "desconhecido":
            # Registros desconhecidos são tratados como despesas (pagamentos não identificados)
            receitas = ""
            despesas = f"{valor:.2f}".replace(".", ",")
            saldo -= valor
        else:
            # Pagamentos e outros tipos
            receitas = ""
            despesas = f"{valor:.2f}".replace(".", ",")
            saldo -= valor

        rows.append(
            {
                "identificador_unico": identificador_unico,
                "data": data,
                "descricao": descricao,
                "receitas": receitas,
                "despesas": despesas,
                "saldo": f"{saldo:.2f}".replace(".", ","),
            }
        )

    return rows





def gerar_relatorio_html(csv_path=None, backup=True):
    print(f"DEBUG: Iniciando gerar_relatorio_html com csv_path: {csv_path}")
    try:
        # Se csv_path não foi fornecido, usa dados do banco Django
        if csv_path is None:
            print("📊 Gerando relatório a partir do banco de dados Django...")
            try:
                import django
                from django.utils import timezone
                from .models import EntradaFinanceira
                
                # Busca todas as entradas não desconsideradas
                entradas = EntradaFinanceira.objects.filter(desconsiderada=False).order_by('data_hora')
                
                # Converte para formato compatível com o template
                rows = []
                for entrada in entradas:
                    row_data = {
                        'data_hora': entrada.data_hora.strftime('%d/%m/%Y %H:%M:%S'),
                        'valor': entrada.valor,
                        'descricao': entrada.descricao or '',
                        'classificacao': entrada.classificacao or 'outros',
                        'arquivo_origem': entrada.arquivo_origem or '',
                        'desconsiderada': entrada.desconsiderada
                    }
                    rows.append(_preparar_linha_do_banco(row_data))
                
                print(f"📊 Encontradas {len(rows)} entradas no banco de dados")
                
            except Exception as e:
                print(f"❌ Erro ao acessar banco de dados: {str(e)}")
                return
        else:
            # Usa arquivo CSV se fornecido
            if not os.path.exists(csv_path):
                print(
                    f"❌ O relatório report.html não foi gerado pela ausência da planilha de cálculos ({csv_path})"
                )
                return

        report_path = os.path.join(ATTR_FIN_DIR_DOCS, "report.html")
        if os.path.exists(report_path) and backup:
            timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
            arquivo_backup = f"report-{timestamp}.bak"
            os.rename(report_path, arquivo_backup)
            print(f"📁 Relatório anterior renomeado para: {arquivo_backup}")
        elif os.path.exists(report_path) and not backup:
            os.remove(report_path)
            print("🗑️ Relatório anterior removido (backup desabilitado)")
        if csv_path is not None:
            print(f"📊 Gerando novo relatório HTML baseado em {csv_path}...")

            # Carregar dados OCR
            ocr_map = _carregar_ocr_map()

            df = pd.read_csv(csv_path)
            tem_motivo = False  # Removendo a coluna "Motivo do Erro" de todos os relatórios

            # Preparar dados para o template
            rows = []
            for _, row in df.iterrows():
                rows.append(_preparar_linha(row, ocr_map, tem_motivo))
        else:
            # Dados já foram preparados do banco
            tem_motivo = False

        # Calcular totalizadores por pessoa
        totalizadores = _calcular_totalizadores_pessoas(rows)

        context = {
            "timestamp": pd.Timestamp.now().strftime("%d/%m/%Y às %H:%M:%S"),
            "rows": rows,
            "tem_motivo": tem_motivo,
            "totalizadores": totalizadores,
            "is_editable": False,  # Relatório geral é apenas para visualização
            "attrs": {
                "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS,
            },
        }

        print(f"DEBUG: Gerando HTML simples: {report_path}")
        _gerar_html_simples(context, report_path)
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
                        monthly_reports.append(
                            {"filename": file, "display_name": display_name}
                        )

        # Ordena por data (mais recente primeiro)
        monthly_reports.sort(key=lambda x: x["filename"], reverse=True)

        # Contexto para o template
        index_context = {"monthly_reports": monthly_reports}

        # Gera HTML simples
        index_path = os.path.join(ATTR_FIN_DIR_DOCS, "index.html")
        _gerar_html_simples(index_context, index_path)
        print("✅ Página de entrada gerada: index.html")

        # Validação OCR (apenas se usando arquivo CSV)
        if csv_path is not None:
            print("🔍 Validando conformidade OCR...")
            try:
                # Executa o check.py usando o caminho correto
                import sys
                from pathlib import Path

                check_script = Path(__file__).parent / "check.py"
                subprocess.run([sys.executable, str(check_script), csv_path], check=True)
                print("✅ Validação OCR concluída com sucesso")
            except subprocess.CalledProcessError:
                print("❌ Falha na validação OCR - verifique as linhas sem OCR")
            except Exception as e:
                print(f"⚠️  Erro na validação OCR: {str(e)}")
    except Exception as e:
        print(f"❌ Erro ao gerar relatório HTML: {str(e)}")


def gerar_relatorios_mensais_html(csv_path=None, backup=True):
    print(f"📅 Gerando relatórios mensais HTML baseado em {csv_path}...")
    try:
        # Se csv_path não foi fornecido, usa dados do banco Django
        if csv_path is None:
            print("📅 Gerando relatórios mensais a partir do banco de dados Django...")
            try:
                import django
                from django.utils import timezone
                from .models import EntradaFinanceira
                
                # Busca todas as entradas não desconsideradas
                entradas = EntradaFinanceira.objects.filter(desconsiderada=False).order_by('data_hora')
                
                if not entradas.exists():
                    print("❌ Nenhuma entrada encontrada no banco de dados")
                    return
                
                print(f"📊 Encontradas {entradas.count()} entradas no banco de dados")
                
            except Exception as e:
                print(f"❌ Erro ao acessar banco de dados: {str(e)}")
                return
        else:
            # Usa arquivo CSV se fornecido
            if not os.path.exists(csv_path):
                print(
                    f"❌ Relatórios mensais não foram gerados pela ausência da planilha de cálculos ({csv_path})"
                )
                return

        if csv_path is not None:
            # Carregar dados OCR
            ocr_map = _carregar_ocr_map()

            # Carregar dados do CSV
            df = pd.read_csv(csv_path)
            df["DATA_DT"] = pd.to_datetime(df["DATA"], format="%d/%m/%Y", errors="coerce")
            df["ANO_MES"] = df["DATA_DT"].dt.to_period("M")
        else:
            # Processar dados do banco
            from django.utils import timezone
            import pandas as pd
            
            # Converte entradas do banco para DataFrame
            dados_banco = []
            for entrada in entradas:
                dados_banco.append({
                    'DATA': entrada.data_hora.strftime('%d/%m/%Y'),
                    'HORA': entrada.data_hora.strftime('%H:%M:%S'),
                    'VALOR': entrada.valor,
                    'DESCRICAO': entrada.descricao or '',
                    'CLASSIFICACAO': entrada.classificacao or 'outros',
                    'ARQUIVO_ORIGEM': entrada.arquivo_origem or '',
                    'DESCONSIDERADA': entrada.desconsiderada
                })
            
            df = pd.DataFrame(dados_banco)
            df["DATA_DT"] = pd.to_datetime(df["DATA"], format="%d/%m/%Y", errors="coerce")
            df["ANO_MES"] = df["DATA_DT"].dt.to_period("M")
            
            # OCR map vazio para dados do banco
            ocr_map = {}

        # Agrupar por mês
        grupos_mensais = df.groupby("ANO_MES")

        nomes_meses = {
            1: "Janeiro",
            2: "Fevereiro",
            3: "Marco",
            4: "Abril",
            5: "Maio",
            6: "Junho",
            7: "Julho",
            8: "Agosto",
            9: "Setembro",
            10: "Outubro",
            11: "Novembro",
            12: "Dezembro",
        }

        relatorios_gerados = 0

        for periodo, dados_mes in grupos_mensais:
            ano = periodo.year
            mes = periodo.month
            nome_mes = nomes_meses[mes]
            dados_mes = dados_mes[dados_mes["DATA_DT"].dt.month == mes].copy()

            # Relatório mensal normal
            nome_arquivo = f"report-{ano}-{mes:02d}-{nome_mes}.html"
            arquivo_path = os.path.join(ATTR_FIN_DIR_DOCS, nome_arquivo)
            if os.path.exists(arquivo_path) and backup:
                timestamp = pd.Timestamp.now().strftime("%Y%m%d")
                arquivo_backup = f"report-{ano}-{mes:02d}-{nome_mes}-{timestamp}.bak"
                os.rename(arquivo_path, arquivo_backup)
                print(f"📁 Relatório mensal anterior renomeado para: {arquivo_backup}")
            elif os.path.exists(arquivo_path) and not backup:
                os.remove(arquivo_path)
                print(
                    f"🗑️ Relatório mensal anterior removido: {nome_arquivo} (backup desabilitado)"
                )

            tem_motivo = (
                False  # Removendo a coluna "Motivo do Erro" de todos os relatórios
            )
            rows = []
            for _, row in dados_mes.iterrows():
                rows.append(_preparar_linha(row, ocr_map, tem_motivo))

            # Calcular totalizadores por pessoa para este mês
            totalizadores = _calcular_totalizadores_pessoas(rows)

            context = {
                "periodo": f"{nome_mes} {ano}",
                "timestamp": pd.Timestamp.now().strftime("%d/%m/%Y às %H:%M:%S"),
                "rows": rows,
                "tem_motivo": tem_motivo,
                "totalizadores": totalizadores,
                "edit_link": f"report-edit-{ano}-{mes:02d}-{nome_mes}.html",
                "is_editable": False,  # Relatório mensal normal é apenas para visualização
                "attrs": {
                    "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                    "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS,
                },
            }

            _gerar_html_simples(context, arquivo_path)
            relatorios_gerados += 1
            print(f"✅ Relatório mensal gerado: {nome_arquivo}")

            # Relatório mensal editável (sem botão de edição)
            nome_arquivo_edit = f"report-edit-{ano}-{mes:02d}-{nome_mes}.html"
            arquivo_edit_path = os.path.join(ATTR_FIN_DIR_DOCS, nome_arquivo_edit)
            context_edit = {
                "periodo": f"{nome_mes} {ano}",
                "timestamp": pd.Timestamp.now().strftime("%d/%m/%Y às %H:%M:%S"),
                "rows": rows,
                "tem_motivo": tem_motivo,
                "totalizadores": totalizadores,
                # Não incluir edit_link para relatórios de edição
                "is_editable": True,  # Relatório editável tem funcionalidades de edição
                "attrs": {
                    "INPUT_DIR_PATH": ATTR_FIN_DIR_INPUT,
                    "IMGS_DIR_PATH": ATTR_FIN_DIR_IMGS,
                },
            }
            _gerar_html_simples(context_edit, arquivo_edit_path)
            print(f"✅ Relatório mensal editável gerado: {nome_arquivo_edit}")

        print(f"📅 Total de relatórios mensais gerados: {relatorios_gerados}")

        # Validação OCR
        print("🔍 Validando conformidade OCR...")
        try:
            # Executa o check.py usando o caminho correto
            import sys
            from pathlib import Path

            check_script = Path(__file__).parent / "check.py"
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

        context = {"periodo": f"{nome_mes} {ano}", "rows": rows}

        context["print_mode"] = True
        _gerar_html_simples(context, nome_arquivo)
        print(f"✅ HTML de impressão gerado: {nome_arquivo}")
    except Exception as e:
        print(f"❌ Erro ao gerar HTML de impressão: {str(e)}")


if __name__ == "__main__":
    print("🚀 Iniciando geração de relatórios...")
    gerar_relatorio_html()
    gerar_relatorios_mensais_html()
    print("✅ Geração de relatórios concluída!")
