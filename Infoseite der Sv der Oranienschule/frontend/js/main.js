const messageStorageKey = "sv-user-messages";
const postStorageKey = "sv-public-posts";

const openButtons = document.querySelectorAll("[data-open-message]");
const closeButtons = document.querySelectorAll("[data-close-message]");
const modal = document.querySelector("[data-message-modal]");
const messageForm = document.querySelector(".message-form");
const publicPosts = document.querySelector("#public-posts");
const adminPostForm = document.querySelector("#admin-post-form");
const adminMessages = document.querySelector("#admin-messages");
const adminPosts = document.querySelector("#admin-posts");

function getStoredList(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveStoredList(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function openMessageModal() {
  if (!modal) {
    return;
  }

  modal.hidden = false;
  const firstInput = modal.querySelector("input");
  if (firstInput) {
    firstInput.focus();
  }
}

function closeMessageModal() {
  if (modal) {
    modal.hidden = true;
  }
}

function makeYoutubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function createPostMedia(post) {
  if (!post.media || post.type === "text") {
    return "";
  }

  if (post.type === "image") {
    return `<div class="post-media"><img src="${post.media}" alt=""></div>`;
  }

  if (post.type === "video") {
    return `<div class="post-media"><iframe src="${makeYoutubeEmbed(post.media)}" title="${post.title}" allowfullscreen></iframe></div>`;
  }

  return "";
}

function createPublicPost(post) {
  const article = document.createElement("article");
  article.className = "post";
  article.innerHTML = `
    <div class="post-head">
      <div class="avatar">SV</div>
      <div>
        <h2>${post.title}</h2>
        <p>SV Team - ${post.date}</p>
      </div>
    </div>
    <p>${post.text}</p>
    ${createPostMedia(post)}
    <div class="post-actions">
      <button type="button">Gefaellt mir</button>
      <button type="button" data-open-message>Nachricht dazu senden</button>
    </div>
  `;

  article.querySelector("[data-open-message]").addEventListener("click", openMessageModal);
  return article;
}

function renderPublicPosts() {
  if (!publicPosts) {
    return;
  }

  publicPosts.innerHTML = "";
  const posts = getStoredList(postStorageKey);
  posts.slice().reverse().forEach((post) => {
    publicPosts.append(createPublicPost(post));
  });
}

function renderAdminMessages() {
  if (!adminMessages) {
    return;
  }

  const messages = getStoredList(messageStorageKey);
  adminMessages.innerHTML = "";

  if (messages.length === 0) {
    adminMessages.innerHTML = '<p class="empty-state">Noch keine Nachrichten.</p>';
    return;
  }

  messages.slice().reverse().forEach((message) => {
    const item = document.createElement("article");
    item.className = "admin-item";
    item.innerHTML = `
      <h3>${message.topic || "Ohne Thema"}</h3>
      <p><strong>${message.sender || "Anonym"}</strong> - ${message.date}</p>
      <p>${message.text}</p>
    `;
    adminMessages.append(item);
  });
}

function renderAdminPosts() {
  if (!adminPosts) {
    return;
  }

  const posts = getStoredList(postStorageKey);
  adminPosts.innerHTML = "";

  if (posts.length === 0) {
    adminPosts.innerHTML = '<p class="empty-state">Noch keine Beitraege.</p>';
    return;
  }

  posts.slice().reverse().forEach((post) => {
    const item = document.createElement("article");
    item.className = "admin-item";
    item.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.date} - ${post.type}</p>
      <p>${post.text}</p>
    `;
    adminPosts.append(item);
  });
}

openButtons.forEach((button) => {
  button.addEventListener("click", openMessageModal);
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeMessageModal);
});

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeMessageModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMessageModal();
  }
});

if (messageForm) {
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const inputs = messageForm.querySelectorAll("input, textarea");
    const message = {
      sender: inputs[0].value.trim(),
      topic: inputs[1].value.trim(),
      text: inputs[2].value.trim(),
      date: new Date().toLocaleString("de-DE"),
    };

    const messages = getStoredList(messageStorageKey);
    messages.push(message);
    saveStoredList(messageStorageKey, messages);

    messageForm.reset();
    closeMessageModal();
    alert("Nachricht wurde gespeichert.");
  });
}

if (adminPostForm) {
  adminPostForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const post = {
      title: document.querySelector("#admin-title").value.trim(),
      text: document.querySelector("#admin-text").value.trim(),
      media: document.querySelector("#admin-media").value.trim(),
      type: document.querySelector("#admin-type").value,
      date: new Date().toLocaleDateString("de-DE"),
    };

    const posts = getStoredList(postStorageKey);
    posts.push(post);
    saveStoredList(postStorageKey, posts);

    adminPostForm.reset();
    renderAdminPosts();
    alert("Beitrag wurde auf der User-Seite veroeffentlicht.");
  });
}

renderPublicPosts();
renderAdminMessages();
renderAdminPosts();
