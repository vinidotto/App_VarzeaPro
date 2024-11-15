from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from torneios.models import Torneios
from .serializers import TorneiosSerializer

class TorneiosViewSet(viewsets.ModelViewSet):
    queryset = Torneios.objects.all()
    serializer_class = TorneiosSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['data_inicio', 'data_fim', 'localizacao'] 
    search_fields = ['nome'] 
    ordering_fields = ['data_inicio', 'nome'] 
