from django import forms
from .models import Match

class MatchCreationForm(forms.ModelForm):
    class Meta:
        model = Match
        fields = [
            'opponent_name',
            'player_score',
            'opponent_score',
            'match_type',
        ]
