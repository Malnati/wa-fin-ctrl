# urls.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/urls.py
# URLs do app core para processamento de comprovantes financeiros

from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Página principal
    path('', views.root, name='root'),
    
    # API endpoints
    path('api/status/', views.get_status, name='api_status'),
    path('api/reports/', views.list_reports, name='api_reports'),
    path('api/info/', views.api_info, name='api_info'),
    path('health/', views.health, name='health'),
    
    # Ações
    path('fix/', views.fix_entry_view, name='fix_entry'),
    path('process/', views.process_files, name='process_files'),
    path('upload/', views.upload_file, name='upload_file'),
    path('reports/generate/', views.generate_reports, name='generate_reports'),
    
    # Relatórios
    path('reports/<str:filename>/', views.get_report, name='get_report'),
] 