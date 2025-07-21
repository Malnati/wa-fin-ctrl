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

    def __init__(self):
        self.history_file = ATTR_FIN_ARQ_HISTORY
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
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"📄 Arquivo de histórico criado: {self.history_file}")

    def _get_next_index(self) -> int:
        """Obtém o próximo índice disponível"""
        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
                return len(history) + 1
        except (FileNotFoundError, json.JSONDecodeError):
            return 1

    def record_command(self, command: str, arguments: Dict[str, Any], success: bool = True):
        """Registra um comando executado no histórico"""
        entry = {
            "index": self._get_next_index(),
            "execution": datetime.now().isoformat(),
            "command": command,
            "arguments": arguments,
            "success": success
        }

        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)

            history.append(entry)

            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, ensure_ascii=False, indent=2)

            print(f"📝 Comando registrado no histórico: {command}")

        except Exception as e:
            print(f"⚠️ Erro ao registrar comando no histórico: {str(e)}")

    def get_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtém o histórico de comandos"""
        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)

            if limit:
                return history[-limit:]
            return history
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def get_command_history(self, command: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtém histórico de um comando específico"""
        history = self.get_history()
        filtered = [entry for entry in history if entry['command'] == command]

        if limit:
            return filtered[-limit:]
        return filtered

    def get_recent_commands(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtém comandos executados nas últimas N horas"""
        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)

            cutoff_time = datetime.now().timestamp() - (hours * 3600)
            recent = []

            for entry in history:
                try:
                    entry_time = datetime.fromisoformat(entry['execution']).timestamp()
                    if entry_time >= cutoff_time:
                        recent.append(entry)
                except (ValueError, TypeError):
                    continue

            return recent
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def clear_history(self):
        """Limpa todo o histórico"""
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print("🗑️ Histórico limpo com sucesso")
        except Exception as e:
            print(f"❌ Erro ao limpar histórico: {str(e)}")

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
                "last_command": None
            }

        successful = sum(1 for entry in history if entry.get('success', False))
        failed = len(history) - successful

        command_types = {}
        for entry in history:
            cmd = entry.get('command', 'unknown')
            command_types[cmd] = command_types.get(cmd, 0) + 1

        return {
            "total_commands": len(history),
            "successful_commands": successful,
            "failed_commands": failed,
            "command_types": command_types,
            "first_command": history[0]['execution'] if history else None,
            "last_command": history[-1]['execution'] if history else None
        }


def record_command_wrapper(command: str, arguments: Dict[str, Any], success: bool = True):
    """Wrapper conveniente para registrar comandos"""
    history = CommandHistory()
    history.record_command(command, arguments, success)
