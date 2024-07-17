from django.shortcuts import render
###
from django import http
from django.views.generic import View
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm

# Create your views here.

def index(request):
    return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)

class UserLogIn(View):

    def get(self, request):
        if not request.user.is_authenticated:
            return http.HttpResponseForbidden()
        return http.JsonResponse({
            "id": request.user.pk,
            "username": request.user.get_username(),
            })

    def post(self, request):
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return self.get(request)
        return http.JsonResponse(form.errors.get_json_data(), status=400)

class UserLogOut(View):

    def get(self, request):
        logout(request)
        return http.HttpResponse(status=205)
