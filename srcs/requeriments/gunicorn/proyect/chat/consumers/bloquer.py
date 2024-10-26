from chat.models import Block
import json

class BloquerUserMixin:
    def is_user_blocked(self, sender_id):
        return Block.objects.filter(blocker=self.user, blocked_id=sender_id).exists()

    def block_user(self, blocked_user_id):
        Block.objects.get_or_create(blocker=self.user, blocked_id=blocked_user_id)
        print('Usuario bloqueado')

    def unblock_user(self, blocked_user_id):
        Block.objects.filter(blocker=self.user, blocked_id=blocked_user_id).delete()
        print('Usuario desbloqueado')

    def send_blocked_notification(self):
        self.send(text_data=json.dumps({
            'type': 'error',
            'message': 'Estás bloqueado para enviar mensajes en este chat.',
        }))