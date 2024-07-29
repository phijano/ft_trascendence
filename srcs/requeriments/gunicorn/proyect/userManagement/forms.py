from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Match

class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=200, help_text='Required')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')


class MatchCreationForm(forms.ModelForm):
    class Meta:
        model = Match
        fields = [
            'opponent_name',
            'player_score',
            'opponent_score',
            'match_type',
        ]
