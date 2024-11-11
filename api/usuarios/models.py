from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    telefone = models.CharField(max_length=15, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    nome_completo = models.CharField(max_length=150, blank=True, null=True) 
    cidade = models.CharField(max_length=150, blank=True, null=True)  


    def __str__(self):
        return self.username
