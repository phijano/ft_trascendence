from django.urls import path
from .views import LogIn, LogOut, SignUp, SignUpTemplate, ActivateUser

urlpatterns = [

        path("login", LogIn.as_view()),
        path("logout", LogOut.as_view()),
        path("signup", SignUp.as_view()),
        path("signup/template", SignUpTemplate.as_view()),
        path('activate/<uidb64>/<token>/', ActivateUser.as_view(), name='activate'),
]
