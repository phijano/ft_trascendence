from django.contrib import admin
from .models import *

@admin.register(Room)
class Room(admin.ModelAdmin):
    list_display = ('name', 'is_private', 'status', 'created_at')
    list_filter = ('is_private', 'status')
    search_fields = ('name',)
    filter_horizontal = ('users',)
    readonly_fields = ('created_at',)

@admin.register(ChatInvitation)
class ChatInvitation(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('sender__username', 'receiver__username')
    readonly_fields = ('created_at',)

@admin.register(Message)
class Message(admin.ModelAdmin):
    list_display = ('room', 'user', 'timestamp', 'content')
    list_filter = ('room', 'user')
    search_fields = ('content',)
    readonly_fields = ('timestamp',)

@admin.register(Block)
class Block(admin.ModelAdmin):
    list_display = ('blocker', 'blocked', 'created_at')
    search_fields = ('blocker__username', 'blocked__username')
    readonly_fields = ('created_at',)