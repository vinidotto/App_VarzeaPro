from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from equipes.models import Equipes
from torneios.models import Torneios  
from .serializers import EquipeSerializer

class EquipeViewSet(viewsets.ModelViewSet):
    queryset = Equipes.objects.all()
    serializer_class = EquipeSerializer

    @action(detail=False, methods=['post'], url_path=r'create-for-torneio/(?P<torneio_id>\d+)')
    def create_for_torneio(self, request, torneio_id=None):
        # Quando o torneio_id for zero, não busca por um torneio
        if torneio_id != '0':
            torneio = Torneios.objects.filter(id=torneio_id).first()  
            if not torneio:
                return Response({"detail": "Torneio não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        else:
            torneio = None  # Não associa a nenhum torneio quando torneio_id for zero

        data = request.data
        serializer = EquipeSerializer(data=data)

        if serializer.is_valid():
            equipe = serializer.save()  

            # Se houver um torneio válido, associa a equipe ao torneio
            if torneio:
                torneio.times_participantes.add(equipe)  

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(detail=False, methods=['get'], url_path='por-torneio/(?P<torneio_id>\d+)')
    def equipes_por_torneio(self, request, torneio_id=None):
        # Filtra o torneio pelo ID
        torneio = Torneios.objects.filter(id=torneio_id).first()
        
        if not torneio:
            return Response({"detail": "Torneio não encontrado."}, status=404)
        
        # Recupera as equipes que estão associadas ao torneio
        equipes = torneio.times_participantes.all()  

        serializer = EquipeSerializer(equipes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='torneios')
    def torneios_por_equipe(self, request, pk=None):
        equipe = self.get_object()  
        torneios = equipe.campeonatos.all() 

        response_data = [
            {
                "id": torneio.id,
                "nome": torneio.nome,
                "descricao": torneio.descricao,
                "data_inicio": torneio.data_inicio,
                "data_fim": torneio.data_fim,
                "localizacao": torneio.localizacao,
                "times_participantes": [
                    {"id": equipe.id, "nome": equipe.nome} for equipe in torneio.times_participantes.all()
                ]
            }
            for torneio in torneios
        ]

        return Response(response_data, status=status.HTTP_200_OK)
