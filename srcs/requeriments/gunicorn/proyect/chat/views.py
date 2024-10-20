from django.shortcuts import render
from .models import Room
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
    room = Room.objects.get(name='public')  # Cargamos la sala "public"
    user = request.user # Cargamos el usuario
    return render(request, 'chat/chat.html', {
        'room': room,
        'user': user,
    })

