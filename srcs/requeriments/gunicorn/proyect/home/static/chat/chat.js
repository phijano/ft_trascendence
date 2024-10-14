document.addEventListener('DOMContentLoaded', function() {
    const btnMessage = document.querySelector('#btnMessage');
    if (btnMessage) {
        btnMessage.addEventListener('click', function(event) {
            event.preventDefault(); // Evitar el comportamiento por defecto
            console.log('Enviando mensaje...');
        });
    } else {
        console.error('Elemento con ID "btnMessage" no encontrado.');
    }
});
/* document.addEventListener('DOMContentLoaded', (event) => {
    const chatroomName = 'public-chat'; // Cambia esto si necesitas un nombre de sala dinámico
    const chatSocket = new WebSocket(
        'ws://' + window.location.host + '/ws/chatroom/' + chatroomName + '/'
    );

    // Manejar mensajes recibidos del WebSocket
    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const messageList = document.getElementById('chat_messages');
        const messageItem = document.createElement('li');
        messageItem.innerHTML = `
            <div class="flex justify-start">
                <div class="flex items-end mr-2">
                    <a href="/profile/${data.author}">
                        <img class="w-8 h-8 rounded-full object-cover" src="${data.avatar}">
                    </a>
                </div>
                <div class="bg-white p-4 max-w-[75%] rounded-r-lg rounded-tl-lg">
                    <span>${data.body}</span>
                </div>
            </div>
        `;
        messageList.appendChild(messageItem);
        scrollToBottom();
    };

    // Manejar cierre del WebSocket
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    // Manejar envío de mensajes
    document.getElementById('chat_message_form').onsubmit = function(e) {
        e.preventDefault();
        const messageInputDom = document.getElementById('message_input');
        const message = messageInputDom.value;

        // Enviar mensaje al servidor Django
        fetch('/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                'message': message
            })
        })
        .then(response => response.json())
        .then(data => {
            // Enviar mensaje al WebSocket
            chatSocket.send(JSON.stringify({
                'message': data.body,
                'author': data.author,
                'avatar': data.avatar,
                'is_author': data.is_author
            }));
            messageInputDom.value = '';
        });
    };

    // Enviar mensaje al presionar "Enter"
    document.getElementById('message_input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('chat_message_form').submit();
        }
    });
}); */