from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a superuser and three regular users with specific passwords'

    def handle(self, *args, **kwargs):
        # Create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            self.stdout.write(self.style.SUCCESS('Superuser "admin" created successfully.'))
        else:
            self.stdout.write(self.style.WARNING('Superuser "admin" already exists.'))

        # Create regular users
        users = [
            {'username': 'agus', 'password': 'kali'},
            {'username': 'rdelicad', 'password': 'kali'},
            {'username': 'pespinos', 'password': 'kali'},
        ]

        for user in users:
            if not User.objects.filter(username=user['username']).exists():
                try:
                    User.objects.create_user(user['username'], password=user['password'])
                    self.stdout.write(self.style.SUCCESS(f'User "{user["username"]}" created successfully with password "{user["password"]}".'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error creating user "{user["username"]}": {e}'))
            else:
                self.stdout.write(self.style.WARNING(f'User "{user["username"]}" already exists.'))
