# admin.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/admin.py
# Configuração do admin Django para os modelos

from django.contrib import admin
from .models import Processamento, EntradaFinanceira, ArquivoProcessado


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
