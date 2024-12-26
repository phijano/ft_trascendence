from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )
    name = models.CharField(max_length=100, unique=True, verbose_name='name')
    users = models.ManyToManyField(User, related_name='rooms_joined', verbose_name='users')
    is_private = models.BooleanField(default=False, verbose_name='is private')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
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
        unique_together = ('blocker', 'blocked')  # Prevent duplicate blocks

class ChatInvitation(models.Model):
    sender = models.ForeignKey(User, related_name='sent_invites', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_invites', on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent multiple invitations between the same users
        pass
