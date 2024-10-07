from django.urls import path
from .views import *

urlpatterns = [
    path('', chat_view, name='home'),
    path('profiles/', profile, name='chat_profiles'),
]
