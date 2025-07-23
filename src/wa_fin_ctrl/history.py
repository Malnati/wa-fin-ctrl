#!/usr/bin/env python3
# history.py
# Módulo para gerenciamento do histórico de comandos executados

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List


class CommandHistory:
    """Classe para gerenciar o histórico de comandos executados"""

    def __init__(self):
        """Inicializa o sistema de histórico usando apenas banco de dados"""
        pass

    def _get_next_index(self) -> int:
        """Obtém o próximo índice disponível do banco de dados"""
        try:
            from .apps.core.models import CorrecaoHistorico
            return CorrecaoHistorico.objects.count() + 1
        except Exception:
            return 1

    def record_command(
        self, command: str, arguments: Dict[str, Any], success: bool = True
    ):
        """Registra um comando executado no banco de dados"""
        try:
            from .apps.core.models import CorrecaoHistorico
            
            # Extrai informações específicas do comando fix
            data_hora_entrada = None
            valor_original = arguments.get('valor_original', '')
            valor_novo = arguments.get('value', '')
            classificacao_original = arguments.get('classificacao_original', '')
            classificacao_nova = arguments.get('classification', '')
            descricao_original = arguments.get('descricao_original', '')
            descricao_nova = arguments.get('description', '')
            dismiss = arguments.get('dismiss', False)
            rotate_degrees = arguments.get('rotate')
            ia_reprocessamento = arguments.get('ia', False)
            
            # Converte data_hora se for string
            if 'data_hora' in arguments:
                try:
                    data_hora_str = arguments['data_hora']
                    data_hora_entrada = datetime.strptime(data_hora_str, '%d/%m/%Y %H:%M:%S')
                except (ValueError, TypeError):
                    data_hora_entrada = datetime.now()
            else:
                data_hora_entrada = datetime.now()
            
            # Converte rotate_degrees para int se for string
            if rotate_degrees and isinstance(rotate_degrees, str):
                try:
                    rotate_degrees = int(rotate_degrees)
                except ValueError:
                    rotate_degrees = None
            
            # Cria registro no banco
            CorrecaoHistorico.objects.create(
                command=command,
                data_hora_entrada=data_hora_entrada,
                valor_original=valor_original,
                valor_novo=valor_novo,
                classificacao_original=classificacao_original,
                classificacao_nova=classificacao_nova,
                descricao_original=descricao_original,
                descricao_nova=descricao_nova,
                dismiss=dismiss,
                rotate_degrees=rotate_degrees,
                ia_reprocessamento=ia_reprocessamento,
                success=success,
                mensagem_erro='' if success else str(arguments.get('error', ''))
            )
            
            print(f"📝 Comando registrado no banco: {command}")

        except Exception as e:
            print(f"⚠️ Erro ao registrar comando no banco: {str(e)}")

    def record_fix_command(self, data_hora: str, arguments: Dict[str, Any], success: bool = True):
        """Registra especificamente um comando fix"""
        return self.record_command('fix', arguments, success)

    def get_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtém o histórico de comandos do banco de dados"""
        try:
            from .apps.core.models import CorrecaoHistorico
            
            queryset = CorrecaoHistorico.objects.all()
            if limit:
                queryset = queryset[:limit]
            
            history = []
            for correcao in queryset:
                history.append({
                    'index': correcao.index,
                    'execution': correcao.execution.isoformat(),
                    'command': correcao.command,
                    'arguments': {
                        'data_hora': correcao.data_hora_entrada.strftime('%d/%m/%Y %H:%M:%S'),
                        'value': correcao.valor_novo,
                        'classification': correcao.classificacao_nova,
                        'description': correcao.descricao_nova,
                        'dismiss': correcao.dismiss,
                        'rotate': str(correcao.rotate_degrees) if correcao.rotate_degrees else None,
                        'ia': correcao.ia_reprocessamento,
                    },
                    'success': correcao.success,
                })
            return history
        except Exception as e:
            print(f"⚠️ Erro ao obter histórico do banco: {str(e)}")
            return []

    def get_command_history(
        self, command: str, limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Obtém histórico de um comando específico"""
        try:
            from .apps.core.models import CorrecaoHistorico
            
            queryset = CorrecaoHistorico.objects.filter(command=command)
            if limit:
                queryset = queryset[:limit]
            
            history = []
            for correcao in queryset:
                history.append({
                    'index': correcao.index,
                    'execution': correcao.execution.isoformat(),
                    'command': correcao.command,
                    'arguments': {
                        'data_hora': correcao.data_hora_entrada.strftime('%d/%m/%Y %H:%M:%S'),
                        'value': correcao.valor_novo,
                        'classification': correcao.classificacao_nova,
                        'description': correcao.descricao_nova,
                        'dismiss': correcao.dismiss,
                        'rotate': str(correcao.rotate_degrees) if correcao.rotate_degrees else None,
                        'ia': correcao.ia_reprocessamento,
                    },
                    'success': correcao.success,
                })
            return history
        except Exception as e:
            print(f"⚠️ Erro ao obter histórico do comando {command}: {str(e)}")
            return []

    def get_recent_commands(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtém comandos executados nas últimas N horas"""
        try:
            from .apps.core.models import CorrecaoHistorico
            from django.utils import timezone
            
            cutoff_time = timezone.now() - timezone.timedelta(hours=hours)
            queryset = CorrecaoHistorico.objects.filter(execution__gte=cutoff_time)
            
            history = []
            for correcao in queryset:
                history.append({
                    'index': correcao.index,
                    'execution': correcao.execution.isoformat(),
                    'command': correcao.command,
                    'arguments': {
                        'data_hora': correcao.data_hora_entrada.strftime('%d/%m/%Y %H:%M:%S'),
                        'value': correcao.valor_novo,
                        'classification': correcao.classificacao_nova,
                        'description': correcao.descricao_nova,
                        'dismiss': correcao.dismiss,
                        'rotate': str(correcao.rotate_degrees) if correcao.rotate_degrees else None,
                        'ia': correcao.ia_reprocessamento,
                    },
                    'success': correcao.success,
                })
            return history
        except Exception as e:
            print(f"⚠️ Erro ao obter comandos recentes: {str(e)}")
            return []

    def clear_history(self):
        """Limpa todo o histórico do banco de dados"""
        try:
            from .apps.core.models import CorrecaoHistorico
            CorrecaoHistorico.objects.all().delete()
            print("🗑️ Histórico limpo com sucesso")
        except Exception as e:
            print(f"❌ Erro ao limpar histórico: {str(e)}")

    def get_statistics(self) -> Dict[str, Any]:
        """Obtém estatísticas do histórico"""
        try:
            from .apps.core.models import CorrecaoHistorico
            
            total_commands = CorrecaoHistorico.objects.count()
            successful_commands = CorrecaoHistorico.objects.filter(success=True).count()
            failed_commands = total_commands - successful_commands
            
            # Agrupa por tipo de comando
            command_types = {}
            for correcao in CorrecaoHistorico.objects.all():
                cmd = correcao.command
                command_types[cmd] = command_types.get(cmd, 0) + 1
            
            # Obtém primeiro e último comando
            first_command = None
            last_command = None
            if total_commands > 0:
                first = CorrecaoHistorico.objects.order_by('execution').first()
                last = CorrecaoHistorico.objects.order_by('execution').last()
                if first:
                    first_command = first.execution.isoformat()
                if last:
                    last_command = last.execution.isoformat()
            
            return {
                "total_commands": total_commands,
                "successful_commands": successful_commands,
                "failed_commands": failed_commands,
                "command_types": command_types,
                "first_command": first_command,
                "last_command": last_command,
                "storage_type": "database"
            }
        except Exception as e:
            print(f"⚠️ Erro ao obter estatísticas: {str(e)}")
            return {
                "total_commands": 0,
                "successful_commands": 0,
                "failed_commands": 0,
                "command_types": {},
                "first_command": None,
                "last_command": None,
                "storage_type": "database"
            }


def record_command_wrapper(
    command: str, arguments: Dict[str, Any], success: bool = True
):
    """Wrapper conveniente para registrar comandos"""
    history = CommandHistory()
    history.record_command(command, arguments, success)


def record_fix_command_wrapper(
    data_hora: str, arguments: Dict[str, Any], success: bool = True
):
    """Wrapper conveniente para registrar comandos fix"""
    history = CommandHistory()
    history.record_fix_command(data_hora, arguments, success)
