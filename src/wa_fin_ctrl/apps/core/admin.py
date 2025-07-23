# admin.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/admin.py
# Configuração do admin Django para os modelos

from django.contrib import admin
from .models import Processamento, EntradaFinanceira, ArquivoProcessado, CorrecaoHistorico


@admin.register(Processamento)
class ProcessamentoAdmin(admin.ModelAdmin):
    list_display = ['tipo', 'status', 'data_hora_inicio', 'data_hora_fim', 'arquivos_processados', 'arquivos_erro']
    list_filter = ['tipo', 'status', 'data_hora_inicio']
    search_fields = ['mensagem', 'erro']
    readonly_fields = ['data_hora_inicio', 'data_hora_fim']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('tipo', 'status', 'data_hora_inicio', 'data_hora_fim')
        }),
        ('Estatísticas', {
            'fields': ('arquivos_processados', 'arquivos_erro')
        }),
        ('Detalhes', {
            'fields': ('mensagem', 'erro'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EntradaFinanceira)
class EntradaFinanceiraAdmin(admin.ModelAdmin):
    list_display = ['data_hora', 'valor', 'descricao', 'classificacao', 'desconsiderada', 'data_criacao']
    list_filter = ['classificacao', 'desconsiderada', 'data_hora', 'data_criacao']
    search_fields = ['descricao', 'arquivo_origem']
    readonly_fields = ['data_criacao', 'data_modificacao']
    
    fieldsets = (
        ('Informações Financeiras', {
            'fields': ('data_hora', 'valor', 'descricao', 'classificacao')
        }),
        ('Metadados', {
            'fields': ('arquivo_origem', 'processamento', 'desconsiderada')
        }),
        ('Datas', {
            'fields': ('data_criacao', 'data_modificacao'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ArquivoProcessado)
class ArquivoProcessadoAdmin(admin.ModelAdmin):
    list_display = ['nome_arquivo', 'tipo', 'tamanho', 'status', 'data_upload', 'data_processamento']
    list_filter = ['tipo', 'status', 'data_upload', 'data_processamento']
    search_fields = ['nome_arquivo', 'erro']
    readonly_fields = ['data_upload', 'data_processamento']
    
    fieldsets = (
        ('Informações do Arquivo', {
            'fields': ('nome_arquivo', 'tipo', 'tamanho', 'status')
        }),
        ('Processamento', {
            'fields': ('processamento', 'data_upload', 'data_processamento')
        }),
        ('Erro', {
            'fields': ('erro',),
            'classes': ('collapse',)
        }),
    )


@admin.register(CorrecaoHistorico)
class CorrecaoHistoricoAdmin(admin.ModelAdmin):
    list_display = ['index', 'command', 'data_hora_entrada', 'success', 'execution']
    list_filter = ['command', 'success', 'dismiss', 'ia_reprocessamento', 'execution']
    search_fields = ['data_hora_entrada', 'descricao_original', 'descricao_nova']
    readonly_fields = ['index', 'execution']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('index', 'command', 'execution', 'data_hora_entrada', 'success')
        }),
        ('Valores', {
            'fields': ('valor_original', 'valor_novo'),
            'classes': ('collapse',)
        }),
        ('Classificação', {
            'fields': ('classificacao_original', 'classificacao_nova'),
            'classes': ('collapse',)
        }),
        ('Descrição', {
            'fields': ('descricao_original', 'descricao_nova'),
            'classes': ('collapse',)
        }),
        ('Ações', {
            'fields': ('dismiss', 'rotate_degrees', 'ia_reprocessamento'),
            'classes': ('collapse',)
        }),
        ('Relacionamentos', {
            'fields': ('entrada_financeira',),
            'classes': ('collapse',)
        }),
        ('Erro', {
            'fields': ('mensagem_erro',),
            'classes': ('collapse',)
        }),
    )
