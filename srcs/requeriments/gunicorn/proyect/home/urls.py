from django.urls import path
from . import views

urlpatterns = [
        path("", views.index, name='index'),
        path("test", views.index, name='test'),
        path("test/", views.index, name='test'),
        path("pong", views.index, name='pong'),
        path("pong/", views.index, name='pong'),  
        path("signup", views.index, name='login'),
        path("signup/", views.index, name='login'),
        path("login", views.index, name='login'),
        path("login/", views.index, name='login'),
        path("templates/<str:html>", views.templates, name='templates'),
]
