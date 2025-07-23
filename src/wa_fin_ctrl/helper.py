# helper.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/helper.py
# Funções auxiliares para processamento de dados

import os
import re
import pandas as pd
import shutil
from .env import *
from datetime import datetime
import calendar


def normalize_value_to_brazilian_format(valor):
    """
    Converte qualquer formato de valor para o formato brasileiro (vírgula como decimal).
    Esta é a função principal para padronizar valores no sistema.

    Args:
        valor: Valor em qualquer formato (string, float, int)

    Returns:
        str: Valor no formato brasileiro (ex: "9,99", "1234,56")
    """
    if not valor:
        return ""

    valor_str = str(valor).strip()

    # Remove símbolos de moeda e espaços
    valor_str = re.sub(r"[R$\s]", "", valor_str)

    # Se já é um número válido sem vírgula nem ponto, retorna como está
    if valor_str.replace(".", "").isdigit():
        try:
            float_valor = float(valor_str)
            return f"{float_valor:.2f}".replace(".", ",")
        except ValueError:
            return valor_str

    # Se tem vírgula e ponto, assume que vírgula é decimal e ponto é milhares
    if "," in valor_str and "." in valor_str:
        # Remove pontos (milhares) e substitui vírgula por ponto (decimal)
        valor_limpo = valor_str.replace(".", "").replace(",", ".")
        try:
            float_valor = float(valor_limpo)
            return f"{float_valor:.2f}".replace(".", ",")
        except ValueError:
            return valor_str

    # Se só tem vírgula, assume que é decimal
    if "," in valor_str and "." not in valor_str:
        valor_limpo = valor_str.replace(",", ".")
        try:
            float_valor = float(valor_limpo)
            return f"{float_valor:.2f}".replace(".", ",")
        except ValueError:
            return valor_str

    # Se só tem ponto, verifica se é decimal ou milhares
    if "." in valor_str and "," not in valor_str:
        partes = valor_str.split(".")
        if len(partes) == 2:
            # Se a parte decimal tem 1 ou 2 dígitos, é provavelmente decimal
            if len(partes[1]) <= 2:
                try:
                    float_valor = float(valor_str)
                    return f"{float_valor:.2f}".replace(".", ",")
                except ValueError:
                    return valor_str
            # Se tem 3 dígitos decimais, pode ser milhares
            elif len(partes[1]) == 3:
                try:
                    float_valor = float(valor_str)
                    # Se o valor é menor que 1000, provavelmente é decimal
                    if float_valor < 1000:
                        return f"{float_valor:.2f}".replace(".", ",")
                    else:
                        # É milhares, converte para decimal
                        return f"{float_valor:.2f}".replace(".", ",")
                except ValueError:
                    return valor_str
            else:
                # Mais de 3 dígitos decimais, provavelmente milhares
                try:
                    float_valor = float(valor_str)
                    return f"{float_valor:.2f}".replace(".", ",")
                except ValueError:
                    return valor_str

    # Se não tem ponto nem vírgula, tenta converter para float
    try:
        float_valor = float(valor_str)
        return f"{float_valor:.2f}".replace(".", ",")
    except ValueError:
        return valor_str


def normalize_value_to_american_format(valor):
    """
    Converte qualquer formato de valor para o formato americano (ponto como decimal).
    Esta função está DEPRECATED - use normalize_value_to_brazilian_format em seu lugar.

    Args:
        valor: Valor em qualquer formato (string, float, int)

    Returns:
        str: Valor no formato americano (ex: "9.99", "1234.56")
    """
    if not valor:
        return ""

    valor_str = str(valor).strip()

    # Remove símbolos de moeda e espaços
    valor_str = re.sub(r"[R$\s]", "", valor_str)

    # Se já é um número válido sem vírgula nem ponto, retorna como está
    if valor_str.replace(".", "").isdigit():
        return valor_str

    # Se tem vírgula e ponto, assume que vírgula é decimal e ponto é milhares
    if "," in valor_str and "." in valor_str:
        # Remove pontos (milhares) e substitui vírgula por ponto (decimal)
        valor_limpo = valor_str.replace(".", "").replace(",", ".")
        try:
            float_valor = float(valor_limpo)
            return f"{float_valor:.2f}"
        except ValueError:
            return valor_str

    # Se só tem vírgula, assume que é decimal
    if "," in valor_str and "." not in valor_str:
        valor_limpo = valor_str.replace(",", ".")
        try:
            float_valor = float(valor_limpo)
            return f"{float_valor:.2f}"
        except ValueError:
            return valor_str

    # Se só tem ponto, verifica se é decimal ou milhares
    if "." in valor_str and "," not in valor_str:
        partes = valor_str.split(".")
        if len(partes) == 2:
            # Se a parte decimal tem 1 ou 2 dígitos, é provavelmente decimal
            if len(partes[1]) <= 2:
                try:
                    float_valor = float(valor_str)
                    return f"{float_valor:.2f}"
                except ValueError:
                    return valor_str
            # Se tem 3 dígitos decimais, pode ser milhares
            elif len(partes[1]) == 3:
                try:
                    float_valor = float(valor_str)
                    # Se o valor é menor que 1000, provavelmente é decimal
                    if float_valor < 1000:
                        return f"{float_valor:.2f}"
                    else:
                        # É milhares, mantém como está
                        return valor_str
                except ValueError:
                    return valor_str
            else:
                # Mais de 3 dígitos decimais, provavelmente milhares
                return valor_str

    # Se não tem ponto nem vírgula, tenta converter para float
    try:
        float_valor = float(valor_str)
        return f"{float_valor:.2f}"
    except ValueError:
        return valor_str


