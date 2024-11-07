from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.home, name='home'),  # Sala pública por defecto
    path('send-invitation/<int:user_id>/', views.send_invitation, name='send_invitation'),
    #path('private-chat/<int:room_id>/', views.private_chat, name='private_chat'),
    path('accept-invitation/<int:invitation_id>/', views.accept_invitation, name='accept_invitation'),
    path('private/<int:room_id>/', views.private_chat_room, name='private_chat_room'),
]
