from django.urls import path
from . import views

urlpatterns = [
        path("", views.index, name='index'),
#test  
        path("test", views.index, name='test'),
        path("test/", views.index, name='test'),
        path("pong", views.index, name='pong'),
        path("pong/", views.index, name='pong'),
        path("templates/<str:html>", views.templates, name='templates'),
        path("sections/<int:num>", views.section, name='section'),
]
