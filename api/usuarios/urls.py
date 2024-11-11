from django.urls import path, include
from rest_framework.routers import DefaultRouter
from usuarios.api.viewsets import UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
]
