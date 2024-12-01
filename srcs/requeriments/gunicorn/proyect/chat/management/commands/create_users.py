from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Crea un superusuario y tres usuarios normales con contraseñas específicas'

    def handle(self, *args, **kwargs):
        # Crear superusuario
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            self.stdout.write(self.style.SUCCESS('Superusuario "admin" creado con éxito.'))
        else:
            self.stdout.write(self.style.WARNING('El superusuario "admin" ya existe.'))

        # Crear usuarios normales
        users = [
            {'username': 'agus', 'password': 'kali'},
            {'username': 'rdelicad', 'password': 'kali'},
            {'username': 'pespinos', 'password': 'kali'},
        ]

        for user in users:
            if not User.objects.filter(username=user['username']).exists():
                try:
                    User.objects.create_user(user['username'], password=user['password'])
                    self.stdout.write(self.style.SUCCESS(f'Usuario "{user["username"]}" creado con éxito con la contraseña "{user["password"]}".'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error creando el usuario "{user["username"]}": {e}'))
            else:
                self.stdout.write(self.style.WARNING(f'El usuario "{user["username"]}" ya existe.'))
