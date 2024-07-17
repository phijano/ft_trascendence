from django.urls import path
from . import views
from home.views import UserLogIn, UserLogOut

urlpatterns = [
        path("", views.index, name='index'),
        path("userLogin", UserLogIn.as_view()),
        path("userLogout", UserLogOut.as_view()),
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
