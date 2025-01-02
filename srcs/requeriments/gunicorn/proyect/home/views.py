from django.http import JsonResponse
from django.shortcuts import render
import os
import json

# Create your views here.
def index(request):
  return render(request, "home/index.html")

def templates(request, html):
    return render(request, "home/templates/" + html)


def get_translation(request, tag, lang):
    file_path = os.path.join(os.path.dirname(__file__), '../locale/translations.json')
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    item = next((entry for entry in data if entry['tag'] == tag), None)
    if item:
        return JsonResponse({ 'translation': item.get(lang, item['en']) }) # Default to English if the language is not found
    return JsonResponse({ 'error': 'Tag not found' }, status=404)

def get_language(request):
    from django.conf import settings
    return JsonResponse({'language_code': settings.LANGUAGE_CODE})