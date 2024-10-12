from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat_view, name='chat'),  # Ruta principal para el chat
]
