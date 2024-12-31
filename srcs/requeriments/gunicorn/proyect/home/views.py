from django.shortcuts import render
from django.utils.translation import gettext as _

# Create your views here.
def index(request):
  test = _("Hello World")
  print(test)
  return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)