import json
from chat.models import *
from userManagement.models import Profile
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User
from chat.consumers.users import connected_users_by_room
import time
from pong.models import Match


class ReceiveMixin:
    def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            # handlers dictionary
            message_handlers = {
                'block_user': lambda data: self.block_user(data['user_id']),
                'unblock_user': lambda data: self.unblock_user(data['user_id']),
                'disconnect_user': lambda data: self.handle_disconnect_user(),
                'reconnect_user': lambda data: self.handle_reconnect_user(),
                'private_chat_request': lambda data: self.handle_private_chat_request(data),
                'accept_private_chat': lambda data: self.handle_accept_private_chat(data),
                'reject_private_chat': lambda data: self.handle_reject_private_chat(data),
                'chat_message': lambda data: self.handle_message(data), 
                'join_private_room': lambda data: self.handle_join_private_room(data), 
                'game_invitation': lambda data: self.handle_game_invitation(data), 
                'decline_game_invitation': lambda data: self.handle_decline_game_invitation(data),
                'accept_game_invitation': lambda data: self.handle_accept_game_invitation(data),
            }

            handler = message_handlers.get(message_type)
            if handler:
                handler(data)
            else:
                print(f"Unhandled message type: {message_type}")

        except json.JSONDecodeError as e:
            print('Error decoding message: ', e)
        except KeyError as e:
            print('Error getting message: ', e)
        except Exception as e:
            print('Error: ', e)

    # ╔════════════════════════════════════════════════════════════════════════════╗
    # ║                         GAME INVITATION HANDLING FUNCTIONS                  ║
    # ╚════════════════════════════════════════════════════════════════════════════╝ 

    def handle_game_invitation(self, data):
        target_user_id = data.get('target_user_id')
        if not target_user_id:
            print("Error: 'target_user_id' is not present in received data.")
            return

        target_user = User.objects.get(id=target_user_id)
        sender = self.user

        try:
            async_to_sync(self.channel_layer.group_send)(
                f'user_{target_user.id}',
                {
                    'type': 'game_invitation',
                    'message': f'{sender.username} has invited you to play.',
                    'match_id': f'match_{sender.id}_{target_user.id}_{int(time.time())}',
                    'sender_id': sender.id,
                    'username': sender.username,
                    'target_user_id': target_user_id,
                }
            )
        except Exception as e:
            print(f'Error sending game invitation: {e}')
            
    def handle_decline_game_invitation(self, data):
        match_id = data.get('match_id')
        sender_id = data.get('sender_id')
        receiver = self.user

        try:
            async_to_sync(self.channel_layer.group_send)(
                f'user_{sender_id}',
                {
                    'type': 'game_invitation_declined',
                    'message': f'{receiver.username} has declined your game invitation.',
                    'match_id': match_id,
                    'sender_id': sender_id,
                }
            )
        except Exception as e:
            print(f'Error sending game invitation decline response: {e}')
            
    def handle_accept_game_invitation(self, data):
        match_id = data.get('match_id')
        target_user_id = data.get('target_user_id')
        receiver = self.user

        try:
            # Send notification to both users
            notification_data = {
                'type': 'game_invitation_accepted',
                'match_id': match_id,
                'match_db_id': match_id, 
                'sender_id': receiver.id  
            }
            print('receiver_id:', receiver.id)

            # Customize message for receiver
            async_to_sync(self.channel_layer.group_send)(
                f'user_{receiver.id}',
                {
                    **notification_data,
                    'message': 'Game invitation accepted! Click "Start Game" to begin.',
                }
            )

            # Customize message for sender
            async_to_sync(self.channel_layer.group_send)(
                f'user_{target_user_id}',
                {
                    **notification_data,
                    'message': f'{receiver.username} accepted your game invitation! Click "Start Game" to begin.',
                }
            )
        except Exception as e:
            print(f'Error accepting game invitation: {e}')
            
    # ╔════════════════════════════════════════════════════════════════════════════╗
    # ║                       USER CONNECTION AND DISCONNECTION                     ║
    # ╚════════════════════════════════════════════════════════════════════════════╝        
            
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
            
    # ╔═════════════════════════════════════════════════════════════════════════════╗
    # ║                  PRIVATE CHAT REQUEST AND NOTIFICATIONS                      ║
    # ╚═════════════════════════════════════════════════════════════════════════════╝
    # >>>>>>>>>>>>>>> HANDLE PRIVATE CHAT REQUEST <<<<<<<<<<<<<<
    def handle_private_chat_request(self, data):
        target_user_id = data.get('target_user_id')
        if not target_user_id:
            print("Error: 'target_user_id' is not present in received data.")
            return

        # Get target user
        target_user = User.objects.get(id=target_user_id)
        sender = self.user

        try:
            # Create a new private room
            room = Room.objects.create(
                name=f'private_{sender.id}_{target_user.id}_{int(time.time())}',
                is_private=True,
                status='pending'
            )
            room.users.add(sender, target_user)

            # Create the invitation in the database
            ChatInvitation.objects.create(
                sender=sender,
                receiver=target_user,
                room=room,
                status='pending'
            )
            
            # Send notification to the target user
            async_to_sync(self.channel_layer.group_send)(
                f'user_{target_user.id}',
                {
                    'type': 'private_chat_notification',
                    'message': f'{sender.username} has sent you a private chat request.',
                    'sender_id': sender.id,
                    'username': sender.username,
                    'target_user_id': target_user_id,
                }
            )
            
        except Exception as e:
            print(f'Error creating chat invitation: {e}')
            
    # >>>>>>>>>>>>>>> ACCEPT OR REJECT PRIVATE CHAT REQUEST <<<<<<<<<<<<<<
    def handle_accept_private_chat(self, data):
        sender_id = data['sender_id']
        sender = User.objects.get(id=sender_id)
        receiver = self.user

        try:
            # Get most recent invitation between sender and receiver
            invitation = ChatInvitation.objects.filter(
                sender=sender,
                receiver=receiver,
                status='pending'
            ).order_by('-created_at').first()
            
            if not invitation:
                print(f'No pending invitation found between {sender} and {receiver}')
                return

            # Update invitation
            invitation.status = 'accepted'
            invitation.save()

            # Update room
            room = invitation.room
            if room:
                room.status = 'accepted'
                room.save()

                # Ensure users are associated with the room
                room.users.add(sender, receiver)
                room.save()

                # Notification data
                notification_data = {
                    'type': 'private_chat_accepted',
                    'message': 'Private chat accepted',
                    'room_id': room.id,
                    'room_name': room.name,
                    'username': sender.username,  # Sender's username
                    'target_username': receiver.username  # Receiver's username
                }

                # Notify both users
                for user_id in [sender.id, receiver.id]:
                    async_to_sync(self.channel_layer.group_send)(
                        f'user_{user_id}',
                        notification_data
                    )
                    
                # Mark other pending invitations as expired
                ChatInvitation.objects.filter(
                    sender=sender,
                    receiver=receiver,
                    status='pending'
                ).exclude(id=invitation.id).update(status='expired')
        except Exception as e:
            print(f'Error accepting private chat: {e}')

    # Function to handle rejection of private chat request
    def handle_reject_private_chat(self, data):
        sender_id = data['sender_id']
        sender = User.objects.get(id=sender_id)
        receiver = self.user

        try:
            # Update invitation status
            invitation = ChatInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                status='pending'
            )
            invitation.status = 'decline'
            invitation.save()

            # Update room status
            if invitation.room:
                invitation.room.status = 'decline'
                invitation.room.save()

            # Notify sender that the invitation was rejected
            async_to_sync(self.channel_layer.group_send)(
                f'user_{sender_id}',
                {
                    'type': 'private_chat_rejected',
                    'message': f'{receiver.username} has rejected your private chat request.',
                    'receiver_id': receiver.id,
                    'sender_id': sender_id,
                }
            )
        except ChatInvitation.DoesNotExist:
            print(f'No pending invitation found between {sender} and {receiver}')
        except Exception as e:
            print(f'Error rejecting chat invitation: {e}')

    # ╔═════════════════════════════════════════════════════════════════════════════╗
    # ║                           CHAT MESSAGE HANDLING                              ║
    # ╚═════════════════════════════════════════════════════════════════════════════╝
    def handle_message(self, data):
        try:
            message = data['message']
            if not self.user.is_authenticated:
                return

            sender_id = self.user.id
            sender_profile = Profile.objects.get(user_id=sender_id)
            sender_avatar = sender_profile.avatar.url if sender_profile.avatar else None

            # Check if user is blocked
            if self.is_user_blocked(sender_id):
                self.send_blocked_notification()
                return

            # Save message
            try:
                room = Room.objects.get(name=self.id)
                Message.objects.create(user_id=sender_id, content=message, room=room)
            except Room.DoesNotExist:
                print(f"Room not found: {self.id}")
                return

            # Send message to group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': self.user.username,
                    'sender_id': sender_id,
                    'avatar': sender_avatar,
                }
            )
        except KeyError as e:
            print(f"Error getting message data: {e}")
        except Exception as e:
            print(f"Error handling message: {e}")

    def handle_join_private_room(self, data):
        try:
            room_id = data.get('room_id')
            room = Room.objects.get(id=room_id, is_private=True)
            
            # Verify that the current user belongs to the room
            if self.user in room.users.all():
                self.id = room.name  # Update room ID
                self.room_group_name = f"chat_{room.name}"
                
                # Join the private room group
                async_to_sync(self.channel_layer.group_add)(
                    self.room_group_name,
                    self.channel_name
                )
                
                print(f"User {self.user.username} joined private room {room.name}")
            else:
                print(f"User {self.user.username} does not have permission to join room {room.name}")
                
        except Room.DoesNotExist:
            print(f"Private room {room_id} not found")
        except Exception as e:
            print(f"Error joining private room: {e}")

    def handle_game_invitation(self, data):
        target_user_id = data.get('target_user_id')
        if not target_user_id:
            print("Error: 'target_user_id' is not present in received data.")
            return

        target_user = User.objects.get(id=target_user_id)
        sender = self.user

        try:
            async_to_sync(self.channel_layer.group_send)(
                f'user_{target_user.id}',
                {
                    'type': 'game_invitation',
                    'message': f'{sender.username} has invited you to play.',
                    'match_id': f'match_{sender.id}_{target_user.id}_{int(time.time())}',
                    'sender_id': sender.id,
                    'username': sender.username,
                    'target_user_id': target_user_id,
                }
            )
        except Exception as e:
            print(f'Error sending game invitation: {e}')
