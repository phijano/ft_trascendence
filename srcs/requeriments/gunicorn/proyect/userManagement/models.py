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
    
#    avatar = models.ImageField(upload_to="avatars")

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

    player = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)

#    opponent = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)

    opponent_name = models.CharField(max_length=15)

    player_score = models.IntegerField()

    opponent_score = models.IntegerField()

    date = models.DateTimeField(auto_now=False, auto_now_add=False)

    match_type = models.CharField(max_length=20)

    def __str__(self):
        """
        String that represents the particular instance of the model (for example in admin site)
        """
        return self.nick

class Friendship(models.Model):
#    class Status(models.IntegerChoices):
#        FRIENDS = 0
#        PENDING = 1

    player = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)

#    friend = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)

#    status = models.IntegerField(choices=Status)

