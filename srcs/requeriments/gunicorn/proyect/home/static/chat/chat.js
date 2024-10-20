// Definir la función en el objeto global window
window.initializeChat = function() {
    console.log("Inicializando chat...");

    // Obtener el usuario y la sala desde los atributos data
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
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

    /* // Definir el evento onmessage
    chatSocket.onmessage = function(e) {
        console.log('Mensaje recibido:', e.data);
        loadMessageHTML(e.data);
    };
 */
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            sendMessage();
        }
    });

    function sendMessage() {
        var message = document.querySelector('#inputMessage');
        loadMessageHTML(message.value.trim());

        if (message.value.trim() !== '') {
            message.value = '';
        }
    }

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
};

// Ejecutar la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    window.initializeChat(); // Inicializamos el chat
});
