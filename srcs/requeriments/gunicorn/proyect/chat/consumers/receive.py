import json
from chat.models import *
from userManagement.models import Profile
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User
from chat.consumers.users import connected_users_by_room
import time


class ReceiveMixin:
    def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', '')

        try:
            data = json.loads(text_data)

            if message_type == 'block_user':
                self.block_user(data['user_id'])
            elif message_type == 'unblock_user':
                self.unblock_user(data['user_id'])
            elif message_type == 'disconnect_user':
                self.handle_disconnect_user()
            elif message_type == 'reconnect_user':
                self.handle_reconnect_user()
            elif message_type == 'private_chat_request':
                self.handle_private_chat_request(data)
            elif message_type == 'accept_private_chat':
                self.handle_accept_private_chat(data)
            elif message_type == 'reject_private_chat':
                self.handle_reject_private_chat(data)
            elif message_type == 'message':
                self.handle_message(data)
            else:
                self.handle_message(data)

        except json.JSONDecodeError as e:
            print('Error al decodificar el mensaje: ', e)
        except KeyError as e:
            print('Error al obtener el mensaje: ', e)
        except Exception as e:
            print('Error: ', e)
            
    def handle_disconnect_user(self):
        print(f'Disconnect user: {self.username}')
        if self.user.is_authenticated:
            if self.id in connected_users_by_room:
                connected_users_by_room[self.id].discard(self.user)
                if not connected_users_by_room[self.id]:
                    del connected_users_by_room[self.id]
            self.broadcast_user_list()

    def handle_reconnect_user(self):
        print(f'Reconnect user: {self.username}')
        if self.user.is_authenticated:
            if self.id not in connected_users_by_room:
                connected_users_by_room[self.id] = set()
            connected_users_by_room[self.id].add(self.user)
            self.broadcast_user_list()

    # ? función para manejar la solicitud de chat privado
    def handle_private_chat_request(self, data):
        target_user_id = data.get('target_user_id')
        if not target_user_id:
            print("Error: 'target_user_id' no está presente en los datos recibidos.")
            return

        # Obtiene el usuario objetivo
        target_user = User.objects.get(id=target_user_id)
        sender = self.user

        try:
            # Crear una nueva sala privada
            room = Room.objects.create(
                name=f'private_{sender.id}_{target_user.id}_{int(time.time())}',
                is_private=True,
                status='pending'
            )
            room.users.add(sender, target_user)

            # Crear la invitación en la base de datos
            ChatInvitation.objects.create(
                sender=sender,
                receiver=target_user,
                room=room,
                status='pending'
            )
            
            # Envía notificación al usuario objetivo a través de WebSocket
            async_to_sync(self.channel_layer.group_send)(
                f'user_{target_user.id}',
                {
                    'type': 'private_chat_notification',
                    'message': f'{sender.username} te ha enviado una solicitud de chat privado.',
                    'sender_id': sender.id,
                    'username': sender.username,
                    'target_user_id': target_user_id,
                }
            )
            
            
        except Exception as e:
            print(f'Error al crear la invitación de chat: {e}')

    def handle_accept_private_chat(self, data):
        sender_id = data['sender_id']
        sender = User.objects.get(id=sender_id)
        receiver = self.user

        try:
            # Actualizar el estado de la invitación
            invitation = ChatInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                status='pending'
            )
            invitation.status = 'accepted'
            invitation.save()

            # Actualizar el estado de la sala
            if invitation.room:
                invitation.room.status = 'active'
                invitation.room.save()

            # Notifica al remitente que su invitación fue aceptada
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'private_chat_accepted',
                    'message': f'{receiver.username} ha aceptado tu solicitud de chat privado.',
                    'receiver_id': receiver.id,
                    'sender_id': sender_id,
                    'room_id': invitation.room.id if invitation.room else None,
                }
            )
        except ChatInvitation.DoesNotExist:
            print(f'No se encontró la invitación pendiente entre {sender} y {receiver}')
        except Exception as e:
            print(f'Error al aceptar la invitación de chat: {e}')
            
    def handle_reject_private_chat(self, data):
        sender_id = data['sender_id']
        sender = User.objects.get(id=sender_id)
        receiver = self.user

        try:
            # Actualizar el estado de la invitación
            invitation = ChatInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                status='pending'
            )
            invitation.status = 'decline'
            invitation.save()

            # Actualizar el estado de la sala
            if invitation.room:
                invitation.room.status = 'decline'
                invitation.room.save()

            # Notifica al remitente que su invitación fue aceptada
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'private_chat_rejected',
                    'message': f'{receiver.username} ha rechazado tu solicitud de chat privado.',
                    'receiver_id': receiver.id,
                    'sender_id': sender_id,
                    'room_id': invitation.room.id if invitation.room else None,
                }
            )
        except ChatInvitation.DoesNotExist:
            print(f'No se encontró la invitación pendiente entre {sender} y {receiver}')
        except Exception as e:
            print(f'Error al aceptar la invitación de chat: {e}')

    def handle_message(self, data):
        message = data['message']

        if self.user.is_authenticated:
            sender_id = self.scope['user'].id
            sender_profile = Profile.objects.get(user_id=sender_id)
            sender_avatar = sender_profile.avatar.url if sender_profile.avatar else None
        else:
            sender_id = None
            sender_avatar = None

        # Verificar si el usuario está bloqueado
        if self.is_user_blocked(sender_id):
            self.send_blocked_notification()
            return

        if sender_id:
            self.save_message(sender_id, message)
            self.send_chat_message(message, sender_id, sender_avatar)
        else:
            print('Usuario no autenticado')

    def save_message(self, sender_id, message):
        room = Room.objects.get(name=self.id)
        Message.objects.create(user_id=sender_id, content=message, room=room)

    def send_chat_message(self, message, sender_id, avatar):
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, {
            'type': 'chat_message',
            'message': message,
            'username': self.user.username,
            'sender_id': sender_id,
            'avatar': avatar,
        })
