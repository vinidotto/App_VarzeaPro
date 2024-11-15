from rest_framework import serializers
from torneios.models import Torneios
from equipes.models import Equipes

class TorneiosSerializer(serializers.ModelSerializer):
    times_participantes = serializers.PrimaryKeyRelatedField(
        queryset=Equipes.objects.all(),
        required=False,  
        many=True  
    )

    class Meta:
        model = Torneios
        fields = ['id', 'nome', 'descricao', 'data_inicio', 'data_fim', 'localizacao', 'times_participantes']
