from django.shortcuts import render
from .models import Room
from django.contrib.auth.decorators import login_required
from userManagement.models import Profile

@login_required
def home(request):
    room = Room.objects.get(name='public')  # Cargamos la sala "public"
    user = request.user # Cargamos el usuario
    user_profile = Profile.objects.get(user_id=user)  # Accedemos al perfil del usuario
    user_avatar = user_profile.avatar.url if user_profile.avatar else None  # Cargamos la imagen de perfil del usuario, manejando el caso si no hay avatar
    return render(request, 'chat/chat.html', {
        'room': room,
        'user': user,
        'user_avatar': user_avatar,
    })