def convert_to_brazilian_format(valor):
    """
    Converte valor do formato americano para brasileiro para exibição.
    Esta função é usada apenas para formatação de exibição, não para armazenamento.

    Args:
        valor: Valor no formato americano (ex: "9.99", "1234.56")

    Returns:
        str: Valor no formato brasileiro (ex: "9,99", "1.234,56")
    """
    if not valor:
        return valor

    # Primeiro normaliza para formato brasileiro
    valor_brasileiro = normalize_value_to_brazilian_format(valor)

    if not valor_brasileiro:
        return valor

    try:
        # Converte de volta para float para formatação
        valor_float = float(valor_brasileiro.replace(",", "."))

        # Formata para 2 casas decimais
        valor_formatado = f"{valor_float:.2f}"

        # Converte para formato brasileiro com pontos de milhares
        partes = valor_formatado.split(".")
        inteira = partes[0]
        decimal = partes[1]

        # Adiciona pontos de milhares na parte inteira
        if len(inteira) > 3:
            inteira_formatada = ""
            for i, digito in enumerate(inteira[::-1]):
                if i > 0 and i % 3 == 0:
                    inteira_formatada = "." + inteira_formatada
                inteira_formatada = digito + inteira_formatada
            return f"{inteira_formatada},{decimal}"
        else:
            return f"{inteira},{decimal}"

    except (ValueError, IndexError):
        return valor


def parse_value_from_input(valor_input):
    """
    Converte valor de entrada do usuário para formato brasileiro padronizado.
    Usado quando o usuário digita valores no frontend.

    Args:
        valor_input: Valor digitado pelo usuário (pode ser "9.99", "9,99", "999", etc.)

    Returns:
        str: Valor no formato brasileiro para armazenamento
    """
    if not valor_input:
        return ""

    valor_str = str(valor_input).strip()

    # Remove símbolos de moeda e espaços
    valor_str = re.sub(r"[R$\s]", "", valor_str)

    # Se tem vírgula, assume formato brasileiro
    if "," in valor_str:
        # Remove pontos (milhares) e substitui vírgula por ponto
        valor_limpo = valor_str.replace(".", "").replace(",", ".")
        try:
            float_valor = float(valor_limpo)
            return f"{float_valor:.2f}".replace(".", ",")
        except ValueError:
            return valor_str

    # Se só tem ponto, pode ser formato americano
    if "." in valor_str:
        try:
            float_valor = float(valor_str)
            return f"{float_valor:.2f}".replace(".", ",")
        except ValueError:
            return valor_str

    # Se não tem ponto nem vírgula, assume que é um número inteiro
    try:
        float_valor = float(valor_str)
        return f"{float_valor:.2f}".replace(".", ",")
    except ValueError:
        return valor_str


def normalize_sender(remetente):
    if not remetente or pd.isna(remetente):
        return ""
    remetente_str = str(remetente).strip()
    if "Ricardo" in remetente_str:
        return "Ricardo"
    elif "Rafael" in remetente_str:
        return "Rafael"
    else:
        return remetente_str


