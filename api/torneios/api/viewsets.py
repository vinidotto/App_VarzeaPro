from rest_framework import viewsets
from torneios.models import Torneios
from .serializers import TorneiosSerializer

class TorneiosViewSet(viewsets.ModelViewSet):
    queryset = Torneios.objects.all()
    serializer_class = TorneiosSerializer
