from django.shortcuts import render
from django.http import HttpResponse, Http404

# Create your views here.

def index(request):
    return render(request, "home/index.html")

def test(request):
    return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)

texts = ["sim", "tot", "foo"]

def section(request, num):
    if 1 <= num <= 3:
        return HttpResponse(texts[num - 1])
    else:
        raise Http404("No such section")

