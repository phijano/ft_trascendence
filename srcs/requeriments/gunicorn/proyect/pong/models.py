from django.db import models
from userManagement.models import Profile

# Create your models here.

class Match(models.Model):
    """
    Model that represents a match
    """

    player = models.ForeignKey(Profile, related_name='player', on_delete=models.SET_NULL, null=True)

    opponent = models.ForeignKey(Profile, related_name='opponent', on_delete=models.SET_NULL, null=True, blank=True)

    opponent_name = models.CharField(max_length=15, blank=True)

    player_score = models.IntegerField()

    opponent_score = models.IntegerField()

    date = models.DateTimeField(auto_now=True, auto_now_add=False)

    match_type = models.CharField(max_length=20)

    def __str__(self):
        """
        String that represents the particular instance of the model (for example in admin site)
        """
        text = ""
        if self.player:
            text = self.player.nick
        else:
            text = self.opponent_name
        if self.opponent:
            text = text + " VS " + self.opponent.nick
        else:
            text = text + " VS " + self.opponent_name
        return text + " " + self.match_type + " " + str(self.date)

class Tournament(models.Model):
    size = models.IntegerField()
