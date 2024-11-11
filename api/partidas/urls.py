from django.urls import path, include
from rest_framework.routers import DefaultRouter
from partidas.api.viewsets import PartidasViewSet

router = DefaultRouter()
router.register(r'partidas', PartidasViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
