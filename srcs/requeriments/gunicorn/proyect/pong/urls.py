from django.urls import path
from . import views

urlpatterns = [
        path("pong", views.pong, name='pong'),
        path("saveMatch", views.SaveMatch.as_view()), 
]
