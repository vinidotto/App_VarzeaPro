from rest_framework import serializers
from equipes.models import Equipes

class EquipeSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()  

    class Meta:
        model = Equipes
        fields = ['id', 'nome', 'cidade', 'fundacao', 'treinador', 'logo', 'logo_url']  

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None
