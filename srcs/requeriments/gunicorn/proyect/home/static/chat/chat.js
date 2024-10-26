window.initializeChat = function() {
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');

    const wsUrl = `ws://${window.location.host}/ws/chat/${room}/`;
    const chatSocket = new WebSocket(wsUrl);

    // Mapa para usuarios conectados
    let connectedUserMap = new Map();
    let blockedUsers = new Set(); // Para rastrear usuarios bloqueados

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
                handleChatMessage(data);
                break;
            default:
                console.warn('Tipo de mensaje desconocido:', data.type);
        }
    }

    // Manejar el mensaje del chat
    function handleChatMessage(data) {
        const { message, username, avatar } = data;

        if (blockedUsers.has(username)) {
            console.log(`Mensaje de ${username} bloqueado y no guardado.`);
            return; // No mostrar ni guardar mensajes de usuarios bloqueados
        }

        if (message && username) {
            displayChatMessage(message, username, avatar);
        }
    }

    // Muestra un mensaje en el chat
    function displayChatMessage(message, username, avatar) {
        boxMessages.innerHTML += `
            <div class="message-container">
                <img src="${avatar}" class="avatar mt-1" alt="Avatar">
                <div class="message received">${message}</div>
            </div>
            <div class="user-info" style="margin-top: -10px; margin-left: 50px">
                <small class="text-">${username}</small>
            </div>
        `;
        scrollToBottom();
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
            chatSocket.send(JSON.stringify({
                'type': 'chat_message',
                'message': messageValue,
                'username': user,
            }));
            scrollToBottom();
            messageInput.value = ''; // Limpiar el campo de entrada
        }
    }

    // Manejo de bloqueo de usuarios
    function blockUser(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'block_user',
            'user_id': userId,
        }));
        const username = Array.from(connectedUserMap.keys()).find(u => connectedUserMap.get(u) === userId);
        if (username) {
            blockedUsers.add(username); // Agregar a la lista de usuarios bloqueados
            console.log(`${username} ha sido bloqueado.`);
        }
    }

    function unblockUser(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'unblock_user',
            'user_id': userId,
        }));
        const username = Array.from(connectedUserMap.keys()).find(u => connectedUserMap.get(u) === userId);
        if (username) {
            blockedUsers.delete(username); // Eliminar de la lista de usuarios bloqueados
            console.log(`${username} ha sido desbloqueado.`);
        }
    }

    function promptBlockUser() {
        const usernames = Array.from(connectedUserMap.keys());

        if (usernames.length === 0) {
            alert("No hay usuarios conectados para bloquear.");
            return;
        }

        const userList = usernames.map((username, index) => `${index + 1}. ${username}`).join("\n");
        const username = prompt(`Selecciona un usuario para bloquear:\n\n${userList}`);

        if (usernames.includes(username)) {
            const userId = connectedUserMap.get(username);
            if (userId) {
                blockUser(userId);
            }
        } else {
            console.log("Usuario no encontrado o no conectado.");
        }
    }

    function promptUnblockUser() {
        const usernames = Array.from(connectedUserMap.keys());

        if (usernames.length === 0) {
            alert("No hay usuarios conectados para desbloquear.");
            return;
        }

        const userList = usernames.map((username, index) => `${index + 1}. ${username}`).join("\n");
        const username = prompt(`Selecciona un usuario para desbloquear:\n\n${userList}`);

        if (usernames.includes(username)) {
            const userId = connectedUserMap.get(username);
            if (userId) {
                unblockUser(userId);
            }
        } else {
            console.log("Usuario no encontrado o no conectado.");
        }
    }

    // Actualiza la lista de usuarios conectados
    function updateConnectedUsers(users) {
        connectedUserMap.clear();
        users.forEach(user => {
            connectedUserMap.set(user.username, user.id);
        });

        const connectedUsersList = document.getElementById('connectedUsersList');
        if (!connectedUsersList) {
            return;
        }

        connectedUsersList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <span>${user.username}</span>
                <button class="btn btn-danger btn-sm ms-2" onclick="blockUser(${user.id})">Block</button>
                <button class="btn btn-success btn-sm ms-1" onclick="unblockUser(${user.id})">Unblock</button>
            `;
            connectedUsersList.appendChild(userItem);
        });
    }

    // Configurar eventos
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Exponer funciones de bloqueo y desbloqueo al ámbito global
    window.blockUser = blockUser;
    window.unblockUser = unblockUser;
};

document.addEventListener('DOMContentLoaded', () => {
    window.initializeChat();
});
