from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class BlockedUser(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocking')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked')

class GameInvitation(models.Model):
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_sent')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_received')
    timestamp = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
