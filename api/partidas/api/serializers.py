from rest_framework import serializers
from partidas.models import Partida
from equipes.models import Equipes
from equipes.api.serializers import EquipeSerializer

class PartidasSerializer(serializers.ModelSerializer):
    Equipe_casa = serializers.PrimaryKeyRelatedField(queryset=Equipes.objects.all())  # Aceita apenas o ID
    Equipe_visitante = serializers.PrimaryKeyRelatedField(queryset=Equipes.objects.all())  # Aceita apenas o ID

    class Meta:
        model = Partida
        fields = [
            'id', 'data', 'localizacao', 'gols_Equipe_casa', 'gols_Equipe_visitante', 
            'campeonato', 'Equipe_casa', 'Equipe_visitante'
        ]

    # Quando retornar a resposta, será retornado o serializador completo das equipes com a logo
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Recoloca os objetos das equipes no lugar dos IDs, incluindo a logo
        representation['Equipe_casa'] = EquipeSerializer(instance.Equipe_casa).data
        representation['Equipe_visitante'] = EquipeSerializer(instance.Equipe_visitante).data
        return representation
