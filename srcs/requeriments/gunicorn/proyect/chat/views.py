from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from .models import *
from django.contrib.auth.decorators import login_required
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
def send_invitation(request, user_id):
    """
    Función para enviar una invitación de chat privado a otro usuario.
    Args:
        request: Objeto HttpRequest con la información de la petición
        user_id: ID del usuario al que se quiere invitar
    Returns:
        JsonResponse con el estado de la invitación
    """
    # Obtiene el usuario destinatario a partir de su ID
    receiver = User.objects.get(id=user_id)
    
    # Crea una nueva invitación con estado pendiente por defecto
    # sender: usuario que envía la invitación (usuario actual)
    # receiver: usuario que recibe la invitación
    invitation = ChatInvitation.objects.create(
        sender=request.user,
        receiver=receiver
    )
    return JsonResponse({'status': 'sent'})

@login_required
def private_chat(request, room_id):
    """
    Función para acceder a una sala de chat privada.
    Args:
        request: Objeto HttpRequest con la información de la petición
        room_id: ID de la sala a la que se quiere acceder
    Returns:
        Renderiza la plantilla del chat privado o error 403 si no tiene acceso
    """
    # Busca la sala solicitada por su ID
    room = Room.objects.get(id=room_id)
    
    # Verifica si el usuario actual está en la lista de usuarios de la sala
    if not room.users.filter(id=request.user.id).exists():
        return HttpResponse('No autorizado', status=403)
    
    # Si tiene permiso, renderiza la vista del chat privado
    return render(request, 'chat/private_chat.html', {'room': room})

@login_required
def accept_invitation(request, invitation_id):
    """
    Función para aceptar una invitación de chat privado.
    Args:
        request: Objeto HttpRequest con la información de la petición
        invitation_id: ID de la invitación a aceptar
    Returns:
        JsonResponse con la información de la sala creada o error si no está autorizado
    """
    # Obtiene la invitación por su ID
    invitation = ChatInvitation.objects.get(id=invitation_id)
    
    # Verifica que el usuario actual sea el destinatario de la invitación
    if invitation.receiver != request.user:
        return JsonResponse({'status': 'error', 'message': 'No autorizado'})
    
    # Crea una nueva sala privada con un nombre único basado en los IDs de los usuarios
    room_name = f"private_{invitation.sender.id}_{invitation.receiver.id}"
    room = Room.objects.create(
        name=room_name,
        is_private=True,
        status='active'
    )
    
    # Añade tanto al emisor como al receptor a la sala
    room.users.add(invitation.sender, invitation.receiver)
    
    # Actualiza el estado de la invitación a 'accepted' y asocia la sala
    invitation.status = 'accepted'
    invitation.room = room
    invitation.save()
    
    # Retorna la información de la sala creada
    return JsonResponse({
        'status': 'success',
        'room_id': room.id,
        'room_name': room.name
    })

@login_required
def private_chat_room(request, room_id):
    room = get_object_or_404(Room, id=room_id, is_private=True)
    
    # Verificar si el usuario tiene permiso para acceder a la sala
    if not room.users.filter(id=request.user.id).exists():
        return HttpResponseForbidden("No tienes permiso para acceder a esta sala")
    
    # Verificar si la invitación fue aceptada
    invitation = ChatInvitation.objects.filter(
        room=room,
        status='accepted'
    ).first()
    
    if not invitation:
        return HttpResponseForbidden("Esta sala no está activa")

    messages = room.messages.order_by('timestamp')
    return render(request, 'chat/private_chat.html', {
        'room': room,
        'messages': messages,
        'room_name': room.id  # Para el WebSocket
    })

