from rest_framework import serializers
from partidas.models import Partida

class PartidasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partida
        fields = '__all__'
