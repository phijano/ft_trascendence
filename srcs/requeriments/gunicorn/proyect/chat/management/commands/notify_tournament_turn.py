from django.core.management.base import BaseCommand
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from userManagement.models import Tournament, Match

class Command(BaseCommand):
    help = 'Notificar a los usuarios sobre su turno en el torneo'

    def handle(self, *args, **kwargs):
        ongoing_matches = Match.objects.filter(status='ongoing')
        channel_layer = get_channel_layer()

        for match in ongoing_matches:
            for player in match.players.all():
                async_to_sync(channel_layer.group_send)(
                    f"user_{player.id}",  # Enviar a un grupo de usuario específico
                    {
                        "type": "tournament.notice",
                        "message": "Es tu turno en el torneo. Prepárate para jugar.",
                    }
                )