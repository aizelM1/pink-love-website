import { firebaseConfig, hasFirebaseConfig } from "./firebase-config.js";

const LOCAL_MESSAGES_KEY = "pink-love-messages";
const messageForm = document.querySelector("#messageForm");
const messageStatus = document.querySelector("#messageStatus");
const latestReply = document.querySelector("#latestReply");

function getLocalMessages() {
  return JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || "[]");
}

function saveLocalMessages(messages) {
  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
}

function showLatestLocalReply() {
  if (!latestReply) return;
  const messages = getLocalMessages();
  const repliedMessage = [...messages].reverse().find((message) => message.reply);
  latestReply.textContent = repliedMessage ? repliedMessage.reply : "No reply yet.";
}

async function sendLocalMessage(message) {
  const messages = getLocalMessages();
  messages.unshift({
    id: crypto.randomUUID(),
    ...message,
    reply: "",
    createdAt: new Date().toISOString()
  });
  saveLocalMessages(messages);
}

async function initFirebaseMessaging() {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const {
    addDoc,
    collection,
    getFirestore,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
  } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const messagesRef = collection(db, "loveLetters");

  if (latestReply) {
    const repliesQuery = query(
      messagesRef,
      where("reply", "!=", ""),
      orderBy("reply"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    onSnapshot(repliesQuery, (snapshot) => {
      const reply = snapshot.docs[0]?.data()?.reply;
      latestReply.textContent = reply || "No reply yet.";
    });
  }

  messageForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageStatus.textContent = "Sending...";

    await addDoc(messagesRef, {
      name: document.querySelector("#messageName").value.trim(),
      message: document.querySelector("#messageText").value.trim(),
      reply: "",
      createdAt: serverTimestamp()
    });

    messageForm.reset();
    document.querySelector("#messageName").value = "bebi";
    messageStatus.textContent = "Sent. Your letter is with me now.";
  });
}

function initLocalMessaging() {
  showLatestLocalReply();

  messageForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageStatus.textContent = "Saving...";

    await sendLocalMessage({
      name: document.querySelector("#messageName").value.trim(),
      message: document.querySelector("#messageText").value.trim()
    });

    messageForm.reset();
    document.querySelector("#messageName").value = "bebi";
    messageStatus.textContent = "Saved on this browser. Add Firebase to make it online.";
    showLatestLocalReply();
  });
}

if (messageForm) {
  if (hasFirebaseConfig()) {
    initFirebaseMessaging().catch(() => {
      messageStatus.textContent = "Firebase is not ready yet. Using local demo mode.";
      initLocalMessaging();
    });
  } else {
    initLocalMessaging();
  }
}
