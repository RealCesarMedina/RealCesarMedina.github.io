const postsList = document.getElementById("postsList");
const emptyState = document.getElementById("emptyState");
const selectorButtons = document.querySelectorAll(".selector-btn");

let allPosts = [];
let activeTab = "proyecto";

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function renderPosts() {
  const filteredPosts = [...allPosts]
    .filter(post => post.type === activeTab)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  postsList.innerHTML = "";

  if (!filteredPosts.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredPosts.forEach(post => {
    const article = document.createElement("article");
    article.className = "post-item";

    const safeTitle = escapeHtml(post.title);
    const safeDescription = escapeHtml(post.description);
    const linkHtml = post.url
      ? `<a class="post-link" href="${post.url}" target="_blank" rel="noopener noreferrer">Abrir publicación</a>`
      : "";

    article.innerHTML = `
      <p class="post-date">${formatDate(post.date)}</p>
      <h2 class="post-title">${safeTitle}</h2>
      <p class="post-description">${safeDescription}</p>
      ${linkHtml}
    `;

    postsList.appendChild(article);
  });
}

async function loadPosts() {
  try {
    const response = await fetch("./data/posts.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar data/posts.json");
    }

    allPosts = await response.json();
    renderPosts();
  } catch (error) {
    postsList.innerHTML = `
      <article class="post-item">
        <h2 class="post-title">Error al cargar publicaciones</h2>
        <p class="post-description">Revisa que el archivo data/posts.json exista y esté bien escrito.</p>
      </article>
    `;
    console.error(error);
  }
}

selectorButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectorButtons.forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    activeTab = button.dataset.tab;
    renderPosts();
  });
});

loadPosts();
