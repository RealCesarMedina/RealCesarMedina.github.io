const postsContainer = document.getElementById("postsContainer");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const sortFilter = document.getElementById("sortFilter");

const countAll = document.getElementById("count-all");
const countProjects = document.getElementById("count-projects");
const countOpinion = document.getElementById("count-opinion");

const featuredTitle = document.getElementById("featured-title");
const featuredDate = document.getElementById("featured-date");
const featuredDescription = document.getElementById("featured-description");
const featuredLink = document.getElementById("featured-link");

const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

let allPosts = [];

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
  div.textContent = text;
  return div.innerHTML;
}

function updateMetrics(posts) {
  countAll.textContent = posts.length;
  countProjects.textContent = posts.filter(post => post.type === "proyecto").length;
  countOpinion.textContent = posts.filter(post => post.type === "opinion").length;
}

function getSortedPosts(posts, sortValue) {
  const sorted = [...posts];

  switch (sortValue) {
    case "date-asc":
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "title-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title, "es"));
      break;
    case "title-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title, "es"));
      break;
    case "date-desc":
    default:
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
  }

  return sorted;
}

function updateFeatured(posts) {
  if (!posts.length) return;

  const featured = posts.find(post => post.featured) || getSortedPosts(posts, "date-desc")[0];

  featuredTitle.textContent = featured.title;
  featuredDate.textContent = formatDate(featured.date);
  featuredDescription.textContent = featured.description;
  featuredLink.href = featured.url || "#";
}

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "post-card";

  const safeTitle = escapeHtml(post.title);
  const safeDescription = escapeHtml(post.description);
  const tagsHtml = (post.tags || [])
    .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");

  const secondaryLink = post.secondaryUrl
    ? `<a class="card-link secondary" href="${post.secondaryUrl}" target="_blank" rel="noopener noreferrer">Ver recurso</a>`
    : "";

  article.innerHTML = `
    <div class="post-top">
      <span class="post-type ${post.type}">${post.type === "proyecto" ? "Proyecto" : "Opinión"}</span>
      <span class="post-date">${formatDate(post.date)}</span>
    </div>

    <h3>${safeTitle}</h3>
    <p class="post-description">${safeDescription}</p>

    <div class="tags">${tagsHtml}</div>

    <div class="card-actions">
      <a class="card-link primary" href="${post.url}" target="_blank" rel="noopener noreferrer">Abrir</a>
      ${secondaryLink}
    </div>
  `;

  return article;
}

function renderPosts() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedType = typeFilter.value;
  const selectedSort = sortFilter.value;

  let filtered = [...allPosts];

  if (selectedType !== "todos") {
    filtered = filtered.filter(post => post.type === selectedType);
  }

  if (query) {
    filtered = filtered.filter(post => {
      const text = `${post.title} ${post.description} ${(post.tags || []).join(" ")}`.toLowerCase();
      return text.includes(query);
    });
  }

  filtered = getSortedPosts(filtered, selectedSort);

  postsContainer.innerHTML = "";

  if (!filtered.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filtered.forEach(post => {
    postsContainer.appendChild(createPostCard(post));
  });
}

async function loadPosts() {
  try {
    const response = await fetch("./data/posts.json");
    if (!response.ok) throw new Error("No se pudo cargar posts.json");

    const posts = await response.json();
    allPosts = posts;

    updateMetrics(allPosts);
    updateFeatured(allPosts);
    renderPosts();
  } catch (error) {
    postsContainer.innerHTML = `
      <article class="post-card">
        <h3>Error al cargar publicaciones</h3>
        <p class="post-description">Revisa que el archivo data/posts.json exista y esté bien escrito.</p>
      </article>
    `;
    console.error(error);
  }
}

searchInput.addEventListener("input", renderPosts);
typeFilter.addEventListener("change", renderPosts);
sortFilter.addEventListener("change", renderPosts);

loadPosts();
