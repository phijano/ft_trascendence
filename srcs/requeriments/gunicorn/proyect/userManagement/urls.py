from django.urls import path
from .views import LogIn, LogOut, SignUp, SignUpTemplate, ActivateUser, profile, ChangeNick, ChangeAvatar, search, friends, pending, invited, matches, DeleteFriend, AcceptFriend, SendInvitation

urlpatterns = [

        path("login", LogIn.as_view()),
        path("logout", LogOut.as_view()),
        path("signup", SignUp.as_view()),
        path("signup/template", SignUpTemplate.as_view()),
        path('activate/<uidb64>/<token>/', ActivateUser.as_view(), name='activate'), 
        path("profile", profile, name='profile'),
        path("changeNick", ChangeNick.as_view()),
        path("changeAvatar", ChangeAvatar.as_view()),
        path("friends", friends, name='friends'),
        path("friends/pending", pending, name='friends_pending'),
        path("friends/invited", invited, name='friends_invited'),
        path("friends/search", search, name='search'),
        path("acceptFriend", AcceptFriend.as_view()),
        path("deleteFriend", DeleteFriend.as_view()),
        path("inviteFriend", SendInvitation.as_view()),
        path("history", matches, name='history'),

]
