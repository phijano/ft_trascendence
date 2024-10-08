from django.contrib import admin
from .models import ChatGroup, GroupMessage

class ChatGroupAdmin(admin.ModelAdmin):
    list_display = ('group_name', 'users_online_count')

    def users_online_count(self, obj):
        return obj.users_online.count()
    users_online_count.short_description = 'Users Online'

class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ('group', 'author', 'body', 'created')

admin.site.register(ChatGroup, ChatGroupAdmin)
admin.site.register(GroupMessage, GroupMessageAdmin)