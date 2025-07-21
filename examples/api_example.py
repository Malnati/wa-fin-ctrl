#!/usr/bin/env python3
"""
Exemplo de uso da API WA Fin Ctrl para acessar relatórios HTML.

Este script demonstra como:
1. Listar todos os relatórios disponíveis
2. Acessar relatórios específicos
3. Gerar relatórios sob demanda
"""

import requests
import json
import sys
from pathlib import Path

# Configuração da API
API_BASE_URL = "http://localhost:8000"

def print_separator(title):
    """Imprime um separador com título."""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def test_health_check():
    """Testa o endpoint de health check."""
    print_separator("HEALTH CHECK")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API está funcionando: {data['message']}")
            return True
        else:
            print(f"❌ API não está respondendo: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Não foi possível conectar à API em {API_BASE_URL}")
        print("   Certifique-se de que a API está rodando com: make api")
        return False

def list_reports():
    """Lista todos os relatórios disponíveis."""
    print_separator("LISTANDO RELATÓRIOS DISPONÍVEIS")
    try:
        response = requests.get(f"{API_BASE_URL}/reports")
        if response.status_code == 200:
            reports = response.json()
            if not reports:
                print("📭 Nenhum relatório encontrado.")
                return []
            
            print(f"📊 Encontrados {len(reports)} relatórios:")
            for i, report in enumerate(reports, 1):
                print(f"\n{i}. {report['display_name']}")
                print(f"   Arquivo: {report['filename']}")
                print(f"   Tipo: {report['type']}")
                if report['period']:
                    print(f"   Período: {report['period']}")
                print(f"   Tamanho: {report['size_mb']} MB")
                print(f"   URL: {API_BASE_URL}{report['url']}")
                if report['is_editable']:
                    print(f"   ✏️  Editável")
            
            return reports
        else:
            print(f"❌ Erro ao listar relatórios: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return []

def access_specific_report(filename):
    """Acessa um relatório específico."""
    print_separator(f"ACESSANDO RELATÓRIO: {filename}")
    try:
        response = requests.get(f"{API_BASE_URL}/reports/{filename}")
        if response.status_code == 200:
            print(f"✅ Relatório '{filename}' acessado com sucesso!")
            print(f"   Tamanho: {len(response.content)} bytes")
            print(f"   Tipo: {response.headers.get('content-type', 'text/html')}")
            
            # Salva o relatório localmente para visualização
            output_file = f"downloaded_{filename}"
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"   💾 Salvo localmente como: {output_file}")
            
            return True
        else:
            print(f"❌ Erro ao acessar relatório: {response.status_code}")
            if response.status_code == 404:
                print(f"   Relatório '{filename}' não encontrado")
            return False
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

def generate_reports():
    """Gera relatórios sob demanda."""
    print_separator("GERANDO RELATÓRIOS SOB DEMANDA")
    try:
        response = requests.post(
            f"{API_BASE_URL}/reports/generate",
            data={"force": False, "backup": True}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['message']}")
            print(f"   Arquivo de cálculo: {data['data']['calculation_file']}")
            return True
        else:
            print(f"❌ Erro ao gerar relatórios: {response.status_code}")
            if response.status_code == 400:
                error_data = response.json()
                print(f"   {error_data.get('detail', 'Erro desconhecido')}")
            return False
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

def show_api_info():
    """Mostra informações da API."""
    print_separator("INFORMAÇÕES DA API")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"📋 {data['message']} v{data['version']}")
            print("\n📚 Endpoints disponíveis:")
            for endpoint, description in data['endpoints'].items():
                print(f"   {endpoint}: {description}")
        else:
            print(f"❌ Erro ao obter informações da API: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

def main():
    """Função principal."""
    print("🚀 Exemplo de uso da API WA Fin Ctrl")
    print(f"🌐 Conectando à API em: {API_BASE_URL}")
    
    # Testa se a API está funcionando
    if not test_health_check():
        sys.exit(1)
    
    # Mostra informações da API
    show_api_info()
    
    # Lista relatórios disponíveis
    reports = list_reports()
    
    if reports:
        # Tenta acessar o primeiro relatório disponível
        first_report = reports[0]['filename']
        access_specific_report(first_report)
        
        # Se há relatórios mensais, tenta acessar um
        monthly_reports = [r for r in reports if r['type'] == 'mensal']
        if monthly_reports:
            first_monthly = monthly_reports[0]['filename']
            access_specific_report(first_monthly)
    
    # Tenta gerar relatórios
    generate_reports()
    
    print_separator("EXEMPLO CONCLUÍDO")
    print("✅ Script de exemplo executado com sucesso!")
    print("\n📖 Para mais informações, consulte:")
    print("   - docs/API.md")
    print("   - http://localhost:8000/docs (Swagger UI)")
    print("\n🔧 Para iniciar a API:")
    print("   make api")

if __name__ == "__main__":
    main() 