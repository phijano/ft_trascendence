from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import ChatGroup
from .forms import ChatmessageCreateForm

@login_required
def chat_view(request):
    chat_groups = get_object_or_404(ChatGroup, group_name='public-chat')
    chat_messages = chat_groups.chat_messages.all()[:30]
    form = ChatmessageCreateForm()
    
    if request.method == 'POST':
        form = ChatmessageCreateForm(request.POST)
        if form.is_valid():
            chat_message = form.save(commit=False)
            chat_message.author = request.user
            chat_message.group = chat_groups
            chat_message.save()
            return JsonResponse({
                'author': chat_message.author.username,
                'body': chat_message.body,
                'avatar': chat_message.author.profile.avatar.url,
                'is_author': chat_message.author == request.user,
            })
    
    return render(request, 'chat/chat.html', {'chat_messages': chat_messages, 'form': form})