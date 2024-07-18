from django.urls import path
from .views import LogIn, LogOut, SignUp, SignUpTemplate

urlpatterns = [

        path("login", LogIn.as_view()),
        path("logout", LogOut.as_view()),
        path("signup", SignUp.as_view()),
        path("signup/template", SignUpTemplate.as_view(), name='signup'),
]
