from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Message, BlockedUser, GameInvitation
from django.contrib.auth.models import User
from django.shortcuts import render

# Vista que muestra la página del chat
def chat_view(request):
    return render(request, 'chat/chat.html')
