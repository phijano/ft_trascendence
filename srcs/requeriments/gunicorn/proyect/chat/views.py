from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .models import *
from userManagement.models import Profile

@login_required
def home(request):
    print("public_chat_room")
    print(f"request {request}")    
    try:
        room = Room.objects.get(name='public')
        user = request.user
        user_profile = Profile.objects.get(user_id=user)
        user_avatar = user_profile.avatar.url if user_profile.avatar else None

        return render(request, 'chat/chat.html', {
            'room': room,
            'user': user,
            'user_avatar': user_avatar,
        })
    except Room.DoesNotExist:
        return render(request, 'chat/error.html', {'error': 'Sala no encontrada'}, status=404)
    except Exception as e:
        return render(request, 'chat/error.html', {'error': 'Error interno'}, status=500)
    
@login_required
def private_chat_room(request, room_id):
    try:
        myroom = Room.objects.get(id=room_id)
        room = get_object_or_404(Room, id=room_id)
        
        if not myroom.users.filter(id=request.user.id).exists():
            return HttpResponseForbidden("No tienes acceso a esta sala privada.")
        
        user = request.user
        try:
            user_profile = Profile.objects.get(user_id_id=user.id)
            user_avatar = user_profile.avatar.url if user_profile.avatar else None
        except Profile.DoesNotExist:
            user_avatar = None

        other_user = room.users.exclude(id=user.id).first()
        
        context = {
            'room': myroom,
            'room_id': room_id,
            'user': user,
            'user_avatar': user_avatar,
            'is_private': True,
            'other_user': other_user
        }
        
        return render(request, 'chat/chat.html', context)
        
    except Exception as e:
        return render(request, 'chat/chat.html', {
            'error': f'Error al acceder a la sala privada: {str(e)}'
        }, status=500)