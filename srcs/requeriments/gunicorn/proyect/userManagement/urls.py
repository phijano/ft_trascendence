from django.urls import path
from .views import LogIn, LogOut, SignUp, SignUpTemplate, ActivateUser, profile, Friends, History, Search

urlpatterns = [

        path("login", LogIn.as_view()),
        path("logout", LogOut.as_view()),
        path("signup", SignUp.as_view()),
        path("signup/template", SignUpTemplate.as_view()),
        path('activate/<uidb64>/<token>/', ActivateUser.as_view(), name='activate'), 
        path("profile", profile, name='profile'),
        path("friends", Friends.as_view(), name='friends'),
        path("friends/search", Search.as_view()),
        path("history", History.as_view(), name='history'),

]
