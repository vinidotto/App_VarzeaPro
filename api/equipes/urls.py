from django.urls import path, include
from rest_framework.routers import DefaultRouter
from equipes.api.viewsets import EquipeViewSet

router = DefaultRouter()
router.register(r'equipes', EquipeViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('equipes/', EquipeViewSet.as_view({'post': 'create_for_torneio'})),
]
