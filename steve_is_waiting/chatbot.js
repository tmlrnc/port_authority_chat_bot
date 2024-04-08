document.addEventListener('DOMContentLoaded', function() {
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureLabel = document.getElementById('temperature-label');

    function updateTemperatureLabel() {
        temperatureLabel.textContent = 'Creativity: ' + temperatureSlider.value;
    }

    document.getElementById('level-select').addEventListener('change', function() {
        var selectedOption = document.getElementById('level-select').value;
        sendToChatbot("get_competency_question", selectedOption);
    });

    temperatureSlider.addEventListener('input', updateTemperatureLabel);

    function sendToChatbot(message, temperature) {
        showTypingIndicator();
        fetch('/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, temperature: temperature })
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

    document.getElementById('chat-send').addEventListener('click', function() {
        var message = document.getElementById('chat-input').value;
        var temperature = temperatureSlider.value;
        sendToChatbot(message, temperature);
    });

    document.getElementById('generate-questions').addEventListener('click', function() {
        var temperature = temperatureSlider.value;
        sendToChatbot("generate questions", temperature);
    });

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
        messageDiv.innerHTML = message; 
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
        var typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});