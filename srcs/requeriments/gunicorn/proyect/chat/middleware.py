""" Defines a middleware in Django that ensures authenticated users 
are added to a public room called "public". Let's break down the code 
and add comments to explain each part. 

Middlewares allow modifying the incoming request before it reaches 
the view and the outgoing response before it is sent to the client. 
They are used to perform common and repetitive tasks, such as authentication, 
request logging, HTTP header manipulation, among others.
"""

from django.utils.deprecation import MiddlewareMixin
from .models import Room

# Middleware to ensure authenticated users are in the public room
class PublicRoomMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Check if the user is authenticated
        if request.user.is_authenticated:
            # Get or create a room called 'public'
            public_room, created = Room.objects.get_or_create(name='public')
            # Check if the user is not already in the 'public' room
            if not public_room.users.filter(id=request.user.id).exists():
                # Add the user to the 'public' room
                public_room.users.add(request.user)