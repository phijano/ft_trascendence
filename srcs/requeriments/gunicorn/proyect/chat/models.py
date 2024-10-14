from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='name')
    users = models.ManyToManyField(User, related_name='rooms_joined', verbose_name='users')

    def __str__(self):
        return self.name

