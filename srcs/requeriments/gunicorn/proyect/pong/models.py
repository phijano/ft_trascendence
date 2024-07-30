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
        return self.player.nick + " - " + self.match_type
