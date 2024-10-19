function initializeChat() {
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode == 13) {
            sendMessage();
        } 
    })


    function sendMessage() {
        var message = document.querySelector('#inputMessage');
        
        loadMessageHTML(message.value.trim());

        if (message.value.trim() != '') {
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
        `
    }
}

