from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def health(request):
    return HttpResponse("OK", status=200)

def index(request):
    return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)
