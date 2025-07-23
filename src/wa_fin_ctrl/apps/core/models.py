# models.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/models.py
# Modelos Django para processamento de comprovantes financeiros

from django.db import models
from django.utils import timezone


class Processamento(models.Model):
    """Modelo para registrar processamentos de arquivos"""
    
    TIPO_CHOICES = [
        ('incremental', 'Processamento Incremental'),
        ('force', 'Processamento Forçado'),
        ('backup', 'Processamento com Backup'),
    ]
    
    STATUS_CHOICES = [
        ('iniciado', 'Iniciado'),
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('erro', 'Erro'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='iniciado')
    data_hora_inicio = models.DateTimeField(default=timezone.now)
    data_hora_fim = models.DateTimeField(null=True, blank=True)
    arquivos_processados = models.IntegerField(default=0)
    arquivos_erro = models.IntegerField(default=0)
    mensagem = models.TextField(blank=True)
    erro = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-data_hora_inicio']
        verbose_name = 'Processamento'
        verbose_name_plural = 'Processamentos'
    
    def __str__(self):
        return f"{self.tipo} - {self.status} - {self.data_hora_inicio.strftime('%d/%m/%Y %H:%M:%S')}"


class EntradaFinanceira(models.Model):
    """Modelo para registrar entradas financeiras processadas"""
    
    CLASSIFICACAO_CHOICES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
        ('transferência', 'Transferência'),
        ('pagamento', 'Pagamento'),
        ('recebimento', 'Recebimento'),
        ('outros', 'Outros'),
    ]
    
    data_hora = models.DateTimeField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    descricao = models.CharField(max_length=500)
    classificacao = models.CharField(max_length=20, choices=CLASSIFICACAO_CHOICES)
    arquivo_origem = models.CharField(max_length=255, blank=True)
    processamento = models.ForeignKey(Processamento, on_delete=models.CASCADE, null=True, blank=True)
    data_criacao = models.DateTimeField(default=timezone.now)
    data_modificacao = models.DateTimeField(auto_now=True)
    desconsiderada = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-data_hora']
        verbose_name = 'Entrada Financeira'
        verbose_name_plural = 'Entradas Financeiras'
    
    def __str__(self):
        return f"{self.data_hora.strftime('%d/%m/%Y %H:%M:%S')} - R$ {self.valor} - {self.descricao}"


class ArquivoProcessado(models.Model):
    """Modelo para registrar arquivos processados"""
    
    TIPO_CHOICES = [
        ('imagem', 'Imagem'),
        ('pdf', 'PDF'),
        ('zip', 'Arquivo ZIP'),
        ('outro', 'Outro'),
    ]
    
    nome_arquivo = models.CharField(max_length=255)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    tamanho = models.BigIntegerField()
    data_upload = models.DateTimeField(default=timezone.now)
    data_processamento = models.DateTimeField(null=True, blank=True)
    processamento = models.ForeignKey(Processamento, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, default='pendente')
    erro = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-data_upload']
        verbose_name = 'Arquivo Processado'
        verbose_name_plural = 'Arquivos Processados'
    
    def __str__(self):
        return f"{self.nome_arquivo} - {self.tipo} - {self.status}"


class CorrecaoHistorico(models.Model):
    """Modelo para registrar histórico de correções (fix)"""
    
    COMANDO_CHOICES = [
        ('fix', 'Correção de Entrada'),
        ('dismiss', 'Marcar como Desconsiderada'),
        ('rotate', 'Rotação de Imagem'),
        ('ia', 'Reprocessamento com IA'),
    ]
    
    index = models.AutoField(primary_key=True)
    execution = models.DateTimeField(auto_now_add=True)
    command = models.CharField(max_length=20, choices=COMANDO_CHOICES)
    
    # Campos específicos do fix
    data_hora_entrada = models.DateTimeField()
    valor_original = models.CharField(max_length=20, blank=True)
    valor_novo = models.CharField(max_length=20, blank=True)
    classificacao_original = models.CharField(max_length=20, blank=True)
    classificacao_nova = models.CharField(max_length=20, blank=True)
    descricao_original = models.CharField(max_length=500, blank=True)
    descricao_nova = models.CharField(max_length=500, blank=True)
    
    # Campos de controle
    dismiss = models.BooleanField(default=False)
    rotate_degrees = models.IntegerField(null=True, blank=True)
    ia_reprocessamento = models.BooleanField(default=False)
    
    # Resultado
    success = models.BooleanField(default=True)
    mensagem_erro = models.TextField(blank=True)
    
    # Relacionamento com entrada financeira (opcional)
    entrada_financeira = models.ForeignKey(
        EntradaFinanceira, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    class Meta:
        ordering = ['-execution']
        verbose_name = 'Histórico de Correção'
        verbose_name_plural = 'Históricos de Correções'
    
    def __str__(self):
        return f"{self.command} - {self.data_hora_entrada} - {'✅' if self.success else '❌'}"
