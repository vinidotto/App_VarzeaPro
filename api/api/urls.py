from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from equipes.api.viewsets import EquipeViewSet
from torneios.api.viewsets import TorneiosViewSet
from jogadores.api.viewsets import JogadorViewSet
from partidas.api.viewsets import PartidasViewSet
from usuarios.api.viewsets import UsuarioViewSet 
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'equipes', EquipeViewSet)
router.register(r'torneios', TorneiosViewSet)
router.register(r'jogadores', JogadorViewSet)
router.register(r'partidas', PartidasViewSet)
router.register(r'usuarios', UsuarioViewSet) 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

