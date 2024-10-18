console.log("cargando archivo chat.js");

function initializeChat() {
    console.log("Inicializando chat...");
    const btnMessage = document.getElementById('btnMessage');
    console.log(btnMessage);  // Para ver si el botón se encuentra correctamente
    if (btnMessage) {
        btnMessage.addEventListener('click', function() {
            console.log('Enviando mensaje...');
        });
    } else {
        console.error('Elemento con ID "btnMessage" no encontrado.');
    }
}