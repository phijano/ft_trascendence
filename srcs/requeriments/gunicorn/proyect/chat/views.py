from django.shortcuts import render
from .models import Room
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
    room = Room.objects.get(name='public')  # Cargamos la sala "public"
    return render(request, 'chat/chat.html', {'room': room})

""" @login_required
def home(request):
    return render(request, 'chat/simple.html')  """

""" @login_required
def home(request):
    return render(request, 'chat/chat2.html') """