/* ==========================================================
   César Medina Tineo — Portafolio profesional
   Render de la Tabla de Contenidos (publicaciones),
   pieza destacada, filtros y búsqueda.
   ========================================================== */

const POSTS_URL = './data/posts.json';

const TYPE_LABEL = {
  proyecto: 'Investigación',
  opinion:  'Opinión',
};

const dom = {
  postsContainer: document.getElementById('postsContainer'),
  emptyState:     document.getElementById('emptyState'),
  search:         document.getElementById('searchInput'),
  sort:           document.getElementById('sortFilter'),
  filters:        document.querySelectorAll('.filter'),
  featuredTitle:  document.getElementById('featured-title'),
  featuredDesc:   document.getElementById('featured-description'),
  featuredMeta:   document.getElementById('featured-meta'),
  featuredTags:   document.getElementById('featured-tags'),
  featuredLink:   document.getElementById('featured-link'),
  year:           document.getElementById('year'),
};

let posts = [];
let activeType = 'todos';

/* -----------------------
   Utilidades
   ----------------------- */
const isExternal = url => /^https?:\/\//i.test(url || '');

const formatDate = iso => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-DO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatYear = iso => {
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.getFullYear();
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* -----------------------
   Render: entrada de TOC
   ----------------------- */
const renderEntry = (post, index) => {
  const li = document.createElement('li');
  li.className = 'toc-entry reveal';

  const tags = (post.tags || [])
    .map(t => `<span>${escapeHtml(t)}</span>`)
    .join('');

  const external = isExternal(post.url);
  const target = external ? '_blank' : '_self';
  const rel    = external ? 'noopener noreferrer' : '';

  // Cifras antiguas con ceros a la izquierda: 01, 02, 03…
  const num = String(index + 1).padStart(2, '0');
  const year = formatYear(post.date);
  const typeLabel = TYPE_LABEL[post.type] || post.type;

  li.innerHTML = `
    <span class="toc-num">${num}</span>
    <div class="toc-body">
      <p class="toc-kicker">${escapeHtml(typeLabel)} · ${year}</p>
      <h3 class="toc-title">${escapeHtml(post.title)}</h3>
      <p class="toc-desc">${escapeHtml(post.description || '')}</p>
      <p class="toc-tags">${tags}</p>
    </div>
    <span class="toc-link">Leer</span>
    <a class="toc-card-link" href="${encodeURI(post.url || '#')}" target="${target}" rel="${rel}" aria-label="${escapeHtml(post.title)}"></a>
  `;
  return li;
};

/* -----------------------
   Render: pieza destacada
   ----------------------- */
const renderFeatured = () => {
  if (!posts.length) return;
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sorted.find(p => p.featured) || sorted[0];

  dom.featuredTitle.textContent = featured.title;
  dom.featuredDesc.textContent  = featured.description || '';
  dom.featuredMeta.textContent  = `${TYPE_LABEL[featured.type] || ''} · ${formatDate(featured.date)}`;

  dom.featuredLink.href = featured.url || '#';
  if (isExternal(featured.url)) {
    dom.featuredLink.target = '_blank';
    dom.featuredLink.rel    = 'noopener noreferrer';
  } else {
    dom.featuredLink.removeAttribute('target');
    dom.featuredLink.removeAttribute('rel');
  }

  dom.featuredTags.innerHTML = (featured.tags || [])
    .slice(0, 4)
    .map(t => `<li>${escapeHtml(t)}</li>`)
    .join('');
};

/* -----------------------
   Filtros, búsqueda, orden
   ----------------------- */
const applyFilters = () => {
  const q = dom.search.value.trim().toLowerCase();
  const type = activeType;
  const sort = dom.sort.value;

  let filtered = posts.filter(p => {
    if (type !== 'todos' && p.type !== type) return false;
    if (!q) return true;
    const haystack = [p.title, p.description, ...(p.tags || [])].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  filtered.sort((a, b) => {
    switch (sort) {
      case 'date-asc':   return new Date(a.date) - new Date(b.date);
      case 'date-desc':  return new Date(b.date) - new Date(a.date);
      case 'title-asc':  return a.title.localeCompare(b.title, 'es');
      case 'title-desc': return b.title.localeCompare(a.title, 'es');
      default:           return 0;
    }
  });

  dom.postsContainer.innerHTML = '';
  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    return;
  }
  dom.emptyState.classList.add('hidden');
  filtered.forEach((p, i) => dom.postsContainer.appendChild(renderEntry(p, i)));
  observeReveal();
};

/* -----------------------
   Reveal on scroll
   ----------------------- */
const observeReveal = () => {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
};

/* -----------------------
   UI bindings
   ----------------------- */
const initFilters = () => {
  dom.filters.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filters.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      activeType = btn.dataset.filter;
      applyFilters();
    });
  });
};

/* -----------------------
   Init
   ----------------------- */
const init = async () => {
  if (dom.year) dom.year.textContent = new Date().getFullYear();
  initFilters();

  try {
    const res = await fetch(POSTS_URL, { cache: 'no-store' });
    const data = await res.json();
    // Soporta dos formatos: array al raíz o { posts: [...] } (formato del CMS)
    posts = Array.isArray(data) ? data : (data.posts || []);
  } catch (e) {
    console.error('Error cargando publicaciones:', e);
    posts = [];
  }

  renderFeatured();
  applyFilters();

  dom.search.addEventListener('input', applyFilters);
  dom.sort.addEventListener('change', applyFilters);
};

document.addEventListener('DOMContentLoaded', init);
