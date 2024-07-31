from django.urls import path
from .views import LogIn, LogOut, SignUp, SignUpTemplate, ActivateUser, profile, Friends, Search, matchListing

urlpatterns = [

        path("login", LogIn.as_view()),
        path("logout", LogOut.as_view()),
        path("signup", SignUp.as_view()),
        path("signup/template", SignUpTemplate.as_view()),
        path('activate/<uidb64>/<token>/', ActivateUser.as_view(), name='activate'), 
        path("profile", profile, name='profile'),
        path("friends", Friends.as_view(), name='friends'),
        path("friends/search", Search.as_view()),
        path("history", matchListing, name='history'),

]
