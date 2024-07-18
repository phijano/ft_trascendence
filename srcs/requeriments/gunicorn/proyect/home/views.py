from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)
