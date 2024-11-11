from django.db import models

class Equipes(models.Model):
    nome = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100, null=True, blank=True)
    fundacao = models.DateField(null=True, blank=True)
    treinador = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.nome
