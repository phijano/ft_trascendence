from django.db import models
from django.contrib.auth.models import User


# Create your models here.

#   User 1 --- 1 Profile 1..2 --- 0..*  Match
#   Profile 2 --- 0..* friendship

#   Profile(user_id, nick, avatar image)

#   friendship(status{pending, friends, broke})

class Profile(models.Model):
    """
    Model that represents a player profile
    """

    user_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    nick = models.CharField(max_length=15,  help_text="Introduce your avatar name")
    
    avatar = models.FileField(upload_to="avatars", blank=True)

    def __str__(self):
        """
        String that represents the particular instance of the model (for example in admin site)
        """
        return self.nick

#   Match shold go in Pong app
class Match(models.Model):
    """
    Model that represents a match
    """

    player = models.ForeignKey(Profile, related_name='player', on_delete=models.SET_NULL, null=True)

    opponent = models.ForeignKey(Profile, related_name='opponent', on_delete=models.SET_NULL, null=True, blank=True)

    opponent_name = models.CharField(max_length=15, blank=True)

    player_score = models.IntegerField()

    opponent_score = models.IntegerField()

    date = models.DateTimeField(auto_now=False, auto_now_add=False)

    match_type = models.CharField(max_length=20)

    def __str__(self):
        """
        String that represents the particular instance of the model (for example in admin site)
        """
        return self.player.nick + " - " + self.match_type 

class Friendship(models.Model):

    # status 0=pending, 1=friends

    giver = models.ForeignKey(Profile, related_name='giver', on_delete=models.SET_NULL, null=True)

    accepter = models.ForeignKey(Profile, related_name='accepter', on_delete=models.SET_NULL, null=True)

    status = models.IntegerField(default=0)

    
    def __str__(self):
        """
        String that represents the particular instance of the model (for example in admin site)
        """
        return self.giver.nick + " " + self.accepter.nick

