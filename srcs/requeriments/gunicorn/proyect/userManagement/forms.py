from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.utils.safestring import mark_safe
from django.contrib.auth.forms import AuthenticationForm

class SignUpForm(UserCreationForm):
    email = forms.EmailField(
        max_length=200, 
        help_text=mark_safe('<span class="orbitron-font-small">Required. Enter a valid email address.</span>'),
    )

    username = forms.CharField(
        help_text= mark_safe('<span class="orbitron-font-small">Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.</span>'),
    )

    password1 = forms.CharField(
       help_text= mark_safe(
        '<span class="orbitron-font-small">Your password can not be too similar to your other personal information.<br></span>'
        '<span class="orbitron-font-small">Your password must contain at least 8 characters.<br></span>'
        '<span class="orbitron-font-small">Your password can not be a commonly used password.<br></span>'
        '<span class="orbitron-font-small">Your password can not be entirely numeric.</span>'
        ),
        widget=forms.PasswordInput
    )

    password2 = forms.CharField(
        help_text=mark_safe('<span class="orbitron-font-small">Enter the same password as before, for verification.</span>'),
        widget=forms.PasswordInput
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

