from django.shortcuts import render
from django import http
from django.http import HttpResponse, Http404
from django.views.generic import View 
from .models import Match
from userManagement.models import Profile
from .forms import MatchCreationForm

# Create your views here.

def pong(request):
    match_id = request.GET.get('match_id')
    is_sender = request.GET.get('is_sender')
    context = {
        'match_id': match_id,
        'is_sender': is_sender,
    }
    if request.user.is_authenticated:
        userProfile = Profile.objects.get(user_id=request.user)
        context['profile'] = userProfile
    return render(request, "pong.html", context)

class SaveMatch(View):

    def post(self, request):
        form = MatchCreationForm(request.POST)

        if form.is_valid():
            match = form.save(commit="False")
            leftPlayer = request.POST.get("left_player")
            userProfile = Profile.objects.get(user_id=request.user.id)
            if (userProfile.nick == leftPlayer):
                match.player = Profile.objects.get(user_id=request.user.id)
            else:
                match.opponent = Profile.objects.get(user_id=request.user.id)
            match.save()
            return http.HttpResponse(status=201)
        return http.JsonResponse(form.errors.get_json_data(), status=400)
