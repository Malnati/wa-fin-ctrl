#!/usr/bin/env python3
# test.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/test.py
# Arquivo de testes para o sistema de processamento de comprovantes

import os
import sys
from pathlib import Path

# Adiciona o diretório atual ao path para importar módulos
sys.path.insert(0, str(Path(__file__).parent))

from .app import (
    ATTR_FIN_DIR_IMGS,
    ATTR_FIN_DIR_INPUT,
    ATTR_FIN_DIR_MASSA,
    ATTR_FIN_OPENAI_API_KEY,
    process_image_ocr,
    extract_total_value_with_chatgpt,
    generate_payment_description_with_chatgpt,
    classify_transaction_type_with_chatgpt,
)
from .ocr import process_image_ocr as ocr_process_image
from .history import CommandHistory


def testar_ocr_individual():
    """Testa o OCR em imagens individuais"""
    print("\n--- Testando OCR Individual ---")

    try:
        # Procura por imagens de teste dinamicamente
        diretorios_busca = [ATTR_FIN_DIR_IMGS, ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_MASSA]
        imagem_teste = None

        for diretorio in diretorios_busca:
            if os.path.exists(diretorio):
                imagens = [
                    f
                    for f in os.listdir(diretorio)
                    if f.lower().endswith((".jpg", ".jpeg", ".png"))
                ]
                if imagens:
                    imagem_teste = os.path.join(diretorio, imagens[0])
                    break

        if not imagem_teste:
            print("⚠️  Nenhuma imagem encontrada para teste de OCR")
            return True  # Não é falha, apenas não há imagem para testar

        print(f"Testando OCR na imagem: {imagem_teste}")

        # Executa OCR
        resultado = ocr_process_image(imagem_teste)

        if resultado and resultado.strip():
            print(f"✅ OCR funcionando - Texto extraído: {resultado[:100]}...")
            return True
        else:
            print("❌ OCR não extraiu texto")
            return False

    except Exception as e:
        print(f"❌ Erro no teste de OCR: {e}")
        return False


def testar_funcoes_chatgpt():
    """Testa as funções que usam ChatGPT (se API disponível)"""
    print("\n--- Testando Funções ChatGPT ---")

    try:
        # Verifica se API está disponível
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            print("⚠️  API Key do OpenAI não configurada")
            return False

        # Texto de teste
        texto_teste = "PIX Banco do Brasil R$ 29,90 Padaria Bonanza"

        # Testa extração de valor
        print("Testando extração de valor...")
        valor = extract_total_value_with_chatgpt(texto_teste)
        sucesso_valor = bool(valor and valor != "")

        # Testa geração de descrição
        print("Testando geração de descrição...")
        descricao = generate_payment_description_with_chatgpt(texto_teste)
        sucesso_descricao = bool(descricao and descricao != "")

        # Testa classificação
        print("Testando classificação...")
        classificacao = classify_transaction_type_with_chatgpt(texto_teste)
        sucesso_classificacao = classificacao in ["Transferência", "Pagamento"]

        print(f"Valor extraído: {valor}")
        print(f"Descrição gerada: {descricao}")
        print(f"Classificação: {classificacao}")

        sucesso_geral = sucesso_valor and sucesso_descricao and sucesso_classificacao
        print(f"Funções ChatGPT: {'✅ PASSOU' if sucesso_geral else '❌ FALHOU'}")
        return sucesso_geral

    except Exception as e:
        print(f"❌ Erro no teste de funções ChatGPT: {e}")
        return False


def testar_processamento_completo():
    """Testa o processamento completo de uma imagem"""
    print("\n--- Testando Processamento Completo ---")

    try:
        # Procura por imagens de teste
        diretorios_busca = [ATTR_FIN_DIR_IMGS, ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_MASSA]
        imagem_teste = None

        for diretorio in diretorios_busca:
            if os.path.exists(diretorio):
                imagens = [
                    f
                    for f in os.listdir(diretorio)
                    if f.lower().endswith((".jpg", ".jpeg", ".png"))
                ]
                if imagens:
                    imagem_teste = os.path.join(diretorio, imagens[0])
                    break

        if not imagem_teste:
            print("⚠️  Nenhuma imagem encontrada para teste de processamento")
            return True

        print(f"Testando processamento da imagem: {imagem_teste}")

        # Executa processamento completo
        resultado = process_image_ocr(imagem_teste)

        if resultado:
            print(f"✅ Processamento funcionando - Resultado: {resultado}")
            return True
        else:
            print("❌ Processamento falhou")
            return False

    except Exception as e:
        print(f"❌ Erro no teste de processamento: {e}")
        return False