def adicionar_totalizacao_mensal(df):
    def convert_to_float(value):
        if pd.isna(value) or value == "":
            return 0.0
        try:
            valor_brasileiro = normalize_value_to_brazilian_format(value)
            return float(valor_brasileiro.replace(",", "."))
        except:
            return 0.0

    df["DATA_DT"] = pd.to_datetime(df["DATA"], format="%d/%m/%Y", errors="coerce")
    df_sem_totais = df[df["REMETENTE"] != "TOTAL MÊS"].copy()
    df_sem_totais = df_sem_totais.sort_values("DATA_DT").reset_index(drop=True)
    linhas_totalizacao = []
    df_sem_totais["MES_ANO"] = df_sem_totais["DATA_DT"].dt.to_period("M")
    meses_unicos = df_sem_totais["MES_ANO"].dropna().unique()
    for mes_periodo in sorted(meses_unicos):
        dados_mes = df_sem_totais[df_sem_totais["MES_ANO"] == mes_periodo]
        total_ricardo = dados_mes["RICARDO"].apply(convert_to_float).sum()
        total_rafael = dados_mes["RAFAEL"].apply(convert_to_float).sum()
        if total_ricardo > 0 or total_rafael > 0:
            ano = mes_periodo.year
            mes = mes_periodo.month
            ultimo_dia = calendar.monthrange(ano, mes)[1]
            linha_total = {
                "DATA": f"{ultimo_dia:02d}/{mes:02d}/{ano}",
                "HORA": "23:59:00",
                "REMETENTE": "TOTAL MÊS",
                "CLASSIFICACAO": "TOTAL",
                "RICARDO": f"{total_ricardo:.2f}" if total_ricardo > 0 else "",
                "RAFAEL": f"{total_rafael:.2f}" if total_rafael > 0 else "",
                "ANEXO": f"TOTAL_{mes:02d}_{ano}",
                "DESCRICAO": f"Total do mês {mes:02d}/{ano}",
                "VALOR": "",
                "OCR": "",
                "VALIDADE": "",
                "DATA_DT": datetime(ano, mes, ultimo_dia, 23, 59),
                "MES_ANO": mes_periodo,
            }
            linhas_totalizacao.append(linha_total)
    if linhas_totalizacao:
        df_totalizacao = pd.DataFrame(linhas_totalizacao)
        df_combinado = pd.concat([df_sem_totais, df_totalizacao], ignore_index=True)
        df_combinado = df_combinado.sort_values(["DATA_DT", "HORA"]).reset_index(
            drop=True
        )
    else:
        df_combinado = df_sem_totais
    df_combinado = df_combinado.drop(columns=["DATA_DT", "MES_ANO"])
    print(f"Adicionadas {len(linhas_totalizacao)} linhas de totalização mensal")
    return df_combinado


def incrementar_csv(novo_df, arquivo_csv):
    if os.path.exists(arquivo_csv):
        df_existente = pd.read_csv(arquivo_csv)
        eh_csv_anexos = "VALOR" in novo_df.columns and "DESCRICAO" in novo_df.columns
        if eh_csv_anexos:
            novos_registros = novo_df.copy()
        else:
            if "OCR" in novo_df.columns:
                mascara_novos = (
                    novo_df["OCR"].notna()
                    & (novo_df["OCR"] != "")
                    & (novo_df["OCR"] != "Já processado anteriormente")
                )
                novos_registros = novo_df[mascara_novos].copy()
            else:
                novos_registros = novo_df.copy()

        # Adiciona coluna VALIDADE se não existir no CSV existente
        if "VALIDADE" not in df_existente.columns:
            df_existente["VALIDADE"] = ""
            print(f"➕ Coluna VALIDADE adicionada ao CSV existente")
        if len(novos_registros) > 0:
            df_combinado = pd.concat([df_existente, novos_registros], ignore_index=True)
            print(
                f"CSV {arquivo_csv} incrementado: {len(df_existente)} + {len(novos_registros)} = {len(df_combinado)} registros"
            )
        else:
            df_combinado = df_existente
            print(
                f"CSV {arquivo_csv} mantido inalterado - nenhum registro novo encontrado"
            )
    else:
        df_combinado = novo_df
        print(f"CSV {arquivo_csv} criado com {len(novo_df)} registros")
    df_combinado.to_csv(arquivo_csv, index=False, quoting=1)
    return df_combinado


def mover_arquivos_processados():
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS
    os.makedirs(imgs_dir, exist_ok=True)
    extensoes_imagem = (".jpg", ".jpeg", ".png", ".pdf")
    arquivos_input = [
        f for f in os.listdir(input_dir) if f.lower().endswith(extensoes_imagem)
    ]
    arquivos_movidos = 0
    for arquivo in arquivos_input:
        origem = os.path.join(input_dir, arquivo)
        destino = os.path.join(imgs_dir, arquivo)
        shutil.move(origem, destino)
        arquivos_movidos += 1
        print(f"Movido: {arquivo} -> {ATTR_FIN_DIR_IMGS}/")
    if arquivos_movidos > 0:
        print(f"Total de {arquivos_movidos} arquivos movidos para {ATTR_FIN_DIR_IMGS}/")
    return arquivos_movidos
