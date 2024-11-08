from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.home, name='home'),  # Sala pública por defecto -> chat/
    path('private/<int:room_id>/', views.private_chat_room, name='private_chat_room'), # Sala privada -> chat/private/<room_id>/
]
