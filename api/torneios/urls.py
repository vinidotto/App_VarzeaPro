from django.urls import path, include
from rest_framework.routers import DefaultRouter
from torneios.api.viewsets import TorneiosViewSet

router = DefaultRouter()
router.register(r'torneios', TorneiosViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
