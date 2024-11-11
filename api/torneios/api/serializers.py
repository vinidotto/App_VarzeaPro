from rest_framework import serializers
from torneios.models import Torneios

class TorneiosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Torneios
        fields = ['id','nome', 'data_inicio', 'data_fim', 'localizacao', 'times_participantes']
