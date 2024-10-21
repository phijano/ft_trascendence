from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='name')
    users = models.ManyToManyField(User, related_name='rooms_joined', verbose_name='users')

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages', verbose_name='room')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages', verbose_name='user')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='timestamp')
    content = models.TextField(verbose_name='content')

    def __str__(self):
        return f'{self.user.username} @ {self.room.name}: {self.content}'