from channels.generic.websocket import WebsocketConsumer
import json

class ChatConsumer(WebsocketConsumer):

    def connect(self):
        print('connected')
        self.accept()

    def disconnect(self, close_code):
        print('disconnected')
        pass

    def receive(self, text_data):
        print('received')
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': message
        }))