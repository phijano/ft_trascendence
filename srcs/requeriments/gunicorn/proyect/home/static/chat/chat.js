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
            case 'private_chat_notification':
                displayPrivateChatNotification(data);
                break;
            case 'private_chat_accepted':
                handlePrivateChatAccepted(data);
                break;
            default:
                console.warn('Tipo de mensaje desconocido:', data.type);
        }
    }

    // Función para manejar la aceptación de la solicitud
    function handlePrivateChatAccepted(data) {
        const template = document.querySelector('#privateChatAcceptedTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = data.message;
        
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    // Función para mostrar la notificación de solicitud de chat privado
    function displayPrivateChatNotification(data) {
        const template = document.querySelector('#privateChatRequestTemplate').content.cloneNode(true);
        template.querySelector('[data-content="username"]').textContent = data.username;
        
        const acceptBtn = template.querySelector('[data-action="accept"]');
        const declineBtn = template.querySelector('[data-action="decline"]');
        
        acceptBtn.onclick = () => acceptPrivateChat(data.sender_id);
        declineBtn.onclick = () => declinePrivateChat(data.sender_id);
        
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    // Función para aceptar la solicitud de chat privado
    function acceptPrivateChat(senderId) {
        chatSocket.send(JSON.stringify({
            'type': 'accept_private_chat',
            'sender_id': senderId,
        }));
        // Aquí puedes redirigir a la sala de chat privado
        // Por ejemplo: window.location.href = `/private_chat/${senderId}/`;
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
        const template = document.querySelector('#receivedMessageTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = message;
        template.querySelector('[data-content="username"]').textContent = username;
        template.querySelector('[data-content="avatar"]').src = avatar;
        
        boxMessages.appendChild(template);
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
        const template = document.querySelector('#sentMessageTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = m;
        
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    // Actualiza la lista de usuarios conectados
    function updateConnectedUsers(users) {
        connectedUserMap.clear();
        users.forEach(userObj => {
            connectedUserMap.set(userObj.username, userObj.id);
        });

        const connectedUsersList = document.getElementById('connectedUsersList');
        if (!connectedUsersList) {
            return;
        }

        connectedUsersList.innerHTML = '';
        users.forEach(userObj => {
            const template = document.querySelector('#userItemTemplate').content.cloneNode(true);
            template.querySelector('[data-content="username"]').textContent = userObj.username;
            
            const blockBtn = template.querySelector('[data-action="block"]');
            const unblockBtn = template.querySelector('[data-action="unblock"]');
            const privateBtn = template.querySelector('[data-action="private"]');
            
            blockBtn.onclick = () => blockUser(userObj.id);
            unblockBtn.onclick = () => unblockUser(userObj.id);
            
            if (userObj.username === user) {
                privateBtn.style.display = 'none'; // Ocultar el botón de chat privado para el usuario actual
            } else {
                privateBtn.onclick = () => openPrivateChat(userObj.id);
            }
            
            connectedUsersList.appendChild(template);
        });
    }

    // Función para enviar una solicitud de chat privado
    window.openPrivateChat = function(userId) {
        if (userId === connectedUserMap.get(user)) {
            console.log('No puedes enviarte una solicitud de chat privado a ti mismo.');
            return;
        }
        chatSocket.send(JSON.stringify({
            'type': 'private_chat_request',
            'target_user_id': userId,
        }));
        loadMessageHTML('Solicitud de chat privado enviada.');
    };

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

