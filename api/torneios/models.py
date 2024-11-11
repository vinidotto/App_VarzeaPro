from django.db import models
from equipes.models import Equipes

class Torneios(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    localizacao = models.CharField(max_length=100)
    times_participantes = models.ManyToManyField(Equipes, related_name="campeonatos")

    def __str__(self):
        return self.nome