def testar_sistema_historico():
    """Testa o sistema de histórico de comandos"""
    print("\n--- Testando Sistema de Histórico ---")

    try:
        # Inicializa o histórico
        history = CommandHistory()

        # Limpa o histórico para o teste
        print("🗑️ Limpando histórico para teste...")
        history.clear_history()

        # Registra alguns comandos de teste
        print("📝 Registrando comandos de teste...")

        # Comando fix com todos os argumentos
        history.record_command(
            "fix",
            {
                "data_hora": "15/01/2024 14:30:25",
                "value": "2,33",
                "classification": "alimentacao",
                "description": "Lanche",
                "dismiss": False,
                "rotate": None,
                "ia": False,
            },
            True,
        )

        # Comando dismiss
        history.record_command("dismiss", {"data_hora": "15/01/2024 15:45:10"}, True)

        # Comando processar
        history.record_command(
            "processar", {"force": True, "entry": None, "backup": True}, True
        )

        # Comando com falha
        history.record_command(
            "fix",
            {
                "data_hora": "15/01/2024 16:00:00",
                "value": "invalid",
                "classification": None,
                "description": None,
                "dismiss": False,
                "rotate": None,
                "ia": False,
            },
            False,
        )

        # Verifica se os registros foram criados
        entries = history.get_history()
        if len(entries) != 4:
            print(f"❌ Número incorreto de registros: {len(entries)} (esperado: 4)")
            return False

        # Verifica estrutura dos registros
        for entry in entries:
            required_fields = ["index", "execution", "command", "arguments", "success"]
            for field in required_fields:
                if field not in entry:
                    print(f"❌ Campo obrigatório ausente: {field}")
                    return False

        # Verifica se execution é diferente de data_hora nos argumentos
        fix_entries = history.get_command_history("fix")
        for entry in fix_entries:
            if entry["arguments"]["data_hora"] == entry["execution"]:
                print("❌ execution não deve ser igual ao data_hora dos argumentos")
                return False

        # Testa estatísticas
        stats = history.get_statistics()
        if stats["total_commands"] != 4:
            print(
                f"❌ Estatísticas incorretas: {stats['total_commands']} (esperado: 4)"
            )
            return False

        if stats["successful_commands"] != 3:
            print(
                f"❌ Comandos bem-sucedidos incorretos: {stats['successful_commands']} (esperado: 3)"
            )
            return False

        if stats["failed_commands"] != 1:
            print(
                f"❌ Comandos com falha incorretos: {stats['failed_commands']} (esperado: 1)"
            )
            return False

        print("✅ Sistema de histórico funcionando corretamente!")
        print(f" - Total de registros: {stats['total_commands']}")
        print(f" - Comandos bem-sucedidos: {stats['successful_commands']}")
        print(f" - Comandos com falha: {stats['failed_commands']}")
        print(f" - Tipos de comando: {list(stats['command_types'].keys())}")

        return True

    except Exception as e:
        print(f"❌ Erro no teste do sistema de histórico: {e}")
        return False


def executar_todos_testes():
    """Executa todos os testes disponíveis"""
    print("🧪 Iniciando testes do sistema...")

    testes = [
        testar_ocr_individual,
        testar_funcoes_chatgpt,
        testar_processamento_completo,
        testar_sistema_historico,
    ]

    resultados = []
    for teste in testes:
        try:
            resultado = teste()
            resultados.append(resultado)
        except Exception as e:
            print(f"❌ Erro ao executar teste {teste.__name__}: {e}")
            resultados.append(False)

    # Resumo dos resultados
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)

    nomes_testes = [
        "OCR Individual",
        "Funções ChatGPT",
        "Processamento Completo",
        "Histórico",
    ]
    for i, (nome, resultado) in enumerate(zip(nomes_testes, resultados)):
        status = "✅ PASSOU" if resultado else "❌ FALHOU"
        print(f"{i+1}. {nome}: {status}")

    sucessos = sum(resultados)
    total = len(resultados)
    print(f"\nTotal: {sucessos}/{total} testes passaram")

    if sucessos == total:
        print("🎉 Todos os testes passaram!")
        return True
    else:
        print("⚠️  Alguns testes falharam")
        return False


if __name__ == "__main__":
    executar_todos_testes()
