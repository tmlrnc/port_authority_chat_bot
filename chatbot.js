document.addEventListener('DOMContentLoaded', function() {
    // Get the temperature slider and its associated label
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureLabel = document.getElementById('temperature-label');

    // Function to update the temperature label with the current slider value
    function updateTemperatureLabel() {
        temperatureLabel.textContent = 'Creativity: ' + temperatureSlider.value;
    }

    // Add an event listener to the slider to update the label when the value changes
    temperatureSlider.addEventListener('input', updateTemperatureLabel);

    // Function to send the message and temperature to the Flask app
    function sendToChatbot(message, temperature) {
        showTypingIndicator();
        fetch('http://127.0.0.1:5000/send_message', {
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

    // Add event listener for sending message to the Flask app when 'Send' button is clicked
    document.getElementById('chat-send').addEventListener('click', function() {
        var message = document.getElementById('chat-input').value;
        var temperature = temperatureSlider.value;
        sendToChatbot(message, temperature);
    });

    // Add event listener for generating questions when 'Generate Questions' button is clicked
    document.getElementById('generate-questions').addEventListener('click', function() {
        var temperature = temperatureSlider.value;
        sendToChatbot("generate_interview_questions", temperature);
    });

    // Function to append messages to the chat interface
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

    // Function to show typing indicator
    function showTypingIndicator() {
        var chatMessages = document.getElementById('chat-messages');
        var typingDiv = document.createElement('div');
        typingDiv.classList.add('chat-message', 'typing-indicator');
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        var typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});
