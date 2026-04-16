// ==================== YOUR API KEY ====================
const API_KEY = "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";

// Variables
let messages = [];
let currentChatId = null;
let allChats = [];

// Get elements safely
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatTitle = document.getElementById('chat-title');
const chatHistoryDiv = document.getElementById('chat-history');

// Add message function
function addMessage(role, content) {
    if (!chatContainer) return;
    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    div.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Save chat
function saveChat() {
    if (!currentChatId) return;
    const title = messages[0] ? messages[0].content.substring(0, 40) + "..." : "New Chat";
    
    const chatData = {
        id: currentChatId,
        title: title,
        messages: messages,
        timestamp: Date.now()
    };

    allChats = allChats.filter(c => c.id !== currentChatId);
    allChats.unshift(chatData);
    localStorage.setItem('studyChats', JSON.stringify(allChats));
}

// Load old chats
function loadChats() {
    allChats = JSON.parse(localStorage.getItem('studyChats') || '[]');
    if (chatHistoryDiv) {
        chatHistoryDiv.innerHTML = '';
        allChats.forEach(chat => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = chat.title || "New Chat";
            div.onclick = () => loadChat(chat.id);
            chatHistoryDiv.appendChild(div);
        });
    }
}

function loadChat(id) {
    const chat = allChats.find(c => c.id === id);
    if (!chat) return;
    currentChatId = id;
    messages = chat.messages || [];
    if (chatTitle) chatTitle.textContent = chat.title || "Chat";
    if (chatContainer) {
        chatContainer.innerHTML = '';
        messages.forEach(msg => addMessage(msg.role, msg.content));
    }
}

// Send to AI
async function sendMessage() {
    if (!userInput) return;
    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    messages.push({ role: "user", content: text });
    userInput.value = "";

    const typing = document.createElement('div');
    typing.className = 'message ai-message';
    typing.innerHTML = "<p>StudyBuddy is thinking...</p>";
    if (chatContainer) chatContainer.appendChild(typing);

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are StudyBuddy AI, a helpful and encouraging tutor for students." },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 700
            })
        });

        const data = await res.json();
        const reply = data.choices[0].message.content;

        typing.remove();
        addMessage('ai', reply);
        messages.push({ role: "assistant", content: reply });
        saveChat();

    } catch (err) {
        if (typing && typing.parentNode) typing.remove();
        addMessage('ai', "Sorry, AI is not responding right now. Please try again.");
    }
}

// Buttons
if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        currentChatId = 'chat-' + Date.now();
        messages = [];
        if (chatContainer) {
            chatContainer.innerHTML = `<div class="welcome"><h1>👋 Hi Student!</h1><p>How can I help you today?</p></div>`;
        }
        if (chatTitle) chatTitle.textContent = "New Chat";
    });
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);

if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Start the app
loadChats();
