from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from partidas.models import Partida
from torneios.models import Torneios 
from rest_framework import status
from equipes.models import Equipes
from .serializers import PartidasSerializer

class PartidasViewSet(viewsets.ModelViewSet):
    queryset = Partida.objects.all()
    serializer_class = PartidasSerializer

    @action(detail=False, methods=['get'], url_path=r'por-torneio/(?P<torneio_id>\d+)')
    def partidas_por_torneio(self, request, torneio_id=None):
        partidas = Partida.objects.filter(campeonato_id=torneio_id)
        serializer = PartidasSerializer(partidas, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['post'], url_path=r'confronto-torneio/(?P<torneio_id>\d+)')
    def create_confronto_for_torneio(self, request, torneio_id=None):
        torneio = Torneios.objects.filter(id=torneio_id).first()  
        if not torneio:
            return Response({"detail": "Torneio não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        equipe_casa_id = data.get('Equipe_casa')
        equipe_visitante_id = data.get('Equipe_visitante')

        # Verifica se as equipes existem no torneio
        equipe_casa = Equipes.objects.filter(id=equipe_casa_id, torneio=torneio).first()
        equipe_visitante = Equipes.objects.filter(id=equipe_visitante_id, torneio=torneio).first()

        if not equipe_casa or not equipe_visitante:
            return Response({"detail": "Uma ou ambas as equipes não estão associadas ao torneio."}, status=status.HTTP_400_BAD_REQUEST)

        # Cria a partida (confronto)
        partida = Partida.objects.create(
            campeonato=torneio,
            Equipe_casa=equipe_casa,
            Equipe_visitante=equipe_visitante,
            data=data.get('data'),  # A data do confronto
            localizacao=data.get('localizacao', 'Local do Confronto')  # Localização
        )

        partida_serializer = PartidasSerializer(partida)
        return Response(partida_serializer.data, status=status.HTTP_201_CREATED)