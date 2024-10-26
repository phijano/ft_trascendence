window.initializeChat = function() {
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
    const avatar = boxMessages.getAttribute('data-avatar');

    // Obtener la URL del WebSocket
    const wsUrl = `ws://${window.location.host}/ws/chat/${room}/`;
    var chatSocket = new WebSocket(wsUrl);

    // Mapa para usuarios conectados
    let connectedUserMap = new Map();
    let blockedUsers = new Set(); // Para rastrear usuarios bloqueados

    // Eventos del WebSocket
    chatSocket.onopen = (e) => console.log('Conexión abierta');
    chatSocket.onclose = (e) => console.error('Conexión cerrada');
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
    
    // Función para hacer scroll hacia abajo
    function scrollToBottom() {
        boxMessages.scrollTop = boxMessages.scrollHeight;
    }

    // Función para enviar un mensaje
    function sendMessage() {
        const messageInput = document.querySelector('#inputMessage');
        const messageValue = messageInput.value.trim();
        
        // Si el mensaje no está vacío
        if (messageValue !== '') {
            loadMessageHTML(messageValue);
            chatSocket.send(JSON.stringify({
                'type': 'chat_message',
                'message': messageValue,
                'username': user,
            }));
            scrollToBottom();
            messageInput.value = ''; // Limpiar el input
        }
    }

    // Función para cargar un mensaje en el chat
    function loadMessageHTML(m) {
        document.querySelector('#boxMessages').innerHTML += 
        `
        <!-- Mi mensaje -->
        <div class="message-container">
            <div class="message sent">${m}</div>
        </div>
        `;
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

    // Configurar eventos
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {sendMessage()}});

    // Exponer funciones de bloqueo y desbloqueo al ámbito global
    window.blockUser = blockUser;
    window.unblockUser = unblockUser;
};

// Ejecutar la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    window.initializeChat(); // Inicializamos el chat
});
