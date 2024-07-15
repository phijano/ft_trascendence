from django.urls import path
from . import views
#
from home.views import UserView 

urlpatterns = [
        path("", views.index, name='index'),
#test  
        path("test", UserView.as_view()),
        path("test/", views.index, name='test'),
        path("pong", views.index, name='pong'),
        path("pong/", views.index, name='pong'), 
        path("login", views.index, name='login'),
        path("login/", views.index, name='login'),
        path("templates/<str:html>", views.templates, name='templates'),
]
