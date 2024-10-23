window.initializeChat = function() {
    // Obtener el usuario y la sala desde los atributos data
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
    const avatar = boxMessages.getAttribute('data-avatar');

    // Obtener la URL del WebSocket
    const wsUrl = `ws://${window.location.host}/ws/chat/${room}/`;

    let connectedUsers = new Set();

    // Crear una instancia de WebSocket
    var chatSocket = new WebSocket(wsUrl);

    chatSocket.onopen = function(e) {
        console.log('Conexión abierta');
    };
    
    chatSocket.onclose = function(e) {
        console.error('Conexión cerrada');
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        if (data.type === 'chat_message') {
            const msg = data.message;
            const username = data.username;
            const avatar = data.avatar;

            document.querySelector('#boxMessages').innerHTML += 
            `
            <!-- Mensaje recibido -->
            <div class="message-container">
                <img src="${avatar}" class="avatar mt-1" alt="Avatar">
                <div class="message received">${msg}</div>
            </div>
            <!-- Nombre del usuario debajo del mensaje -->
            <div id="user-info" class="user-info" style="margin-top: -10px; margin-left: 50px">
                <small class="text-">${username}</small>
            </div>
            `;

            // Hacer scroll hacia abajo
            scrollToBottom();
            
        } else if (data.type === 'user_list') {
            // Actualizar la cantidad de usuarios conectados
            const onlineCount = document.querySelector('#onlineCount');
            onlineCount.textContent = `${data.users.length} Online`;
        }
    };
    
    // Función para hacer scroll hacia abajo
    function scrollToBottom() {
        const boxMessages = document.querySelector('#boxMessages');
        boxMessages.scrollTop = boxMessages.scrollHeight;
    }
    
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            sendMessage();
        }
    });

    // Función para enviar un mensaje
    function sendMessage() {
        var message = document.querySelector('#inputMessage');
        
        // Si el mensaje no está vacío
        if (message.value.trim() !== '') {
            loadMessageHTML(message.value.trim());
            chatSocket.send(JSON.stringify({
                'type': 'chat_message',
                'message': message.value.trim(),
                'username': user,
            }));

            console.log(message.value.trim());

            scrollToBottom();

            message.value = '';
        } else {
            console.log('Mensaje vacío');
        }
    }

    // Función para cargar un mensaje en el chat
    function loadMessageHTML(m) {
        console.log(m);
        document.querySelector('#boxMessages').innerHTML += 
        `
        <!-- Mi mensaje -->
        <div class="message-container">
            <div class="message sent">${m}</div>
        </div>
        `;
    }

    // Evento unload para cerrar el WebSocket al abandonar la página
    window.addEventListener('unload', function() {
        chatSocket.close(); // Cerrar el WebSocket
    });
};

// Ejecutar la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    window.initializeChat(); // Inicializamos el chat
});
