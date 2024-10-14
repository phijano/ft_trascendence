""" define un middleware en Django que asegura que los usuarios autenticados 
sean añadidos a una sala pública llamada "public". Vamos a desglosar el código 
y añadir comentarios para explicar cada parte. 

Los middlewares permiten modificar la solicitud entrante antes de que llegue a 
la vista y la respuesta saliente antes de que se envíe al cliente. Se utilizan 
para realizar tareas comunes y repetitivas, como la autenticación, el registro 
de solicitudes, la manipulación de cabeceras HTTP, entre otras.
"""

from django.utils.deprecation import MiddlewareMixin
from .models import Room

# Middleware para asegurar que los usuarios autenticados estén en la sala pública
class PublicRoomMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Comprueba si el usuario está autenticado
        if request.user.is_authenticated:
            # Obtiene o crea una sala llamada 'public'
            public_room, created = Room.objects.get_or_create(name='public')
            # Comprueba si el usuario no está ya en la sala 'public'
            if not public_room.users.filter(id=request.user.id).exists():
                # Añade al usuario a la sala 'public'
                public_room.users.add(request.user)