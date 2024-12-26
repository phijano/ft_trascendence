""" Ensures that after applying migrations, 
there will always be a room called "public" in the chat application. """

from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver

# Configuration for the 'chat' application
class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'

    # Override the ready method to connect signals
    def ready(self):
        # Connect the post_migrate signal to the create_default_room function
        post_migrate.connect(create_default_room, sender=self)

# Function that runs after applying migrations
@receiver(post_migrate)
def create_default_room(sender, **kwargs):
    # Check if the signal comes from the 'chat' application
    if sender.name == 'chat':
        from .models import Room
        # Create a room called 'public' if it does not exist
        Room.objects.get_or_create(name='public')