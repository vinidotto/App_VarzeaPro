from django.db import models
from equipes.models import Equipes

class Jogador(models.Model):
    nome = models.CharField(max_length=100)
    data_nascimento = models.DateField()
    nacionalidade = models.CharField(max_length=50)
    altura = models.DecimalField(max_digits=4, decimal_places=2)  # Altura em metros
    peso = models.DecimalField(max_digits=5, decimal_places=2)  # Peso em kg
    posicao = models.CharField(max_length=50, choices=[
        ('atacante', 'Atacante'),
        ('meio_campo', 'Meio Campo'),
        ('defensor', 'Defensor'),
        ('goleiro', 'Goleiro'),
    ])
    pe_preferido = models.CharField(max_length=10, choices=[
        ('destro', 'Destro'),
        ('canhoto', 'Canhoto'),
        ('ambidestro', 'Ambidestro'),
    ])
    time = models.ForeignKey(Equipes, on_delete=models.SET_NULL, null=True, related_name="jogadores")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome
