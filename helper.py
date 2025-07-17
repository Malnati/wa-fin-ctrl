import re
import os
import pandas as pd
import shutil

# === CONSTANTES DE DIRETÓRIOS E ARQUIVOS ===
DIR_INPUT = "input"
DIR_IMGS = "imgs"
ARQ_CALCULO = "calculo.csv"
ARQ_MENSAGENS = "mensagens.csv"

def convert_to_brazilian_format(valor):
    """Converte valor do formato americano para brasileiro se necessário"""
    if not valor or not re.match(r'^\d+([.,]\d+)?$', valor):
        return valor
    if '.' in valor and ',' not in valor:
        partes = valor.split('.')
        if len(partes) == 2:
            if len(partes[1]) == 2:
                inteira = partes[0]
                decimal = partes[1]
                if len(inteira) > 3:
                    inteira_formatada = ""
                    for i, digito in enumerate(inteira[::-1]):
                        if i > 0 and i % 3 == 0:
                            inteira_formatada = "." + inteira_formatada
                        inteira_formatada = digito + inteira_formatada
                    return f"{inteira_formatada},{decimal}"
                else:
                    return f"{inteira},{decimal}"
            elif len(partes[1]) == 3:
                return valor
    if ',' in valor:
        return valor
    return valor

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
    from datetime import datetime
    import calendar
    def convert_to_float(value):
        if pd.isna(value) or value == '':
            return 0.0
        try:
            return float(str(value).replace(',', '.'))
        except:
            return 0.0
    df['DATA_DT'] = pd.to_datetime(df['DATA'], format='%d/%m/%Y', errors='coerce')
    df_sem_totais = df[df['REMETENTE'] != 'TOTAL MÊS'].copy()
    df_sem_totais = df_sem_totais.sort_values('DATA_DT').reset_index(drop=True)
    linhas_totalizacao = []
    df_sem_totais['MES_ANO'] = df_sem_totais['DATA_DT'].dt.to_period('M')
    meses_unicos = df_sem_totais['MES_ANO'].dropna().unique()
    for mes_periodo in sorted(meses_unicos):
        dados_mes = df_sem_totais[df_sem_totais['MES_ANO'] == mes_periodo]
        total_ricardo = dados_mes['RICARDO'].apply(convert_to_float).sum()
        total_rafael = dados_mes['RAFAEL'].apply(convert_to_float).sum()
        if total_ricardo > 0 or total_rafael > 0:
            ano = mes_periodo.year
            mes = mes_periodo.month
            ultimo_dia = calendar.monthrange(ano, mes)[1]
            linha_total = {
                'DATA': f'{ultimo_dia:02d}/{mes:02d}/{ano}',
                'HORA': '23:59:00',
                'REMETENTE': 'TOTAL MÊS',
                'CLASSIFICACAO': 'TOTAL',
                'RICARDO': f'{total_ricardo:.2f}'.replace('.', ',') if total_ricardo > 0 else '',
                'RAFAEL': f'{total_rafael:.2f}'.replace('.', ',') if total_rafael > 0 else '',
                'ANEXO': f'TOTAL_{mes:02d}_{ano}',
                'DESCRICAO': f'Total do mês {mes:02d}/{ano}',
                'VALOR': '',
                'OCR': '',
                'DATA_DT': datetime(ano, mes, ultimo_dia, 23, 59),
                'MES_ANO': mes_periodo
            }
            linhas_totalizacao.append(linha_total)
    if linhas_totalizacao:
        df_totalizacao = pd.DataFrame(linhas_totalizacao)
        df_combinado = pd.concat([df_sem_totais, df_totalizacao], ignore_index=True)
        df_combinado = df_combinado.sort_values(['DATA_DT', 'HORA']).reset_index(drop=True)
    else:
        df_combinado = df_sem_totais
    df_combinado = df_combinado.drop(columns=['DATA_DT', 'MES_ANO'])
    print(f"Adicionadas {len(linhas_totalizacao)} linhas de totalização mensal")
    return df_combinado

def incrementar_csv(novo_df, arquivo_csv):
    if os.path.exists(arquivo_csv):
        df_existente = pd.read_csv(arquivo_csv)
        eh_csv_anexos = 'VALOR' in novo_df.columns and 'DESCRICAO' in novo_df.columns
        if eh_csv_anexos:
            novos_registros = novo_df.copy()
        else:
            if 'OCR' in novo_df.columns:
                mascara_novos = (
                    novo_df['OCR'].notna() & 
                    (novo_df['OCR'] != '') & 
                    (novo_df['OCR'] != 'Já processado anteriormente')
                )
                novos_registros = novo_df[mascara_novos].copy()
            else:
                novos_registros = novo_df.copy()
        if len(novos_registros) > 0:
            df_combinado = pd.concat([df_existente, novos_registros], ignore_index=True)
            print(f"CSV {arquivo_csv} incrementado: {len(df_existente)} + {len(novos_registros)} = {len(df_combinado)} registros")
        else:
            df_combinado = df_existente
            print(f"CSV {arquivo_csv} mantido inalterado - nenhum registro novo encontrado")
    else:
        df_combinado = novo_df
        print(f"CSV {arquivo_csv} criado com {len(novo_df)} registros")
    df_combinado.to_csv(arquivo_csv, index=False, quoting=1)
    return df_combinado

def mover_arquivos_processados():
    input_dir = "input"
    imgs_dir = "imgs"
    os.makedirs(imgs_dir, exist_ok=True)
    extensoes_imagem = ('.jpg', '.jpeg', '.png', '.pdf')
    arquivos_input = [f for f in os.listdir(input_dir) if f.lower().endswith(extensoes_imagem)]
    arquivos_movidos = 0
    for arquivo in arquivos_input:
        origem = os.path.join(input_dir, arquivo)
        destino = os.path.join(imgs_dir, arquivo)
        shutil.move(origem, destino)
        arquivos_movidos += 1
        print(f"Movido: {arquivo} -> imgs/")
    if arquivos_movidos > 0:
        print(f"Total de {arquivos_movidos} arquivos movidos para imgs/")
    return arquivos_movidos
