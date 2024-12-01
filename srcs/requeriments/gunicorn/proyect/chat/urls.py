from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.home, name='home'),  # Accesible via /appChat/
    path('private/<int:room_id>/', views.private_chat_room, name='private_chat_room'),  # Accesible via /appChat/private/<room_id>/
]
