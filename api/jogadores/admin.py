from django.contrib import admin
from .models import Jogador

@admin.register(Jogador)
class JogadorAdmin(admin.ModelAdmin):
    list_display = ('nome', 'data_nascimento', 'nacionalidade', 'posicao', 'pe_preferido', 'time')
    search_fields = ('nome', 'nacionalidade', 'time__nome')
    list_filter = ('posicao', 'pe_preferido')
