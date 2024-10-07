document.addEventListener('DOMContentLoaded', (event) => {
    const chatSocket = new WebSocket(
        'ws://' + window.location.host + '/ws/chatroom/public-chat/'
    );

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const messageList = document.getElementById('message_list');
        const messageItem = document.createElement('li');
        messageItem.textContent = data.message;
        messageList.appendChild(messageItem);
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    document.getElementById('chat_message_form').onsubmit = function(e) {
        e.preventDefault();
        const messageInputDom = document.getElementById('message_input');
        const message = messageInputDom.value;
        chatSocket.send(JSON.stringify({
            'message': message
        }));
        messageInputDom.value = '';
    };
});