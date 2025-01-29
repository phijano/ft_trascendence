window.initializeChat = function() {
    const boxMessages = document.querySelector('#boxMessages');
    const room = boxMessages.getAttribute('data-room');
    const user = boxMessages.getAttribute('data-user');
    const avatar = boxMessages.getAttribute('data-avatar');

    // Determine if we're in a private room
    const isPrivate = window.location.pathname.includes('/private/');
    
    // Modify WebSocket URL construction
    const wsUrl = isPrivate ? 
        `wss://${window.location.host}/wss/chat/private/${room}/` :
        `wss://${window.location.host}/wss/chat/${room}/`;
    
    var chatSocket = new WebSocket(wsUrl);

    // Map for connected users
    let connectedUserMap = new Map(); // To track connected users
    let blockedUsers = new Set(); // To track blocked users

    // WebSocket Events
    chatSocket.onopen = (e) => console.log('Connection opened');
    chatSocket.onclose = (e) => console.error('Connection closed');
    chatSocket.onmessage = (e) => handleSocketMessage(JSON.parse(e.data));

    // Handle WebSocket messages
    function handleSocketMessage(data) {
        switch (data.type) {
            case 'error':
                alert(data.message); // Notify the user that they were blocked
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
            case 'game_invitation':
                displayGameInvitation(data);
                break;
            case 'game_invitation_declined':
                handleGameInvitationDeclined(data);
                break;
            case 'game_invitation_accepted':
                handleGameInvitationAccepted(data);
                break;
            default:
                console.warn('Unknown message type:', '[' + data.type + ']');
        }
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                           GAME ROOM FUNCTIONS                               â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    function displayGameInvitation(data) {
        const template = document.querySelector('#gameInvitationTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = data.message;
        
        const acceptBtn = template.querySelector('[data-action="accept"]');
        const declineBtn = template.querySelector('[data-action="decline"]');

        
        acceptBtn.onclick = () => acceptGameInvitation(data.match_id, data.sender_id);
        declineBtn.onclick = () => declineGameInvitation(data.match_id, data.sender_id);
        
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    function acceptGameInvitation(matchId, senderId) {
        chatSocket.send(JSON.stringify({
            'type': 'accept_game_invitation',
            'match_id': matchId,
            'target_user_id': senderId
        }));
    }

    function declineGameInvitation(matchId, senderId) {
        chatSocket.send(JSON.stringify({
            'type': 'decline_game_invitation',
            'match_id': matchId,
            'sender_id': senderId
        }));
    }

    function handleGameInvitationDeclined(data) {
        const template = document.querySelector('#gameResponseTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = data.message;
        template.querySelector('.game-response').classList.add('alert-danger');
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    function handleGameInvitationAccepted(data) {
        // Clone the notification template
        const template = document.querySelector('#gameStartTemplate').content.cloneNode(true);
        
        // Set the message
        template.querySelector('[data-content="message"]').textContent = data.message;
        
        // Configure the start game button
        const startGameBtn = template.querySelector('[data-action="start-game"]');
        startGameBtn.onclick = () => startGame(data);
        
        // Add it to the chat
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    async function startGame(data) {
        const user = document.querySelector('#boxMessages').getAttribute('data-user');
        const userId = connectedUserMap.get(user);
        const senderId = data.sender_id;
        const isSender = userId === senderId;

        console.log("userId:", userId);
        console.log("senderId:", senderId);
        console.log("isSender:", isSender);
        
        console.log(user); 
        await router("/pong");
        pongStartRemote();
        
        if (isSender) {
			//chang senderId with the correct id
            creatorId = data.match_id.split("_")[1];
            console.log("creatorId:", creatorId);
            pongJoinPrivateGame(creatorId);
        }
        else {
            pongCreatePrivateGame();
        }

    }


    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                        PRIVATE CHAT FUNCTIONS                               â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    // Send a private chat request
    function openPrivateChat(userId) {
        if (userId === connectedUserMap.get(user)) {
            console.log(`userId: ${userId} (type: ${typeof userId})`);
            console.log(`Current user ID: ${connectedUserMap.get(user)} (type: ${typeof connectedUserMap.get(user)})`);
            console.log('You cannot send a private chat request to yourself.');
            return;
        }
        chatSocket.send(JSON.stringify({
            'type': 'private_chat_request',
            'target_user_id': userId,
        }));
        loadMessageHTML('Private chat request sent.');
    }

    function declinePrivateChat(senderId) {
        const message = {
            'type': 'reject_private_chat',
            'sender_id': senderId
        };
        chatSocket.send(JSON.stringify(message));
    }

    // Template for displaying rejected private chat notification
    function handlePrivateChatRejected(data) {
        const template = document.querySelector('#privateChatDeclinedTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = data.message;
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    // Template for displaying private chat request notification
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

    // JSON to accept or reject the private chat request via WebSocket
    function acceptPrivateChat(senderId) {
        chatSocket.send(JSON.stringify({
            'type': 'accept_private_chat',
            'sender_id': senderId,
            'username': user, //current username
        }));
    }

    // Template for displaying accepted private chat notification
    function handlePrivateChatAccepted(data) {
        // Clone the notification template
        const template = document.querySelector('#privateChatAcceptedTemplate').content.cloneNode(true);
        // Set the message
        template.querySelector('[data-content="message"]').textContent = data.message;
        // Add it to the chat
        boxMessages.appendChild(template);
        
        // Create "Go to Chat" button
        const goToChatBtn = document.createElement('button');
        goToChatBtn.textContent = 'Go to Chat';
        goToChatBtn.classList.add('go-to-chat-btn');
        
        // Modify the onclick event to use privateChat instead of redirection
        goToChatBtn.onclick = () => {
            privateChat(data);
        };
        
        boxMessages.appendChild(goToChatBtn);
        scrollToBottom();
    }

    function privateChat(data) {
        console.log('Starting private chat:', data);
    
        // Clear previous messages
        boxMessages.innerHTML = '';
        
        // Update container attributes
        boxMessages.setAttribute('data-room', data.room_name);
        boxMessages.setAttribute('data-private', 'true');
        
        // Update chat title
        const chatTitle = document.querySelector('h1');
        if (chatTitle) {
            const currentUser = boxMessages.getAttribute('data-user');
            console.log('Current user:', currentUser);
            console.log('Data username:', data.username);
            console.log('Data target username:', data.target_username);
            
            const otherUsername = currentUser === data.username ? 
                data.target_username : data.username;
            
            console.log('Selected name:', otherUsername);
            chatTitle.textContent = `Private chat with ${otherUsername}`;
        }
        
        // Hide buttons not needed in private chat
        const usersBtn = document.querySelector('#usersBtn');
        if (usersBtn) {
            usersBtn.style.display = 'none';
        }
    
        // Update the URL without reloading the page
        const newUrl = `/chat/private/${data.room_id}/`;
        window.history.pushState({ roomId: data.room_id }, '', newUrl);
    
        // Reconnect WebSocket for the private room
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.close();
        }
    
        // Create new WebSocket connection for the private room
        const wsUrl = `wss://${window.location.host}/wss/chat/private/${data.room_id}/`;
        chatSocket = new WebSocket(wsUrl);
        
        // Reinitialize WebSocket events
        chatSocket.onopen = (e) => {
            console.log('Private connection opened');
            chatSocket.send(JSON.stringify({
                'type': 'join_private_room',
                'room_id': data.room_id,
                'username': boxMessages.getAttribute('data-user')
            }));
        };
        
        chatSocket.onclose = (e) => console.error('Private connection closed');
        chatSocket.onmessage = (e) => handleSocketMessage(JSON.parse(e.data));
    }

    

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                        CHAT MESSAGE FUNCTIONS                               â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    // Handle chat message
    function handleChatMessage(data) {
        const { message, username, avatar } = data;

        if (blockedUsers.has(username)) {
            console.log(`Message from ${username} blocked and not saved.`);
            return; // Do not display or save messages from blocked users
        }

        if (message && username) {
            displayChatMessage(message, username, avatar);
        }
    }

    // Display a message in the chat
    function displayChatMessage(message, username, avatar) {
        const template = document.querySelector('#receivedMessageTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = message;
        
        // Only show username and avatar if present
        const usernameElement = template.querySelector('[data-content="username"]');
        const avatarElement = template.querySelector('[data-content="avatar"]');
        
        if (username) {
            usernameElement.textContent = username;
        } else {
            usernameElement.style.display = 'none';  // Hide the username element
        }
        
        if (avatar) {
            avatarElement.src = avatar;
        } else {
            avatarElement.style.display = 'none';  // Hide the avatar element
        }
        
        boxMessages.appendChild(template);
        scrollToBottom();
    }
    
    // Function to scroll to the bottom
    function scrollToBottom() {
        boxMessages.scrollTop = boxMessages.scrollHeight;
    }

    // Function to send a message
    function sendMessage() {
        const messageInput = document.querySelector('#inputMessage');
        const messageValue = messageInput.value.trim();
        
        // If the message is not empty
        if (messageValue !== '') {
            loadMessageHTML(messageValue);
            chatSocket.send(JSON.stringify({
                'type': 'chat_message',
                'message': messageValue,
                'username': user,
            }));
            scrollToBottom();
            messageInput.value = ''; // Clear the input
        }
    }

    
    // Function to load a message in the chat
    function loadMessageHTML(m) {
        const template = document.querySelector('#sentMessageTemplate').content.cloneNode(true);
        template.querySelector('[data-content="message"]').textContent = m;
        
        boxMessages.appendChild(template);
        scrollToBottom();
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                        CONNECTED USERS FUNCTIONS                            â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    function updateConnectedUsers(users) {
        updateConnectedUserMap(users);
        updateConnectedUsersList(users);
    }
    
    // Update the map of connected users
    function updateConnectedUserMap(users) {
        connectedUserMap.clear();
        users.forEach(userObj => {
            console.log(`User: ${userObj.username}, ID: ${userObj.id}`);
            connectedUserMap.set(userObj.username, userObj.id);
        });
    
        // Call updateOnlineCounter to update the counter
        updateOnlineCounter(users);
    }

    // Update the list of connected users displayed in the DOM (MODAL)
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
            
            blockBtn.id = `block-${userObj.id}`;
            unblockBtn.id = `unblock-${userObj.id}`;
            unblockBtn.style.backgroundColor= 'rgb(114, 19, 28)';
            

            
            // Configure the buttons
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

    // Add function to invite to play
    function inviteToGame(userId) {
      closeModal();
        chatSocket.send(JSON.stringify({
            'type': 'game_invitation',
            'target_user_id': userId
        }));
    }

    // Add to global functions
    window.inviteToGame = inviteToGame;

    // Add function to view profile
    function viewProfile(username) {
        //window.location.href = `/userManagement/profile/${username}`;
        closeModal();
        
        router("/profile?userid=" + connectedUserMap.get(username));
    }

    function closeModal() {
        const modal = document.getElementById('usersModal');
        modal.style.display = 'none';
        const backdrop = document.getElementsByClassName('modal-backdrop fade show');
        backdrop[0].remove();
    }

    // Add to global functions
    window.viewProfile = viewProfile;

    // Updates the online users counter in the DOM
    function updateOnlineCounter(users) {
        // Filter the current user from the list
        const currentUserName = user; // 'user' is the global variable you defined earlier
        const otherUsers = users.filter(u => u.username !== currentUserName);
        const onlineUsersCount = otherUsers.length;

        const onlineCounter = document.getElementById('onlineCounter');


        // Update counter text
        onlineCounter.textContent = `${onlineUsersCount} Online`;
        onlineCounter.style.color = '#dbd829'; // Ensure the color is applied

        // Add class for animation
        onlineCounter.classList.add('user-count-updated');

        // Remove class after animation ends
        setTimeout(() => {
            onlineCounter.classList.remove('user-count-updated');
        }, 500);
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                        BLOCK AND UNBLOCK FUNCTIONS                          â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    function blockUser(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'block_user',
            'user_id': userId,
        }));
        document.getElementById(`block-${userId}`).style.backgroundColor= '#775900';
        document.getElementById(`unblock-${userId}`).style.backgroundColor= '#dc3545';
        const username = Array.from(connectedUserMap.keys()).find(u => connectedUserMap.get(u) === userId);
        if (username) {
            blockedUsers.add(username); // Add to the list of blocked users
            console.log(`${username} has been blocked.`);
        }
    }

    function unblockUser(userId) {
        chatSocket.send(JSON.stringify({
            'type': 'unblock_user',
            'user_id': userId,
        }));
        document.getElementById(`unblock-${userId}`).style.backgroundColor= '#72131c';
        document.getElementById(`block-${userId}`).style.backgroundColor= '#ffc107';
        const username = Array.from(connectedUserMap.keys()).find(u => connectedUserMap.get(u) === userId);
        if (username) {
            blockedUsers.delete(username); // Remove from the list of blocked users
            console.log(`${username} has been unblocked.`);
        }
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                        GLOBAL OBJECT FUNCTIONS                              â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    // private chat request
    window.openPrivateChat = openPrivateChat;
    // block and unblock
    window.blockUser = blockUser;
    window.unblockUser = unblockUser;

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘                           INTERFACE EVENTS                                  â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    // Click and keypress events to send messages
    document.querySelector('#btnMessage').addEventListener('click', sendMessage);
    document.querySelector('#inputMessage').addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {sendMessage()}});


    // beforeunload event to disconnect the user before closing the tab
    window.addEventListener('beforeunload', function() {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({
                'type': 'disconnect_user',
                'username': user
            }));
        }
    });

    // visibilitychange event to detect when the user switches tabs
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

    async function chatOut() {
        console.log("chatOut");
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({
                'type': 'disconnect_user',
                'username': user
            }));
        }
    }

    window.closeChat = chatOut;

};

// Execute function when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    window.initializeChat(); // Initialize chat
});