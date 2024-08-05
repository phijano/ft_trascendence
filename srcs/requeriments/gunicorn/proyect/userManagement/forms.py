from django import forms
from .models import Friendship
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=200, help_text='Required')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

class FriendshipCreationForm(forms.ModelForm):
    class Meta:
        model = Friendship
        fields = ()
        

