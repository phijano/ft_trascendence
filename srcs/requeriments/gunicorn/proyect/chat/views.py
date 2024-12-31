from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .models import *
from userManagement.models import Profile
from django.http import JsonResponse

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
        return render(request, 'chat/error.html', {'error': 'Room not found'}, status=404)
    except Exception as e:
        return render(request, 'chat/error.html', {'error': 'Internal error'}, status=500)
    
@login_required
def private_chat_room(request, room_id):
    try:
        room = get_object_or_404(Room, id=room_id)
        other_user = room.users.exclude(id=request.user.id).first()
        
        return JsonResponse({
            'room_name': room.name,
            'room_id': room.id,
            'other_user': other_user.username if other_user else None,
            'is_private': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)