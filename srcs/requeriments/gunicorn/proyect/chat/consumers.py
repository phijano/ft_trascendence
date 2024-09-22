from channels.generic.websocket import WebsocketConsumer

class ChatroomConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    """ def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        # Puedes parsear y manejar datos JSON entrantes
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Enviar mensaje de vuelta al cliente
        self.send(text_data=json.dumps({
            'message': message
        })) """