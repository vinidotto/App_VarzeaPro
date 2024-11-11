from rest_framework import serializers
from jogadores.models import Jogador

class JogadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jogador
        fields = '__all__'
