# urls.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/urls.py
# Configuração de URLs do projeto Django

"""
URL configuration for wa_fin_ctrl project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include('wa_fin_ctrl.apps.core.urls')),
]

# Adiciona URLs para arquivos estáticos em desenvolvimento
if settings.DEBUG:
    # Usa constantes do env.py para diretórios
    from .apps.core.env import ATTR_FIN_DIR_IMGS
    urlpatterns += static(f'/{ATTR_FIN_DIR_IMGS}/', document_root=f'{ATTR_FIN_DIR_IMGS}/')
