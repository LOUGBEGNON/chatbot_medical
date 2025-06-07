document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const historyList = document.getElementById('historyList');

    // Initialisation
    function init() {
        addBotMessage("Bonjour ! Je suis un assistant médical. Posez-moi vos questions sur la santé. Notez que je ne peux pas remplacer une consultation avec un médecin.");
        loadHistory();
        addClearHistoryButton();
        setupEventListeners();
        setupHistoryToggle();
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        sendButton.addEventListener('click', sendQuestion);
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendQuestion();
            }
        });
    }

    function setupHistoryToggle() {
        const toggleBtn = document.getElementById('toggleHistory');
        const sidebar = document.getElementById('historySidebar');

        // Récupérer l'état depuis le localStorage
        const isVisible = localStorage.getItem('historyVisible') !== 'false';

        // Appliquer l'état initial
        if (isVisible) {
            sidebar.classList.add('visible');
            toggleBtn.textContent = '✕ Masquer';
        } else {
            sidebar.classList.remove('visible');
            toggleBtn.textContent = '≡ Historique';
        }

        // Gérer le clic
        toggleBtn.addEventListener('click', () => {
            const willBeVisible = !sidebar.classList.contains('visible');

            sidebar.classList.toggle('visible');
            toggleBtn.textContent = willBeVisible ? '✕ Masquer' : '≡ Historique';
            localStorage.setItem('historyVisible', willBeVisible.toString());
        });
    }

    // Charger l'historique
    async function loadHistory() {
        try {
            const response = await fetch('/history');
            if (!response.ok) throw new Error('Erreur réseau');

            const data = await response.json();
            renderHistory(data.history);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
        }
    }

    // Afficher l'historique
    function renderHistory(history) {
        historyList.innerHTML = '';

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <strong>${item.time}</strong>
                <p>${item.question.substring(0, 50)}${item.question.length > 50 ? '...' : ''}</p>
            `;

            historyItem.addEventListener('click', () => {
                displayFullConversation(item);
            });

            historyList.appendChild(historyItem);
        });
    }

    // Afficher une conversation complète
    function displayFullConversation(item) {
        chatBox.innerHTML = `
            <div class="message user-message">
                <small>${item.time}</small>
                <p>${item.question}</p>
            </div>
            <div class="message bot-message">
                <small>${item.time}</small>
                <p>${item.response}</p>
            </div>
        `;
    }

    // Ajouter le bouton effacer historique
    function addClearHistoryButton() {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearHistory';
        clearBtn.textContent = 'Effacer l\'historique';
        clearBtn.addEventListener('click', clearHistory);
        document.querySelector('.input-area').appendChild(clearBtn);
    }

    // Effacer l'historique
    async function clearHistory() {
        if (!confirm('Effacer tout l\'historique de cette session ?')) return;

        try {
            const response = await fetch('/clear-history', { method: 'POST' });
            if (!response.ok) throw new Error('Erreur lors de la suppression');

            chatBox.innerHTML = '';
            historyList.innerHTML = '';
            addBotMessage("L'historique a été effacé.");
        } catch (error) {
            console.error('Erreur:', error);
            addBotMessage("Échec de la suppression de l'historique. Veuillez réessayer.");
        }
    }

    // Envoyer une question
    async function sendQuestion() {
        const question = userInput.value.trim();
        if (!question) return;

        addUserMessage(question);
        userInput.value = '';

        showTypingIndicator();

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `question=${encodeURIComponent(question)}`
            });

            if (!response.ok) throw new Error('Erreur serveur');

            const data = await response.json();
            hideTypingIndicator();
            addBotMessage(data.response);
            loadHistory(); // Rafraîchir l'historique
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addBotMessage("Désolé, une erreur s'est produite. Veuillez réessayer.");
        }
    }

    // Gestion de l'indicateur de frappe
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message typing-indicator';
        typingIndicator.textContent = 'Assistant tape...';
        typingIndicator.id = 'typingIndicator';
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            chatBox.removeChild(indicator);
        }
    }

    // Ajouter un message utilisateur
    function addUserMessage(message) {
        appendMessage(message, 'user-message');
    }

    // Ajouter un message bot
    function addBotMessage(message) {
        appendMessage(message, 'bot-message');
    }

    // Fonction générique pour ajouter des messages
    function appendMessage(message, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.innerHTML = typeof message === 'string' ? message.replace(/\n/g, '<br>') : message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Démarrer l'application
    init();
});