""" asegura que, después de aplicar las migraciones, 
siempre habrá una sala llamada "public" en la aplicación chat. """


from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver

# Configuración de la aplicación 'chat'
class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'

    # Sobrescribe el método ready para conectar señales
    def ready(self):
        # Conecta la señal post_migrate a la función create_default_room
        post_migrate.connect(create_default_room, sender=self)

# Función que se ejecuta después de aplicar las migraciones
@receiver(post_migrate)
def create_default_room(sender, **kwargs):
    # Comprueba si la señal proviene de la aplicación 'chat'
    if sender.name == 'chat':
        from .models import Room
        # Crea una sala llamada 'public' si no existe
        Room.objects.get_or_create(name='public')