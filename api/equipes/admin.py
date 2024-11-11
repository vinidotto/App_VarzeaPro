from django.contrib import admin
from .models import Equipes

@admin.register(Equipes)
class EquipeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cidade', 'fundacao', 'treinador')
    search_fields = ('nome', 'cidade')
