from django.db import models
from equipes.models import Equipes
from torneios.models import Torneios

class Partida(models.Model):
    campeonato = models.ForeignKey(Torneios, on_delete=models.CASCADE)
    Equipe_casa = models.ForeignKey(
        Equipes,
        related_name="home_games",
        on_delete=models.CASCADE
    )
    Equipe_visitante = models.ForeignKey(
        Equipes,
        related_name="away_games",
        on_delete=models.CASCADE
    )
    data = models.DateTimeField()
    localizacao = models.CharField(max_length=100)
    gols_Equipe_casa = models.IntegerField(default=0)
    gols_Equipe_visitante = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.Equipe_casa} vs {self.Equipe_visitante} - {self.data.strftime('%d-%m-%Y')}"
