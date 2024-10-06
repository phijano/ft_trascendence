#from django.http import HttpResponse, Http404


# Create your views here.

#def chat(request):
#    return HttpResponse("<p>opopop</p>")
#    return HttpResponse("<p>CHAT</p><canvas id=\"myCanvas\" width=\"200\" height=\"100\" style=\"border:1px solid #000000;\"> </canvas>")

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import ChatGroup
from .forms import ChatmessageCreateForm
from userManagement.views import profile

@login_required
def chat_view(request):
    chat_groups = get_object_or_404(ChatGroup, group_name='public-chat')
    chat_messages = chat_groups.chat_messages.all()[:30]
    form = ChatmessageCreateForm()

    if request.htmx:
        form = ChatmessageCreateForm(request.POST)
        if form.is_valid():
            chat_message = form.save(commit=False)
            chat_message.author = request.user
            chat_message.group = chat_groups
            chat_message.save()
            context = {
                'message': chat_message,
                'user': request.user
            }
            return render(request, 'chat/partials/chat_message_p.html', context)
        
    return render(request, 'chat/chat.html', {'chat_messages': chat_messages, 'form': form})