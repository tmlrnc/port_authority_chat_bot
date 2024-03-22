document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chat-send').addEventListener('click', function() {
        var message = document.getElementById('chat-input').value;
        sendToChatbot(message);
    });

    document.getElementById('generate-questions').addEventListener('click', function() {
        sendToChatbot("generate_interview_questions");
    });

    function sendToChatbot(message) {
        showTypingIndicator();
        fetch('http://127.0.0.1:5000/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            removeTypingIndicator();
            appendMessage('Chatbot', data.response);
        })
        .catch((error) => {
            console.error('Error:', error);
            removeTypingIndicator();
            appendMessage('Chatbot', 'Sorry, an error occurred.');
        });
    }

    function appendMessage(sender, message) {
        var chatMessages = document.getElementById('chat-messages');
        var messageContainerDiv = document.createElement('div');
        messageContainerDiv.classList.add('message-container');
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        if (sender === 'You') {
            messageDiv.classList.add('user-message');
        } else {
            messageDiv.classList.add('chatbot-message');
        }
        messageDiv.innerHTML = message; // Use innerHTML to render HTML
        messageContainerDiv.appendChild(messageDiv);
        chatMessages.appendChild(messageContainerDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function showTypingIndicator() {
        var chatMessages = document.getElementById('chat-messages');
        var typingDiv = document.createElement('div');
        typingDiv.classList.add('chat-message', 'typing-indicator');
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        var typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});