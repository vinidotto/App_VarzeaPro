from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from partidas.models import Partida
from torneios.models import Torneios
from equipes.models import Equipes
from .serializers import PartidasSerializer

class PartidasViewSet(viewsets.ModelViewSet):
    queryset = Partida.objects.all()
    serializer_class = PartidasSerializer

    @action(detail=False, methods=['get'], url_path=r'por-torneio/(?P<torneio_id>\d+)')
    def partidas_por_torneio(self, request, torneio_id=None):
        # Filtra as partidas pelo ID do torneio
        partidas = Partida.objects.filter(campeonato_id=torneio_id)
        serializer = PartidasSerializer(partidas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path=r'confronto-torneio/(?P<torneio_id>\d+)')
    def create_confronto_for_torneio(self, request, torneio_id=None):
        # Verifica se o torneio existe
        torneio = Torneios.objects.filter(id=torneio_id).first()
        if not torneio:
            return Response({"detail": "Torneio não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        equipe_casa_id = data.get('Equipe_casa')
        equipe_visitante_id = data.get('Equipe_visitante')
        data_confronto = data.get('data')
        localizacao = data.get('localizacao', 'Local do Confronto')  # Localização padrão se não for fornecida

        # Valida a existência das equipes
        equipe_casa = Equipes.objects.filter(id=equipe_casa_id).first()
        equipe_visitante = Equipes.objects.filter(id=equipe_visitante_id).first()
        
        if not equipe_casa or not equipe_visitante:
            return Response({"detail": "Uma ou ambas as equipes não foram encontradas."}, status=status.HTTP_400_BAD_REQUEST)

        # Verifica se as equipes estão associadas ao torneio
        if equipe_casa not in torneio.times_participantes.all() or equipe_visitante not in torneio.times_participantes.all():
            return Response({"detail": "Uma ou ambas as equipes não estão associadas ao torneio."}, status=status.HTTP_400_BAD_REQUEST)

        partida = Partida.objects.create(
            campeonato=torneio,
            Equipe_casa=equipe_casa,
            Equipe_visitante=equipe_visitante,
            data=data_confronto,
            localizacao=localizacao
        )

        partida_serializer = PartidasSerializer(partida)
        return Response(partida_serializer.data, status=status.HTTP_201_CREATED)
