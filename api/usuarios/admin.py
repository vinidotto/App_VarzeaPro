from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'nome_completo', 'telefone', 'cidade')
    search_fields = ('username', 'email', 'nome_completo')
    list_filter = ('cidade',)


