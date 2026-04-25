/* ==========================================================
   César Medina Tineo — Portafolio profesional
   Lógica de filtrado, búsqueda, contadores y revelado
   ========================================================== */

const POSTS_URL = './data/posts.json';

const TYPE_LABEL = {
  proyecto: 'Investigación',
  opinion: 'Opinión',
};

const dom = {
  postsContainer: document.getElementById('postsContainer'),
  emptyState: document.getElementById('emptyState'),
  search: document.getElementById('searchInput'),
  sort: document.getElementById('sortFilter'),
  tabs: document.querySelectorAll('.tab'),
  countAll: document.getElementById('count-all'),
  countProjects: document.getElementById('count-projects'),
  countOpinion: document.getElementById('count-opinion'),
  featuredTitle: document.getElementById('featured-title'),
  featuredDesc: document.getElementById('featured-description'),
  featuredMeta: document.getElementById('featured-meta'),
  featuredTags: document.getElementById('featured-tags'),
  featuredLink: document.getElementById('featured-link'),
  year: document.getElementById('year'),
  scrollProgress: document.getElementById('scrollProgress'),
};

let posts = [];
let activeType = 'todos';

const isExternal = url => /^https?:\/\//i.test(url || '');

const formatDate = iso => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* -----------------------
   Render
   ----------------------- */
const renderPostCard = post => {
  const article = document.createElement('article');
  article.className = 'post-card reveal';
  article.setAttribute('role', 'listitem');

  const tags = (post.tags || [])
    .map(t => `<span class="post-tag">${escapeHtml(t)}</span>`)
    .join('');

  const external = isExternal(post.url);
  const target = external ? '_blank' : '_self';
  const rel = external ? 'noopener noreferrer' : '';

  article.innerHTML = `
    <div class="post-meta">
      <span class="post-type ${escapeHtml(post.type)}">${escapeHtml(TYPE_LABEL[post.type] || post.type)}</span>
      <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
    </div>
    <h3 class="post-title">${escapeHtml(post.title)}</h3>
    <p class="post-desc">${escapeHtml(post.description || '')}</p>
    <div class="post-tags">${tags}</div>
    <span class="post-link">
      ${external ? 'Leer artículo' : 'Abrir documento'}
      <span class="post-arrow" aria-hidden="true">↗</span>
    </span>
    <a class="post-card-link" href="${encodeURI(post.url || '#')}" target="${target}" rel="${rel}" aria-label="${escapeHtml(post.title)}"></a>
  `;
  return article;
};

const renderFeatured = () => {
  if (!posts.length) return;
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sorted.find(p => p.featured) || sorted[0];

  dom.featuredTitle.textContent = featured.title;
  dom.featuredDesc.textContent = featured.description || '';
  dom.featuredMeta.textContent = `${TYPE_LABEL[featured.type] || ''} · ${formatDate(featured.date)}`;

  dom.featuredLink.href = featured.url || '#';
  if (isExternal(featured.url)) {
    dom.featuredLink.target = '_blank';
    dom.featuredLink.rel = 'noopener noreferrer';
  } else {
    dom.featuredLink.removeAttribute('target');
    dom.featuredLink.removeAttribute('rel');
  }

  dom.featuredTags.innerHTML = (featured.tags || [])
    .slice(0, 4)
    .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
    .join('');
};

const animateCount = (el, target, ms = 900) => {
  const start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const renderCounts = () => {
  const total = posts.length;
  const projects = posts.filter(p => p.type === 'proyecto').length;
  const opinion = posts.filter(p => p.type === 'opinion').length;
  animateCount(dom.countAll, total);
  animateCount(dom.countProjects, projects);
  animateCount(dom.countOpinion, opinion);
};

/* -----------------------
   Filtros y orden
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
      case 'date-asc': return new Date(a.date) - new Date(b.date);
      case 'date-desc': return new Date(b.date) - new Date(a.date);
      case 'title-asc': return a.title.localeCompare(b.title, 'es');
      case 'title-desc': return b.title.localeCompare(a.title, 'es');
      default: return 0;
    }
  });

  dom.postsContainer.innerHTML = '';
  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    return;
  }
  dom.emptyState.classList.add('hidden');
  filtered.forEach(p => dom.postsContainer.appendChild(renderPostCard(p)));
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
const initTabs = () => {
  dom.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dom.tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      activeType = tab.dataset.filter;
      applyFilters();
    });
  });
};

const initScrollProgress = () => {
  if (!dom.scrollProgress) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = max > 0 ? h.scrollTop / max : 0;
    dom.scrollProgress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
};

/* -----------------------
   Init
   ----------------------- */
const init = async () => {
  if (dom.year) dom.year.textContent = new Date().getFullYear();
  initTabs();
  initScrollProgress();

  try {
    const res = await fetch(POSTS_URL, { cache: 'no-store' });
    posts = await res.json();
  } catch (e) {
    console.error('Error cargando publicaciones:', e);
    posts = [];
  }

  renderCounts();
  renderFeatured();
  applyFilters();

  dom.search.addEventListener('input', applyFilters);
  dom.sort.addEventListener('change', applyFilters);
};

document.addEventListener('DOMContentLoaded', init);
