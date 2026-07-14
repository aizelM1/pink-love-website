const VALID_EMAIL = "ayiloves_elli@gmai.com";
const VALID_PASSWORD = "formyoneandonly8";

const loginView = document.querySelector("#loginView");
const gardenView = document.querySelector("#gardenView");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const ribbonButton = document.querySelector("#ribbonButton");
const envelope = document.querySelector("#envelope");
const holdButton = document.querySelector("#holdButton");
const secretMessage = document.querySelector("#secretMessage");
const photoUpload = document.querySelector("#photoUpload");
const gallery = document.querySelector("#gallery");

let holdTimer;

function setViewAfterLogin() {
  loginView.classList.add("hidden");
  gardenView.classList.remove("hidden");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    loginError.textContent = "";
    setViewAfterLogin();
    return;
  }

  loginError.textContent = "That login is not for this garden, please ask your bebi first or kiss her muna pls.";
});

ribbonButton.addEventListener("click", () => {
  envelope.classList.add("open");
});

function beginHold() {
  secretMessage.classList.remove("revealed");
  holdButton.classList.add("holding");
  clearTimeout(holdTimer);
  holdTimer = window.setTimeout(() => {
    secretMessage.classList.add("revealed");
    holdButton.classList.remove("holding");
  }, 1400);
}

function cancelHold() {
  clearTimeout(holdTimer);
  holdButton.classList.remove("holding");
}

holdButton.addEventListener("pointerdown", beginHold);
holdButton.addEventListener("pointerup", cancelHold);
holdButton.addEventListener("pointerleave", cancelHold);
holdButton.addEventListener("pointercancel", cancelHold);

photoUpload.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []).slice(0, 9);
  files.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const caption = document.createElement("figcaption");
    figure.className = "photo-card";
    image.src = url;
    image.alt = "Favorite picture together";
    caption.textContent = `Memory ${gallery.children.length + index + 1}`;
    figure.append(image, caption);
    gallery.prepend(figure);
  });
  photoUpload.value = "";
});
