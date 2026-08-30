const chat = document.querySelector("#chat");
const input = document.querySelector("#input");
const send = document.querySelector("#send");

let chats = JSON.parse(
  localStorage.getItem("siva_chats") || "[]"
);

function saveChats() {
  localStorage.setItem(
    "siva_chats",
    JSON.stringify(chats)
  );
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addMessage(text, me = false) {
  const welcome = document.querySelector("#welcome");

  if (welcome) {
    welcome.remove();
  }

  const row = document.createElement("div");

  row.className = "msg";

  row.innerHTML = `
    <div class="avatar">
      ${me ? "U" : "✦"}
    </div>
    <div class="bubble">
      ${escapeHtml(text)}
    </div>
  `;

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

async function sivaReply(message) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || "AI request failed"
      );
    }

    return data.reply;

  } catch (error) {
    console.error("Siva AI error:", error);

    return (
      "Sorry, AI server se connection nahi ho pa raha. " +
      "Please thodi der baad try karo."
    );
  }
}

async function ask() {
  const question = input.value.trim();

  if (!question) {
    return;
  }

  addMessage(question, true);

  input.value = "";
  input.disabled = true;
  send.disabled = true;

  const typing = document.createElement("div");

  typing.className = "msg";
  typing.id = "typing";

  typing.innerHTML = `
    <div class="avatar">✦</div>
    <div class="bubble">
      Siva AI is thinking...
    </div>
  `;

  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  try {
    const reply = await sivaReply(question);

    const oldTyping =
      document.querySelector("#typing");

    if (oldTyping) {
      oldTyping.remove();
    }

    addMessage(reply);

    chats.push({
      user: question,
      bot: reply,
      time: Date.now()
    });

    saveChats();

  } catch (error) {

    const oldTyping =
      document.querySelector("#typing");

    if (oldTyping) {
      oldTyping.remove();
    }

    addMessage(
      "Sorry, kuch problem ho gayi. Please try again."
    );

  } finally {

    input.disabled = false;
    send.disabled = false;
    input.focus();

  }
}

if (send) {
  send.addEventListener("click", ask);
}

if (input) {

  input.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        ask();
      }

    }
  );

}

/* New Chat */

const newChat =
  document.querySelector("#newChat");

if (newChat) {

  newChat.addEventListener(
    "click",
    function() {

      localStorage.removeItem(
        "siva_chats"
      );

      chats = [];

      location.reload();

    }
  );

}

/* Mobile menu */

const menu =
  document.querySelector("#menu");

const sidebar =
  document.querySelector("#sidebar");

const closeSide =
  document.querySelector("#closeSide");

if (menu && sidebar) {

  menu.addEventListener(
    "click",
    function() {

      sidebar.classList.add("open");

    }
  );

}

if (closeSide && sidebar) {

  closeSide.addEventListener(
    "click",
    function() {

      sidebar.classList.remove("open");

    }
  );

}

/* Dark mode */

const theme =
  document.querySelector("#theme");

if (theme) {

  theme.addEventListener(
    "click",
    function() {

      document.body.classList.toggle(
        "dark"
      );

      localStorage.setItem(
        "siva_dark",
        document.body.classList.contains(
          "dark"
        )
      );

    }
  );

}

if (
  localStorage.getItem("siva_dark") ===
  "true"
) {

  document.body.classList.add("dark");

}

/* File */

const file =
  document.querySelector("#file");

const fileName =
  document.querySelector("#fileName");

if (file) {

  file.addEventListener(
    "change",
    function(event) {

      const selected =
        event.target.files[0];

      if (selected && fileName) {

        fileName.textContent =
          selected.name;

      }

    }
  );

}

/* Voice */

const mic =
  document.querySelector("#mic");

if (mic) {

  mic.addEventListener(
    "click",
    function() {

      const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!Recognition) {

        alert(
          "Voice input is not supported."
        );

        return;

      }

      const recognition =
        new Recognition();

      recognition.lang = "hi-IN";
      recognition.interimResults = false;

      recognition.onresult =
        function(event) {

          input.value =
            event.results[0][0]
              .transcript;

          input.focus();

        };

      recognition.start();

    }
  );

}

/* Suggestion buttons */

document
  .querySelectorAll(
    ".suggestions button"
  )
  .forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        input.value =
          button.textContent.trim();

        input.focus();

      }
    );

  });
