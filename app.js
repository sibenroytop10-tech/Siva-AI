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

// Temporary AI reply
// API baad mein isi function mein connect karenge.
function sivaReply(question) {
  const q = question.toLowerCase();

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("namaste") ||
    q.includes("siva")
  ) {
    return "Namaskar! 🙏 Main Siva AI hoon. Aap mujhse kuch bhi pooch sakte hain.";
  }

  if (
    q.includes("assam") ||
    q.includes("অসম") ||
    q.includes("assamese")
  ) {
    return "নমস্কাৰ! 🙏 মই Siva AI। আপুনি অসমীয়া, Hindi বা English-ত মোৰ সৈতে কথা পাতিব পাৰে।";
  }

  if (q.includes("who are you") || q.includes("tum kaun")) {
    return "Main Siva AI hoon — aapka personal AI assistant. 🤖";
  }

  if (q.includes("help") || q.includes("madad")) {
    return "Bilkul! 😊 Aap apna question type kijiye, main help karne ki koshish karunga.";
  }

  return "Samajh gaya. 👍 Abhi main demo mode mein hoon. Real AI API connect hone ke baad main aapko intelligent answers dunga.";
}

function ask() {
  const q = input.value.trim();

  if (!q) return;

  addMessage(q, true);
  input.value = "";

  chats.push({
    user: q,
    time: Date.now()
  });

  saveChats();

  setTimeout(() => {
    addMessage(sivaReply(q));
  }, 500);
}

if (send) {
  send.onclick = ask;
}

if (input) {
  input.addEventListener("keydown", e => {
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
