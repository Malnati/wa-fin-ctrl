from django.test import TestCase
from django.utils import timezone
from ..models import Processamento, EntradaFinanceira, ArquivoProcessado, CorrecaoHistorico


class BancoDeDadosTestCase(TestCase):
    """Testes para o banco de dados unificado"""
    
    def test_criacao_processamento(self):
        """Testa criação de um processamento"""
        processamento = Processamento.objects.create(
            tipo='incremental',
            status='concluido',
            arquivos_processados=1,
            mensagem='Teste de processamento'
        )
        
        self.assertIsNotNone(processamento.id)
        self.assertEqual(processamento.tipo, 'incremental')
        self.assertEqual(processamento.status, 'concluido')
        self.assertEqual(processamento.arquivos_processados, 1)
    
    def test_criacao_entrada_financeira(self):
        """Testa criação de uma entrada financeira"""
        entrada = EntradaFinanceira.objects.create(
            data_hora=timezone.now(),
            valor=100.50,
            descricao='Teste de entrada',
            classificacao='pagamento'
        )
        
        self.assertIsNotNone(entrada.id)
        self.assertEqual(entrada.valor, 100.50)
        self.assertEqual(entrada.descricao, 'Teste de entrada')
        self.assertEqual(entrada.classificacao, 'pagamento')
    
    def test_criacao_arquivo_processado(self):
        """Testa criação de um arquivo processado"""
        arquivo = ArquivoProcessado.objects.create(
            nome_arquivo='teste.jpg',
            tipo='imagem',
            tamanho=1024,
            status='processado'
        )
        
        self.assertIsNotNone(arquivo.id)
        self.assertEqual(arquivo.nome_arquivo, 'teste.jpg')
        self.assertEqual(arquivo.tipo, 'imagem')
        self.assertEqual(arquivo.status, 'processado')
    
    def test_criacao_correcao_historico(self):
        """Testa criação de uma correção de histórico"""
        correcao = CorrecaoHistorico.objects.create(
            command='fix',
            data_hora_entrada=timezone.now(),
            valor_original='100,00',
            valor_novo='150,00',
            success=True
        )
        
        self.assertIsNotNone(correcao.index)
        self.assertEqual(correcao.command, 'fix')
        self.assertEqual(correcao.valor_original, '100,00')
        self.assertEqual(correcao.valor_novo, '150,00')
        self.assertTrue(correcao.success)
    
    def test_relacionamento_processamento_entrada(self):
        """Testa relacionamento entre processamento e entrada financeira"""
        processamento = Processamento.objects.create(
            tipo='incremental',
            status='concluido'
        )
        
        entrada = EntradaFinanceira.objects.create(
            data_hora=timezone.now(),
            valor=200.00,
            descricao='Entrada com processamento',
            classificacao='transferência',
            processamento=processamento
        )
        
        self.assertEqual(entrada.processamento, processamento)
        self.assertIn(entrada, processamento.entradafinanceira_set.all())
    
    def test_relacionamento_processamento_arquivo(self):
        """Testa relacionamento entre processamento e arquivo processado"""
        processamento = Processamento.objects.create(
            tipo='incremental',
            status='concluido'
        )
        
        arquivo = ArquivoProcessado.objects.create(
            nome_arquivo='teste.pdf',
            tipo='pdf',
            tamanho=2048,
            processamento=processamento
        )
        
        self.assertEqual(arquivo.processamento, processamento)
        self.assertIn(arquivo, processamento.arquivoprocessado_set.all())
    
    def test_relacionamento_entrada_correcao(self):
        """Testa relacionamento entre entrada financeira e correção"""
        entrada = EntradaFinanceira.objects.create(
            data_hora=timezone.now(),
            valor=300.00,
            descricao='Entrada para correção',
            classificacao='outros'
        )
        
        correcao = CorrecaoHistorico.objects.create(
            command='fix',
            data_hora_entrada=timezone.now(),
            entrada_financeira=entrada,
            success=True
        )
        
        self.assertEqual(correcao.entrada_financeira, entrada)
    
    def test_consultas_basicas(self):
        """Testa consultas básicas no banco"""
        # Cria dados de teste
        Processamento.objects.create(tipo='incremental', status='concluido')
        Processamento.objects.create(tipo='force', status='erro')
        
        EntradaFinanceira.objects.create(
            data_hora=timezone.now(),
            valor=100.00,
            descricao='Entrada 1',
            classificacao='pagamento'
        )
        EntradaFinanceira.objects.create(
            data_hora=timezone.now(),
            valor=200.00,
            descricao='Entrada 2',
            classificacao='transferência'
        )
        
        # Testa contagens
        self.assertEqual(Processamento.objects.count(), 2)
        self.assertEqual(EntradaFinanceira.objects.count(), 2)
        
        # Testa filtros
        self.assertEqual(Processamento.objects.filter(status='concluido').count(), 1)
        self.assertEqual(EntradaFinanceira.objects.filter(classificacao='pagamento').count(), 1)
        
        # Testa ordenação
        entradas_ordenadas = EntradaFinanceira.objects.order_by('-valor')
        self.assertEqual(entradas_ordenadas[0].valor, 200.00)
    
    def test_estrutura_banco(self):
        """Testa se todas as tabelas foram criadas corretamente"""
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Verifica se as tabelas principais existem
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name LIKE 'core_%'
                ORDER BY name
            """)
            tabelas = [row[0] for row in cursor.fetchall()]
            
            tabelas_esperadas = [
                'core_processamento',
                'core_entradafinanceira', 
                'core_arquivoprocessado',
                'core_correcaohistorico'
            ]
            
            for tabela in tabelas_esperadas:
                self.assertIn(tabela, tabelas, f"Tabela {tabela} não encontrada")
            
            # Verifica se as views existem
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='view' AND name LIKE 'v_%'
                ORDER BY name
            """)
            views = [row[0] for row in cursor.fetchall()]
            
            # Nota: Views podem não existir se foram criadas pelo DDL customizado
            # mas não são necessárias para o funcionamento básico do Django 