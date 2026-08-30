const chat = document.querySelector("#chat");
const input = document.querySelector("#input");
const send = document.querySelector("#send");

let chats = JSON.parse(localStorage.getItem("siva_chats") || "[]");

function saveChats() {
  localStorage.setItem("siva_chats", JSON.stringify(chats));
}

function addMessage(text, me = false) {
  const welcome = document.querySelector("#welcome");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = "msg " + (me ? "user" : "bot");

  row.innerHTML = `
    <div class="avatar">${me ? "U" : "✦"}</div>
    <div class="bubble">${escapeHtml(text)}</div>
  `;

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Gemini AI reply
async function sivaReply(question) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return data.error || "Sorry, AI se response nahi mila.";
        }

        return data.reply || "Sorry, mujhe response nahi mila.";

    } catch (error) {
        console.error("AI Error:", error);
        return "Internet ya server connection mein problem hai.";
    }
}
function ask() {
  const q = input.value.trim();

  if (!q) return;

  addMessage(q, true);
  input.value = "";
async function ask() {
    const q = input.value.trim();

    if (!q) return;

    addMessage(q, true);
    input.value = "";
    input.disabled = true;

    const typing = document.createElement("div");
    typing.className = "msg bot";
    typing.id = "typing";

    typing.innerHTML = `
        <div class="avatar">✦</div>
        <div class="bubble">Siva AI is thinking...</div>
    `;

    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    try {
        const reply = await sivaReply(q);

        const oldTyping = document.getElementById("typing");
        if (oldTyping) oldTyping.remove();

        addMessage(reply);

        chats.push({
            user: q,
            bot: reply,
            time: Date.now()
        });

        saveChats();

    } catch (error) {
        const oldTyping = document.getElementById("typing");
        if (oldTyping) oldTyping.remove();

        addMessage("Sorry, kuch problem ho gayi. Please try again.");
        console.error(error);
    }

    input.disabled = false;
    input.focus();
}
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  });
}

// Suggestion buttons
document.querySelectorAll(".suggestion, .suggestions button").forEach(btn => {
  btn.onclick = () => {
    input.value = btn.textContent.trim();
    input.focus();
  };
});

// New chat
const newChat = document.querySelector("#newChat");

if (newChat) {
  newChat.onclick = () => {
    localStorage.removeItem("siva_chats");
    location.reload();
  };
}

// Mobile sidebar
const menu = document.querySelector("#menu");
const sidebar = document.querySelector("#sidebar");
const closeSide = document.querySelector("#closeSide");

if (menu && sidebar) {
  menu.onclick = () => sidebar.classList.add("open");
}

if (closeSide && sidebar) {
  closeSide.onclick = () => sidebar.classList.remove("open");
}

// Dark mode
const theme = document.querySelector("#theme");

if (theme) {
  theme.onclick = () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
      "siva_dark",
      document.body.classList.contains("dark")
    );
  };
}

// Restore dark mode
if (localStorage.getItem("siva_dark") === "true") {
  document.body.classList.add("dark");
}

// File selection
const file = document.querySelector("#file");
const fileName = document.querySelector("#fileName");

if (file) {
  file.onchange = e => {
    const selected = e.target.files[0];

    if (selected && fileName) {
      fileName.textContent = selected.name;
    }
  };
}

// Voice input
const mic = document.querySelector("#mic");

if (mic) {
  mic.onclick = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.interimResults = false;

    recognition.onresult = event => {
      input.value = event.results[0][0].transcript;
    };

    recognition.start();
  };
}
