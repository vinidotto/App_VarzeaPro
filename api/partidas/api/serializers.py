from rest_framework import serializers
from partidas.models import Partida
from equipes.api.serializers import EquipeSerializer

class PartidasSerializer(serializers.ModelSerializer):
    Equipe_casa = EquipeSerializer()  # Aninhando o serializador de Equipe
    Equipe_visitante = EquipeSerializer()

    class Meta:
        model = Partida
        fields = [
            'id', 'data', 'localizacao', 'gols_Equipe_casa', 'gols_Equipe_visitante', 
            'campeonato', 'Equipe_casa', 'Equipe_visitante'
        ]