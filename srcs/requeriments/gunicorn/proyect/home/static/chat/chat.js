function initializeChat() {
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode == 13) {
            sendMessage();
        } 
    })


    function sendMessage() {
        var message = document.querySelector('#inputMessage');
        console.log(message.value.trim());
        if (message.value.trim() != '') {
            message.value = '';
        }
    }
}

