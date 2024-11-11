from rest_framework import serializers
from equipes.models import Equipes

class EquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipes
        fields = ['nome']
