from django.shortcuts import render
from django.http import HttpResponse, Http404

# Create your views here.

def index(request):
    return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)
