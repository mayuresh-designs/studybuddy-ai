// ==================== PUT YOUR FREE API KEY HERE ====================
const API_KEY = "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";   // ←←← Paste your Groq or Gemini API key inside the quotes

const API_PROVIDER = "groq";   // Write "groq" or "gemini"

// Rest of the code (do not change anything below unless you understand)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

let messages = [];
let currentChatId = null;
let streak = 0;

const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const streakCount = document.getElementById('streak-count');
const chatHistoryDiv = document.getElementById('chat-history');
const newChatBtn = document.getElementById('new-chat-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const chatTitle = document.getElementById('chat-title');

function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    let lastVisit = localStorage.getItem('lastVisitDate');
    
    if (lastVisit !== today) {
        if (lastVisit) streak = (streak || 0) + 1;
        else streak = 1;
        localStorage.setItem('lastVisitDate', today);
        localStorage.setItem('studyStreak', streak);
    } else {
        streak = parseInt(localStorage.getItem('studyStreak') || '1');
    }
    streakCount.textContent = streak || 0;
}

function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    div.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    if (!API_KEY) {
        alert("Please put your free API key in script.js file first!");
        return;
    }

    addMessage('user', text);
    messages.push({ role: "user", content: text });
    userInput.value = "";

    const typing = document.createElement('div');
    typing.className = 'message ai-message';
    typing.innerHTML = "<p>StudyBuddy is thinking...</p>";
    chatContainer.appendChild(typing);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a helpful, patient AI tutor for students. Explain clearly and encourage learning." },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await res.json();
        const reply = data.choices[0].message.content;

        typing.remove();
        addMessage('ai', reply);
        messages.push({ role: "assistant", content: reply });

    } catch (err) {
        typing.remove();
        addMessage('ai', "Sorry, something went wrong. Check your internet and API key.");
    }
}

function startNewChat() {
    currentChatId = 'chat-' + Date.now();
    messages = [];
    chatContainer.innerHTML = `
        <div class="welcome-message">
            <h3>👋 Hello! Ready to study?</h3>
            <p>Ask me anything about your studies.</p>
        </div>
    `;
    chatTitle.textContent = "New Chat";
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

newChatBtn.addEventListener('click', startNewChat);

clearAllBtn.addEventListener('click', () => {
    if (confirm("Delete all chats?")) {
        localStorage.clear();
        location.reload();
    }
});

updateStreak();
startNewChat();