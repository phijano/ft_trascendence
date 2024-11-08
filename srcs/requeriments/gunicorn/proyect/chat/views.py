from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .models import *
from userManagement.models import Profile

@login_required
def home(request):
    room = Room.objects.get(name='public')  # Cargamos la sala "public"
    user = request.user # Cargamos el usuario
    user_profile = Profile.objects.get(user_id=user)  # Accedemos al perfil del usuario
    user_avatar = user_profile.avatar.url if user_profile.avatar else None  
    
    # Cargamos la imagen de perfil del usuario, manejando el caso si no hay avatar
    return render(request, 'chat/chat.html', {
        'room': room,
        'user': user,
        'user_avatar': user_avatar,
    })

@login_required
def private_chat_room(request, room_id):
    room = get_object_or_404(Room, id=room_id, is_private=True)
    
    # Verificar que el usuario tenga acceso a esta sala
    if not room.users.filter(id=request.user.id).exists():
        return HttpResponseForbidden("No tienes acceso a esta sala privada.")
    
    user = request.user
    try:
        user_profile = Profile.objects.get(user=user)
        user_avatar = user_profile.avatar.url if user_profile.avatar else None
    except Profile.DoesNotExist:
        user_avatar = None

    # Usar el mismo template que el chat público
    return render(request, 'chat/chat.html', {
        'room': room,
        'user': user,
        'user_avatar': user_avatar,
        'is_private': True,
        'other_user': room.users.exclude(id=user.id).first()
    })