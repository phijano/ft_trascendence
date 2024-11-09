from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .models import *
from userManagement.models import Profile
import logging

logger = logging.getLogger(__name__)

@login_required
def home(request):
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
        logger.error("Sala pública no encontrada")
        return render(request, 'chat/error.html', {'error': 'Sala no encontrada'}, status=404)
    except Exception as e:
        logger.error(f"Error en home: {str(e)}")
        return render(request, 'chat/error.html', {'error': 'Error interno'}, status=500)
    
@login_required
def private_chat_room(request, room_id):
    try:
        logger.info(f"Accediendo a sala privada: {room_id}")
        room = get_object_or_404(Room, id=room_id)
        
        # Debug logs
        logger.info(f"Room users: {list(room.users.all())}")
        logger.info(f"Current user: {request.user}")
        
        # Verificar que el usuario actual es parte de la sala
        if not room.users.filter(id=request.user.id).exists():
            logger.warning(f"Usuario {request.user.id} intentó acceder a sala {room_id} sin permiso")
            return HttpResponseForbidden("No tienes acceso a esta sala privada.")
        
        user = request.user
        try:
            user_profile = Profile.objects.get(user_id_id=user.id)
            user_avatar = user_profile.avatar.url if user_profile.avatar else None
        except Profile.DoesNotExist:
            logger.warning(f"Perfil no encontrado para usuario {user.id}")
            user_avatar = None

        other_user = room.users.exclude(id=user.id).first()
        
        context = {
            'room': room,
            'room_id': room_id,
            'user': user,
            'user_avatar': user_avatar,
            'is_private': True,
            'other_user': other_user
        }
        
        logger.info(f"Renderizando chat privado con contexto: {context}")
        return render(request, 'chat/chat.html', context)
        
    except Exception as e:
        logger.error(f"Error en private_chat_room: {str(e)}", exc_info=True)
        return render(request, 'chat/chat.html', {
            'error': f'Error al acceder a la sala privada: {str(e)}'
        }, status=500)