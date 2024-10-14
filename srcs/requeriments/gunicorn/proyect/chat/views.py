from django.shortcuts import render
from .models import Room
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
    rooms = Room.objects.all()
    return render(request, 'chat/chat.html', {'rooms': rooms})
