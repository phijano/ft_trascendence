window.initializeChat = function() {
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
    const avatar = boxMessages.getAttribute('data-avatar');

    // Determinar si estamos en una sala privada
    const isPrivate = window.location.pathname.includes('/private/');
    
    // Modificar la construcción de la URL del WebSocket
    const wsUrl = isPrivate ? 
        `ws://${window.location.host}/ws/chat/private/${room}/` :
        `ws://${window.location.host}/ws/chat/${room}/`;
    
    var chatSocket = new WebSocket(wsUrl);

    // Mapa para usuarios conectados
    let connectedUserMap = new Map(); // Para rastrear usuarios conectados
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
            case 'private_chat_rejected':
                handlePrivateChatRejected(data);
                break;
            case 'room_list':
                updateRoomsPanel(data.rooms);
                break;
            default:
                console.warn('Tipo de mensaje desconocido:', data.type);
        }
    }

    // ╔═══════════════════════════════════════════════════════════════════════╗
    // ║                           FUNCIONES DE CHAT PRIVADO                         ║
    // ╚═════════════════════════════════════════════════════════════════════════════╝

    // Enviar una solicitud de chat privado
    function openPrivateChat(userId) {
        if (userId === connectedUserMap.get(user)) {
            console.log(`userId: ${userId} (tipo: ${typeof userId})`);
            console.log(`ID del usuario actual: ${connectedUserMap.get(user)} (tipo: ${typeof connectedUserMap.get(user)})`);
            console.log('No puedes enviarte una solicitud de chat privado a ti mismo.');
            return;
        }
        chatSocket.send(JSON.stringify({
            'type': 'private_chat_request',
            'target_user_id': userId,
        }));
        loadMessageHTML('Solicitud de chat privado enviada.');
    }

    function declinePrivateChat(senderId) {
        const message = {
            'type': 'reject_private_chat',
            'sender_id': senderId
        };
        chatSocket.send(JSON.stringify(message));
    }

    // Template para mostrar la notificación de solicitud de chat privado rechazada
    function handlePrivateChatRejected(data) {
        const template = document.querySelector('#privateChatDeclinedTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = data.message;
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    // Template para mostrar la notificación de solicitud de chat privado
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

    // JSON para aceptar o rechazar la solicitud de chat privado por WebSocket
    function acceptPrivateChat(senderId) {
        chatSocket.send(JSON.stringify({
            'type': 'accept_private_chat',
            'sender_id': senderId,
            'username': user, //nombre de usuario actual
        }));
    }

    // Template para mostrar la notificación de chat privado aceptado
    function handlePrivateChatAccepted(data) {
        // Clona el template de notificación
        const template = document.querySelector('#privateChatAcceptedTemplate').content.cloneNode(true);
        // Establece el mensaje
        template.querySelector('[data-content="message"]').textContent = data.message;
        // Lo añade al chat
        boxMessages.appendChild(template);
        
        // Crear botón "Ir al Chat"
        const goToChatBtn = document.createElement('button');
        goToChatBtn.textContent = 'Ir al Chat';
        goToChatBtn.classList.add('go-to-chat-btn');
        
        // Modificar el evento onclick para usar privateChat en lugar de redirección
        goToChatBtn.onclick = () => {
            privateChat(data);
        };
        
        boxMessages.appendChild(goToChatBtn);
        scrollToBottom();
    }

    function privateChat(data) {
        console.log('Iniciando chat privado:', data); // Debug
    
        // Limpiar mensajes anteriores
        boxMessages.innerHTML = '';
        
        // Actualizar atributos del contenedor
        boxMessages.setAttribute('data-room', data.room_name);
        boxMessages.setAttribute('data-private', 'true');
        
        // Actualizar título del chat
        const chatTitle = document.querySelector('h1');
        if (chatTitle) {
            const currentUser = boxMessages.getAttribute('data-user');
            console.log('Usuario actual:', currentUser); // Debug
            console.log('Data username:', data.username); // Debug
            console.log('Data target username:', data.target_username); // Debug
            
            const otherUsername = currentUser === data.username ? 
                data.target_username : data.username;
            
            console.log('Nombre seleccionado:', otherUsername); // Debug
            chatTitle.textContent = `Chat privado con ${otherUsername}`;
        }
        
        // Ocultar botones que no se necesitan en chat privado
        const usersBtn = document.querySelector('#usersBtn');
        if (usersBtn) {
            usersBtn.style.display = 'none';
        }
    
        // Actualizar la URL sin recargar la página
        const newUrl = `/chat/private/${data.room_id}/`;
        window.history.pushState({ roomId: data.room_id }, '', newUrl);
    
        // Reconectar WebSocket para la sala privada
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.close();
        }
    
        // Crear nueva conexión WebSocket para la sala privada
        const wsUrl = `ws://${window.location.host}/ws/chat/private/${data.room_id}/`;
        chatSocket = new WebSocket(wsUrl);
        
        // Reinicializar eventos del WebSocket
        chatSocket.onopen = (e) => {
            console.log('Conexión privada abierta');
            chatSocket.send(JSON.stringify({
                'type': 'join_private_room',
                'room_id': data.room_id,
                'username': boxMessages.getAttribute('data-user')
            }));
        };
        
        chatSocket.onclose = (e) => console.error('Conexión privada cerrada');
        chatSocket.onmessage = (e) => handleSocketMessage(JSON.parse(e.data));
    }

    

    // ╔═════════════════════════════════════════════════════════════════════════════╗
    // ║                           FUNCIONES DE MENSAJES                             ║
    // ╚═════════════════════════════════════════════════════════════════════════════╝

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
        
        // Solo mostrar username y avatar si están presentes
        const usernameElement = template.querySelector('[data-content="username"]');
        const avatarElement = template.querySelector('[data-content="avatar"]');
        
        if (username) {
            usernameElement.textContent = username;
        } else {
            usernameElement.style.display = 'none';  // Ocultar el elemento username
        }
        
        if (avatar) {
            avatarElement.src = avatar;
        } else {
            avatarElement.style.display = 'none';  // Ocultar el elemento avatar
        }
        
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

    // ╔═════════════════════════════════════════════════════════════════════════════╗
    // Actualiza la lista de usuarios conectados
    function updateConnectedUsers(users) {
        updateConnectedUserMap(users);
        updateConnectedUsersList(users);
    }
    
    // Actualiza el mapa de usuarios conectados
    function updateConnectedUserMap(users) {
        connectedUserMap.clear();
        users.forEach(userObj => {
            console.log(`Usuario: ${userObj.username}, ID: ${userObj.id}`);
            connectedUserMap.set(userObj.username, userObj.id);
        });
    
        // Llamar a updateOnlineCounter para actualizar el contador
        updateOnlineCounter(users);
    }

    // Actualiza la lista de usuarios conectados que se muestra en DOM (MODAL)
    function updateConnectedUsersList(users) {
        const connectedUsersList = document.getElementById('connectedUsersList');
        if (!connectedUsersList) {
            return;
        }
    
        connectedUsersList.innerHTML = '';
        users.forEach(userObj => {
            const template = document.querySelector('#userItemTemplate').content.cloneNode(true);
            template.querySelector('[data-content="username"]').textContent = userObj.username;
            
            const profileBtn = template.querySelector('[data-action="profile"]');
            const blockBtn = template.querySelector('[data-action="block"]');
            const unblockBtn = template.querySelector('[data-action="unblock"]');
            const privateBtn = template.querySelector('[data-action="private"]');
            const playBtn = template.querySelector('[data-action="play"]');
            
            // Configurar los botones
            profileBtn.onclick = () => viewProfile(userObj.username);
            blockBtn.onclick = () => blockUser(userObj.id);
            unblockBtn.onclick = () => unblockUser(userObj.id);
            playBtn.onclick = () => inviteToGame(userObj.id);
            
            if (userObj.username === user) {
                privateBtn.style.display = 'none';
                playBtn.style.display = 'none';
                blockBtn.style.display = 'none';
                unblockBtn.style.display = 'none';
            } else {
                privateBtn.onclick = () => openPrivateChat(userObj.id);
            }
            
            connectedUsersList.appendChild(template);
        });
    }

    // Añadir función para invitar a jugar
    function inviteToGame(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'game_invitation',
            'target_user_id': userId
        }));
    }

    // Añadir a las funciones globales
    window.inviteToGame = inviteToGame;

    // Añadir función para ver el perfil
    function viewProfile(username) {
        window.location.href = `/userManagement/profile/${username}`;
    }

    // Añadir a las funciones globales
    window.viewProfile = viewProfile;

    // Actualiza el contador de usuarios en el DOM
    function updateOnlineCounter(users) {
        // Filtra al usuario actual de la lista
        const currentUserName = user; // 'user' es la variable global que definiste antes
        const otherUsers = users.filter(u => u.username !== currentUserName);
        const onlineUsersCount = otherUsers.length;

        const onlineCounter = document.getElementById('onlineCounter');
        if (!onlineCounter) {
            console.warn('Elemento onlineCounter no encontrado');
            return;
        }

        // Actualiza el texto del contador
        onlineCounter.textContent = `${onlineUsersCount} Online`;
        onlineCounter.style.color = '#dbd829'; // Asegura que el color se aplique

        // Añade la clase para la animación
        onlineCounter.classList.add('user-count-updated');

        // Remueve la clase después de que termine la animación
        setTimeout(() => {
            onlineCounter.classList.remove('user-count-updated');
        }, 500);
    }

    // ╔═════════════════════════════════════════════════════════════════════════════╗
    // ║                           FUNCIONES DE BLOQUEO                              ║
    // ╚════════════════════════════════════════════════════════════════════════════��╝

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

    // ╔═════════════════════════════════════════════════════════════════════════════╗
    // ║                        FUNCIONES DE OBJETO GLOBAL                           ║
    // ╚═════════════════════════════════════════════════════════════════════════════╝

    // solicitud de chat privado
    window.openPrivateChat = openPrivateChat;
    // bloqueo y desbloqueo 
    window.blockUser = blockUser;
    window.unblockUser = unblockUser;

    // ╔═════════════════════════════════════════════════════════════════════════════╗
    // ║                           EVENTOS DE LA INTERFAZ                            ║
    // ╚═════════════════════════════════════════════════════════════════════════════╝

    // Eventos de click y keypress para enviar mensajes
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {sendMessage()}});


    // Evento beforeunload para desconectar al usuario antes de cerrar la pestaña
    window.addEventListener('beforeunload', function() {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({
                'type': 'disconnect_user',
                'username': user
            }));
        }
    });

    // Evento visibilitychange para detectar cuando el usuario cambia de pestaña
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            if (chatSocket.readyState === WebSocket.OPEN) {
                chatSocket.send(JSON.stringify({
                    'type': 'disconnect_user',
                    'username': user
                }));
            }
        } else if (document.visibilityState === 'visible') {
            if (chatSocket.readyState === WebSocket.OPEN) {
                chatSocket.send(JSON.stringify({
                    'type': 'reconnect_user',
                    'username': user
                }));
            }
        }
    });
};

// Ejecutar la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    window.initializeChat(); // Inicializamos el chat
});

