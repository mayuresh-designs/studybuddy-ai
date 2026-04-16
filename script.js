// ==================== YOUR API KEY HERE ====================
const API_KEY = "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";
const API_PROVIDER = "groq";

// ==================== MAIN CODE ====================
let messages = [];
let currentChatId = null;
let allChats = [];

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistoryDiv = document.getElementById('chat-history');
const chatTitle = document.getElementById('chat-title');
const historySearch = document.getElementById('history-search');
const voiceBtn = document.getElementById('voice-btn');

// Load previous chats
function loadChats() {
    allChats = JSON.parse(localStorage.getItem('studyChats') || '[]');
    renderHistory();
}

function renderHistory() {
    chatHistoryDiv.innerHTML = '';
    allChats.forEach(chat => {
        const div = document.createElement('div');
        div.className = `history-item ${currentChatId === chat.id ? 'active' : ''}`;
        div.textContent = chat.title || "New Chat";
        div.onclick = () => loadChat(chat.id);
        chatHistoryDiv.appendChild(div);
    });
}

function saveChat() {
    if (!currentChatId) return;
    const title = messages[0] ? messages[0].content.substring(0, 40) + "..." : "New Chat";

    const chatData = {
        id: currentChatId,
        title: title,
        messages: messages,
        timestamp: Date.now()
    };

    const index = allChats.findIndex(c => c.id === currentChatId);
    if (index > -1) allChats[index] = chatData;
    else allChats.unshift(chatData);

    localStorage.setItem('studyChats', JSON.stringify(allChats));
    renderHistory();
}

function loadChat(id) {
    const chat = allChats.find(c => c.id === id);
    if (!chat) return;

    currentChatId = id;
    messages = chat.messages || [];
    chatTitle.textContent = chat.title || "Chat";

    chatContainer.innerHTML = '';
    messages.forEach(msg => addMessage(msg.role, msg.content));
}

function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    div.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send message to AI
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    messages.push({ role: "user", content: text });
    userInput.value = "";

    const typing = document.createElement('div');
    typing.className = 'message ai-message';
    typing.innerHTML = "<p>StudyBuddy is thinking...</p>";
    chatContainer.appendChild(typing);
    chatContainer.scrollTop = chatContainer.scrollHeight;

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
                    { role: "system", content: "You are StudyBuddy AI, a friendly and patient AI tutor for students. Explain concepts
