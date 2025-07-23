#!/usr/bin/env python3
# history.py
# Módulo para gerenciamento do histórico de comandos executados

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
from .env import ATTR_FIN_ARQ_HISTORY


class CommandHistory:
    """Classe para gerenciar o histórico de comandos executados"""

    def __init__(self, use_database=True):
        self.history_file = ATTR_FIN_ARQ_HISTORY
        self.use_database = use_database
        
        if not use_database:
            self._ensure_data_directory()
            self._ensure_history_file()

    def _ensure_data_directory(self):
        """Garante que o diretório data/ existe"""
        data_dir = os.path.dirname(self.history_file)
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            print(f"📁 Diretório criado: {data_dir}")

    def _ensure_history_file(self):
        """Garante que o arquivo history.json existe"""
        if not os.path.exists(self.history_file):
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"📄 Arquivo de histórico criado: {self.history_file}")

    def _get_next_index(self) -> int:
        """Obtém o próximo índice disponível"""
        if self.use_database:
            try:
                from .apps.core.models import CorrecaoHistorico
                return CorrecaoHistorico.objects.count() + 1
            except Exception:
                return 1
        else:
            try:
                with open(self.history_file, "r", encoding="utf-8") as f:
                    history = json.load(f)
                    return len(history) + 1
            except (FileNotFoundError, json.JSONDecodeError):
                return 1

    def record_command(
        self, command: str, arguments: Dict[str, Any], success: bool = True
    ):
        """Registra um comando executado no histórico"""
        if self.use_database:
            self._record_command_database(command, arguments, success)
        else:
            self._record_command_json(command, arguments, success)

    def _record_command_database(self, command: str, arguments: Dict[str, Any], success: bool = True):
        """Registra comando no banco de dados SQLite"""
        try:
            from django.db import transaction
            from .apps.core.models import CorrecaoHistorico
            
            with transaction.atomic():
                # Converte data_hora para datetime se for string
                data_hora_entrada = None
                if 'data_hora' in arguments:
                    try:
                        data_hora_entrada = datetime.strptime(arguments['data_hora'], '%d/%m/%Y %H:%M:%S')
                    except ValueError:
                        data_hora_entrada = datetime.now()
                
                correcao = CorrecaoHistorico.objects.create(
                    command=command,
                    data_hora_entrada=data_hora_entrada or datetime.now(),
                    valor_novo=arguments.get('value', ''),
                    classificacao_nova=arguments.get('classification', ''),
                    descricao_nova=arguments.get('description', ''),
                    dismiss=arguments.get('dismiss', False),
                    rotate_degrees=int(arguments.get('rotate')) if arguments.get('rotate') else None,
                    ia_reprocessamento=arguments.get('ia', False),
                    success=success
                )
                print(f"📝 Comando registrado no banco: {command} (ID: {correcao.index})")
                return correcao
        except Exception as e:
            print(f"⚠️ Erro ao registrar comando no banco: {str(e)}")
            # Fallback para JSON se o banco falhar
            self.use_database = False
            self._record_command_json(command, arguments, success)

    def _record_command_json(self, command: str, arguments: Dict[str, Any], success: bool = True):
        """Registra comando no arquivo JSON (legado)"""
        entry = {
            "index": self._get_next_index(),
            "execution": datetime.now().isoformat(),
            "command": command,
            "arguments": arguments,
            "success": success,
        }

        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                history = json.load(f)

            history.append(entry)

            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(history, f, ensure_ascii=False, indent=2)

            print(f"📝 Comando registrado no JSON: {command}")

        except Exception as e:
            print(f"⚠️ Erro ao registrar comando no JSON: {str(e)}")

    def record_fix_command(self, data_hora: str, arguments: Dict[str, Any], success: bool = True):
        """Registra especificamente um comando fix"""
        return self.record_command('fix', arguments, success)

    def get_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtém o histórico de comandos"""
        if self.use_database:
            return self._get_history_database(limit)
        else:
            return self._get_history_json(limit)

    def _get_history_database(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtém histórico do banco de dados"""
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

    def _get_history_json(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtém histórico do arquivo JSON"""
        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                history = json.load(f)

            if limit:
                return history[-limit:]
            return history
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def get_command_history(
        self, command: str, limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Obtém histórico de um comando específico"""
        history = self.get_history()
        filtered = [entry for entry in history if entry["command"] == command]

        if limit:
            return filtered[-limit:]
        return filtered

    def get_recent_commands(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtém comandos executados nas últimas N horas"""
        if self.use_database:
            return self._get_recent_commands_database(hours)
        else:
            return self._get_recent_commands_json(hours)

    def _get_recent_commands_database(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtém comandos recentes do banco de dados"""
        try:
            from django.utils import timezone
            from datetime import timedelta
            from .apps.core.models import CorrecaoHistorico
            
            cutoff_time = timezone.now() - timedelta(hours=hours)
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
            print(f"⚠️ Erro ao obter comandos recentes do banco: {str(e)}")
            return []

    def _get_recent_commands_json(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtém comandos recentes do arquivo JSON"""
        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                history = json.load(f)

            cutoff_time = datetime.now().timestamp() - (hours * 3600)
            recent = []

            for entry in history:
                try:
                    entry_time = datetime.fromisoformat(entry["execution"]).timestamp()
                    if entry_time >= cutoff_time:
                        recent.append(entry)
                except (ValueError, TypeError):
                    continue

            return recent
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def clear_history(self):
        """Limpa todo o histórico"""
        if self.use_database:
            self._clear_history_database()
        else:
            self._clear_history_json()

    def _clear_history_database(self):
        """Limpa histórico do banco de dados"""
        try:
            from .apps.core.models import CorrecaoHistorico
            count = CorrecaoHistorico.objects.count()
            CorrecaoHistorico.objects.all().delete()
            print(f"🗑️ Histórico limpo do banco: {count} registros removidos")
        except Exception as e:
            print(f"❌ Erro ao limpar histórico do banco: {str(e)}")

    def _clear_history_json(self):
        """Limpa histórico do arquivo JSON"""
        try:
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print("🗑️ Histórico limpo do JSON com sucesso")
        except Exception as e:
            print(f"❌ Erro ao limpar histórico do JSON: {str(e)}")

    def get_statistics(self) -> Dict[str, Any]:
        """Obtém estatísticas do histórico"""
        history = self.get_history()

        if not history:
            return {
                "total_commands": 0,
                "successful_commands": 0,
                "failed_commands": 0,
                "command_types": {},
                "first_command": None,
                "last_command": None,
                "storage_type": "database" if self.use_database else "json",
            }

        successful = sum(1 for entry in history if entry.get("success", False))
        failed = len(history) - successful

        command_types = {}
        for entry in history:
            cmd = entry.get("command", "unknown")
            command_types[cmd] = command_types.get(cmd, 0) + 1

        return {
            "total_commands": len(history),
            "successful_commands": successful,
            "failed_commands": failed,
            "command_types": command_types,
            "first_command": history[0]["execution"] if history else None,
            "last_command": history[-1]["execution"] if history else None,
            "storage_type": "database" if self.use_database else "json",
        }

    def migrate_json_to_database(self) -> bool:
        """Migra dados do JSON para o banco de dados"""
        try:
            if not os.path.exists(self.history_file):
                print("ℹ️ Nenhum arquivo JSON para migrar")
                return True

            with open(self.history_file, "r", encoding="utf-8") as f:
                json_history = json.load(f)

            if not json_history:
                print("ℹ️ Arquivo JSON vazio, nada para migrar")
                return True

            print(f"🔄 Migrando {len(json_history)} registros do JSON para o banco...")
            
            migrated_count = 0
            for entry in json_history:
                try:
                    # Converte entrada JSON para formato do banco
                    arguments = entry.get('arguments', {})
                    data_hora = arguments.get('data_hora', '')
                    
                    if data_hora:
                        try:
                            data_hora_entrada = datetime.strptime(data_hora, '%d/%m/%Y %H:%M:%S')
                        except ValueError:
                            data_hora_entrada = datetime.now()
                    else:
                        data_hora_entrada = datetime.now()

                    # Registra no banco
                    self._record_command_database(
                        entry.get('command', 'unknown'),
                        arguments,
                        entry.get('success', True)
                    )
                    migrated_count += 1
                except Exception as e:
                    print(f"⚠️ Erro ao migrar entrada {entry.get('index', 'unknown')}: {str(e)}")

            print(f"✅ Migração concluída: {migrated_count} registros migrados")
            return True

        except Exception as e:
            print(f"❌ Erro na migração: {str(e)}")
            return False


def record_command_wrapper(
    command: str, arguments: Dict[str, Any], success: bool = True, use_database: bool = True
):
    """Wrapper conveniente para registrar comandos"""
    history = CommandHistory(use_database=use_database)
    history.record_command(command, arguments, success)


def record_fix_command_wrapper(
    data_hora: str, arguments: Dict[str, Any], success: bool = True, use_database: bool = True
):
    """Wrapper conveniente para registrar comandos fix"""
    history = CommandHistory(use_database=use_database)
    history.record_fix_command(data_hora, arguments, success)
