from django.contrib import admin
from .models import Partida

@admin.register(Partida)
class PartidaAdmin(admin.ModelAdmin):
    list_display = ('campeonato', 'Equipe_casa', 'Equipe_visitante', 'data', 'localizacao', 'gols_Equipe_casa', 'gols_Equipe_visitante')
    search_fields = ('campeonato__nome', 'Equipe_casa__nome', 'Equipe_visitante__nome')
    list_filter = ('data',)
