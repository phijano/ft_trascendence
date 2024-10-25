window.initializeChat = function() {
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
    const avatar = boxMessages.getAttribute('data-avatar');

    const wsUrl = `ws://${window.location.host}/ws/chat/${room}/`;
    const chatSocket = new WebSocket(wsUrl);

    // Mapa para usuarios conectados
    let connectedUserMap = new Map();

    // Eventos del WebSocket
    chatSocket.onopen = () => console.log('Conexión abierta');
    chatSocket.onclose = () => console.error('Conexión cerrada');

    chatSocket.onmessage = (e) => handleSocketMessage(JSON.parse(e.data));

    // Manejar mensajes del WebSocket
    function handleSocketMessage(data) {
        switch (data.type) {
            case 'error':
                alert(data.message); // Notificar al usuario que fue bloqueado
                break;
            case 'user_list':
                updateConnectedUsers(data.users);
                break;
            case 'chat_message':
                displayChatMessage(data);
                break;
            default:
                console.warn('Tipo de mensaje desconocido:', data.type);
        }
    }

    // Actualiza la lista de usuarios conectados
    function updateConnectedUsers(users) {
        connectedUserMap.clear();
        users.forEach(user => {
            connectedUserMap.set(user.username, user.id);
        });
        console.log("Usuarios conectados:", connectedUserMap);
    }

    // Muestra un mensaje en el chat
    function displayChatMessage(data) {
        const { message, username, avatar } = data;
        if (message && username) {
            boxMessages.innerHTML += `
                <div class="message-container">
                    <img src="${avatar}" class="avatar mt-1" alt="Avatar">
                    <div class="message received">${message}</div>
                </div>
                <div id="user-info" class="user-info" style="margin-top: -10px; margin-left: 50px">
                    <small class="text-">${username}</small>
                </div>
            `;
            scrollToBottom();
        }
    }

    // Desplaza la vista hacia abajo
    function scrollToBottom() {
        boxMessages.scrollTop = boxMessages.scrollHeight;
    }

    // Enviar un mensaje
    function sendMessage() {
        const messageInput = document.querySelector('#inputMessage');
        const messageValue = messageInput.value.trim();
        if (messageValue !== '') {
            loadSentMessageHTML(messageValue);
            chatSocket.send(JSON.stringify({
                'type': 'chat_message',
                'message': messageValue,
                'username': user,
            }));
            scrollToBottom();
            messageInput.value = ''; // Limpiar el campo de entrada
        }
    }

    // Cargar el mensaje enviado en el chat
    function loadSentMessageHTML(message) {
        boxMessages.innerHTML += `
            <div class="message-container">
                <div class="message sent">${message}</div>
            </div>
        `;
    }

    // Manejo de bloqueo de usuarios
    function blockUser(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'block_user',
            'user_id': userId,
        }));
    }

    function unblockUser(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'unblock_user',
            'user_id': userId,
        }));
    }

    function promptBlockUser() {
        const username = prompt("Enter the username to block:");
        const userId = connectedUserMap.get(username);
        if (userId) {
            blockUser(userId);
        } else {
            console.log("Usuario no encontrado o no conectado.");
        }
    }

    function promptUnblockUser() {
        const username = prompt("Enter the username to unblock:");
        const userId = connectedUserMap.get(username);
        if (userId) {
            unblockUser(userId);
        } else {
            console.log("Usuario no encontrado o no conectado.");
        }
    }

    // Configurar eventos
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    document.querySelector('#blockUserBtn').onclick = promptBlockUser;
    document.querySelector('#unblockUserBtn').onclick = promptUnblockUser;
};

document.addEventListener('DOMContentLoaded', () => {
    window.initializeChat();
});
