// Definir la función en el objeto global window
window.initializeChat = function() {
    console.log("Inicializando chat...");

    // Obtener el usuario y la sala desde los atributos data
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
    const avatar = boxMessages.getAttribute('data-avatar');
    console.log('Usuario:', user, 'Sala:', room);

    // obtener la url del websocket
    const wsUrl = `ws://${window.location.host}/ws/chat/${room}/`;
    console.log('URL del websocket:', wsUrl);

    // Crear una instancia de WebSocket
    var chatSocket = new WebSocket(wsUrl);

    // Definir el evento onopen
    chatSocket.onopen = function(e) {
        console.log('Conexión abierta');
    };
    
    // Definir el evento onclose
    chatSocket.onclose = function(e) {
        console.error('Conexión cerrada');
    };

    // Definir el evento onmessage
    chatSocket.onmessage = function(data) {
        const datamsg = JSON.parse(data.data);
        var msg = datamsg.message;
        var username = datamsg.username;
        var avatar = datamsg.avatar;


        /* if (username === user) {
            user_class = ' sent';
            } else {
            user_class = '';
            }

        document.querySelector('#boxMessages').innerHTML += 
        `
        <div class="message-container${user_class}">
            <img src="${avatar}" class="avatar" alt="Avatar">
            <div class="message received">${msg}</div>
        </div>
        <div id="user-info" class="user-info${user_class}" style="margin-top: -10px; margin-left: 50px">
            <small class="text-white">${username}</small>
        </div>
        `; */

        document.querySelector('#boxMessages').innerHTML += 
        `
        <!-- Mensaje del usuario 1 -->
        <div class="message-container">
            <img src="${avatar}" class="avatar" alt="Avatar">
            <div class="message received">${msg}</div>
        </div>
        <!-- Nombre del usuario debajo del mensaje -->
        <div id="user-info" class="user-info" style="margin-top: -10px; margin-left: 50px">
            <small class="text-white">${username}</small>
        </div>
        `;

        // Hacer scroll hacia abajo
        scrollToBottom();
    }
    
    // Funcion para hacer scroll hacia abajo
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
        <!-- Mi mensaje-->
        <div class="message-container">
            <div class="message sent">${m}</div>
        </div>
        `;
    }

    

    document.getElementById('blockUserBtn').addEventListener('click', function() {
        const usernameToBlock = prompt("Ingrese el nombre de usuario que desea bloquear:");
        if (usernameToBlock) {
            // Lógica para bloquear al usuario
            blockUser(usernameToBlock);
        }
    });
    
    /* document.getElementById('inviteGameBtn').addEventListener('click', function() {
        const usernameToInvite = prompt("Ingrese el nombre de usuario al que desea invitar a un juego:");
        if (usernameToInvite) {
            // Lógica para enviar invitación a jugar
            inviteToGame(usernameToInvite);
        }
    });
    
    document.getElementById('tournamentNoticeBtn').addEventListener('click', function() {
        // Lógica para mostrar aviso de torneo
        showTournamentNotice();
    });
    
    document.getElementById('viewProfileBtn').addEventListener('click', function() {
        const usernameToView = prompt("Ingrese el nombre de usuario cuyo perfil desea ver:");
        if (usernameToView) {
            // Lógica para redirigir a la página del perfil
            window.location.href = `/profile/${usernameToView}`;
        }
    }); */
    
};

// Ejecutar la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    window.initializeChat(); // Inicializamos el chat
});
