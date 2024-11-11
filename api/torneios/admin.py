from django.contrib import admin
from .models import Torneios

@admin.register(Torneios)
class TorneiosAdmin(admin.ModelAdmin):
    list_display = ('nome', 'data_inicio', 'data_fim', 'localizacao')
    search_fields = ('nome',)
    list_filter = ('data_inicio', 'data_fim')
