const initialPosts = [
  {
    type: "proyecto",
    title: "Interacción dinámica entre indicadores macroeconómicos y activos financieros",
    date: "2024-11-15",
    description: "Análisis aplicado sobre la relación entre variables macroeconómicas y el comportamiento de los activos financieros.",
    tags: ["Economía", "Macroeconomía", "Econometría"]
  },
  {
    type: "opinion",
    title: "Reflexiones sobre el entorno económico internacional y sus efectos locales",
    date: "2025-03-21",
    description: "Comentario analítico sobre hechos relevantes del entorno global y su posible transmisión hacia economías pequeñas y abiertas.",
    tags: ["Opinión", "Coyuntura", "Análisis"]
  },
  {
    type: "proyecto",
    title: "Evolución del dinero en circulación y actividad económica",
    date: "2023-09-02",
    description: "Trabajo de investigación enfocado en la evolución del dinero en circulación desde una perspectiva económica aplicada.",
    tags: ["Investigación", "Política monetaria"]
  }
];

let posts = [...initialPosts];

const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");

const postModal = document.getElementById("postModal");
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const postForm = document.getElementById("postForm");

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function renderPosts() {
  const query = searchInput.value.toLowerCase().trim();
  const filter = typeFilter.value;

  const filtered = posts
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(post => {
      const matchesType = filter === "todos" || post.type === filter;
      const searchableText = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
      const matchesSearch = searchableText.includes(query);
      return matchesType && matchesSearch;
    });

  postsContainer.innerHTML = "";

  if (filtered.length === 0) {
    postsContainer.innerHTML = `
      <div class="post-card">
        <h3>No se encontraron publicaciones</h3>
        <p class="post-description">Prueba otra búsqueda o agrega una nueva entrada.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(post => {
    const card = document.createElement("article");
    card.className = "post-card";

    card.innerHTML = `
      <span class="post-type ${post.type}">
        ${post.type === "proyecto" ? "Proyecto" : "Opinión"}
      </span>
      <h3>${post.title}</h3>
      <p class="post-date">${formatDate(post.date)}</p>
      <p class="post-description">${post.description}</p>
      <div class="tags">
        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `;

    postsContainer.appendChild(card);
  });
}

openFormBtn.addEventListener("click", () => {
  postModal.classList.remove("hidden");
});

closeFormBtn.addEventListener("click", () => {
  postModal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === postModal) {
    postModal.classList.add("hidden");
  }
});

postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newPost = {
    type: document.getElementById("postType").value,
    title: document.getElementById("postTitle").value.trim(),
    date: document.getElementById("postDate").value,
    description: document.getElementById("postDescription").value.trim(),
    tags: document.getElementById("postTags").value
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "")
  };

  posts.unshift(newPost);
  renderPosts();
  postForm.reset();
  postModal.classList.add("hidden");
});

searchInput.addEventListener("input", renderPosts);
typeFilter.addEventListener("change", renderPosts);

renderPosts();
