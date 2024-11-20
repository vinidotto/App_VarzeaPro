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
        data_confronto = data.get('data')
        localizacao = data.get('localizacao', 'Local do Confronto')  # Localização padrão se não for fornecida

        # Valida a existência das equipes
        equipe_casa = Equipes.objects.filter(id=equipe_casa_id).first()
        equipe_visitante = Equipes.objects.filter(id=equipe_visitante_id).first()
        
        if not equipe_casa or not equipe_visitante:
            return Response({"detail": "Uma ou ambas as equipes não foram encontradas."}, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=True, methods=['put'], url_path=r'atualiza-partida')
    def atualiza_partida(self, request, *args, **kwargs):
        instance = self.get_object()

        gols_casa = request.data.get('gols_Equipe_casa', instance.gols_Equipe_casa)
        gols_visitante = request.data.get('gols_Equipe_visitante', instance.gols_Equipe_visitante)

        if gols_casa is not None and int(gols_casa) < 0:
            return Response({"gols_Equipe_casa": "O número de gols não pode ser menor que zero."}, status=status.HTTP_400_BAD_REQUEST)

        if gols_visitante is not None and int(gols_visitante) < 0:
            return Response({"gols_Equipe_visitante": "O número de gols não pode ser menor que zero."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()
