from django.contrib import admin
from .models import *

class MessageAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'timestamp', 'content')
    list_filter = ('room', 'user')

admin.site.register(Room)
admin.site.register(Message, MessageAdmin)
