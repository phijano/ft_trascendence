from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    # Nombre único para identificar la sala
    name = models.CharField(max_length=100, unique=True, verbose_name='name')
    # Relación muchos a muchos con usuarios que están en la sala
    users = models.ManyToManyField(User, related_name='rooms_joined', verbose_name='users')
    # Indica si es una sala privada (true) o pública (false)
    is_private = models.BooleanField(default=False, verbose_name='is private')
    # Estado de la sala: 'pending', 'active', 'closed'
    status = models.CharField(max_length=20, default='pending')
    # Indica si la sala está activa o ha sido cerrada
    is_active = models.BooleanField(default=True)
    # Fecha y hora de creación de la sala
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages', verbose_name='room')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages', verbose_name='user')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='timestamp')
    content = models.TextField(verbose_name='content')

    def __str__(self):
        return f'{self.user.username} @ {self.room.name}: {self.content}'

class Block(models.Model):
    blocker = models.ForeignKey(User, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(User, related_name='blocked', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')  # Evita bloqueos duplicados

class ChatInvitation(models.Model):
    # Usuario que envía la invitación
    sender = models.ForeignKey(User, related_name='sent_invites', on_delete=models.CASCADE)
    # Usuario que recibe la invitación
    receiver = models.ForeignKey(User, related_name='received_invites', on_delete=models.CASCADE)
    # Sala asociada a la invitación (puede ser null hasta que se acepte)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    # Estado de la invitación: 'pending', 'accepted', 'rejected'
    status = models.CharField(max_length=20, default='pending')
    # Fecha y hora de creación de la invitación
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Evita que existan múltiples invitaciones entre los mismos usuarios
        unique_together = ('sender', 'receiver')
