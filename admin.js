import { firebaseConfig, hasFirebaseConfig } from "./firebase-config.js";

const LOCAL_MESSAGES_KEY = "pink-love-messages";
const adminMessages = document.querySelector("#adminMessages");
const adminModeNote = document.querySelector("#adminModeNote");

function getLocalMessages() {
  return JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || "[]");
}

function saveLocalMessages(messages) {
  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
}

function renderMessages(messages, onReply) {
  if (!messages.length) {
    adminMessages.innerHTML = '<p class="empty-state">No letters yet.</p>';
    return;
  }

  adminMessages.innerHTML = messages
    .map((message) => {
      const date = message.createdAt ? new Date(message.createdAt).toLocaleString() : "Just now";
      return `
        <article class="admin-message">
          <div class="message-meta">
            <strong>${escapeHtml(message.name || "bebi")}</strong>
            <span>${escapeHtml(date)}</span>
          </div>
          <p>${escapeHtml(message.message || "")}</p>
          <label for="reply-${message.id}">Your reply</label>
          <textarea id="reply-${message.id}" rows="3">${escapeHtml(message.reply || "")}</textarea>
          <button class="primary-button" data-reply-id="${message.id}" type="button">Save reply</button>
        </article>
      `;
    })
    .join("");

  adminMessages.querySelectorAll("[data-reply-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.replyId;
      const reply = document.querySelector(`#reply-${CSS.escape(id)}`).value.trim();
      onReply(id, reply);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initLocalAdmin() {
  const render = () => {
    renderMessages(getLocalMessages(), (id, reply) => {
      const messages = getLocalMessages().map((message) => (
        message.id === id ? { ...message, reply } : message
      ));
      saveLocalMessages(messages);
      render();
    });
  };

  render();
}

async function initFirebaseAdmin() {
  adminModeNote.textContent = "Firebase mode. Messages are loading from your online database.";

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const {
    collection,
    doc,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    updateDoc
  } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const messagesRef = collection(db, "loveLetters");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));

  onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((messageDoc) => ({
      id: messageDoc.id,
      ...messageDoc.data(),
      createdAt: messageDoc.data().createdAt?.toDate?.().toISOString?.() || new Date().toISOString()
    }));

    renderMessages(messages, async (id, reply) => {
      await updateDoc(doc(db, "loveLetters", id), { reply });
    });
  });
}

if (hasFirebaseConfig()) {
  initFirebaseAdmin().catch(() => {
    adminModeNote.textContent = "Firebase is not ready yet. Showing local demo messages.";
    initLocalAdmin();
  });
} else {
  initLocalAdmin();
}
