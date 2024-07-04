from django.shortcuts import render
from django.http import HttpResponse, Http404

# Create your views here.

def chat(request):
#    return HttpResponse("<p>opopop</p>")
    return HttpResponse("<p>CHAT</p><canvas id=\"myCanvas\" width=\"200\" height=\"100\" style=\"border:1px solid #000000;\"> </canvas>")

