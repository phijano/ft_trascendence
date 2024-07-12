"""
URL configuration for trascendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("home.urls")), 
    path('accounts/', include("django.contrib.auth.urls")),
#    path('accounts/login/[name="login"]', include("django.contrib.auth.urls")),
#    path('accounts/logout/[name="logout"]', include("django.contrib.auth.urls")),
#    path('accounts/password_change/[name="password_change"]', include("django.contrib.auth.urls")),
#    path('accounts/password_change/done/[name="password_change_done"]', include("django.contrib.auth.urls")),
#    path('accounts/password_reset/[name="password_reset"]', include("django.contrib.auth.urls")),
#    path('accounts/password_reset/done/[name="password_reset_done"]', include("django.contrib.auth.urls")),
#    path('accounts/reset/<uidb64>/<token>/[name="password_reset_confirm"]', include("django.contrib.auth.urls")),
#    path('accounts/reset/done/[name="password_reset_complete"]', include("django.contrib.auth.urls")),

    #    path('pong/', include("pong.urls")),
    path('chat/', include("chat.urls")),
]
