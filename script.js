/* ==========================================================
   César Medina Tineo — Portafolio profesional
   Render de la Tabla de Contenidos (publicaciones),
   pieza destacada, filtros, búsqueda y paginación.
   ========================================================== */

const POSTS_URL = './data/posts.json';

const PER_PAGE = 10;

const TYPE_LABEL = {
  proyecto: 'Investigación',
  opinion:  'Opinión',
};

const dom = {
  postsContainer: document.getElementById('postsContainer'),
  emptyState:     document.getElementById('emptyState'),
  pagination:     document.getElementById('pagination'),
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
let filtered = [];      // resultado actual de filtros + orden
let currentPage = 1;

/* -----------------------
   Utilidades
   ----------------------- */
const isExternal = url => /^https?:\/\//i.test(url || '');

// Parsea una fecha "YYYY-MM-DD" como fecha local (no UTC) para evitar
// que zonas horarias negativas la corran un día atrás (p. ej. 2026-05-01
// mostrándose como "30 de abril" en GMT-4).
const parseLocalDate = iso => {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
};

const formatDate = iso => {
  const d = parseLocalDate(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-DO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatYear = iso => {
  const d = parseLocalDate(iso);
  return d ? d.getFullYear() : '—';
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
  // El índice es global dentro del listado filtrado, así la numeración
  // continúa de una página a la siguiente (11, 12… en la página 2).
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
   Paginación
   ----------------------- */
// Construye la secuencia de páginas a mostrar, con elipsis cuando hay muchas:
// 1 … 4 5 [6] 7 8 … 20
const pageWindow = (total, current) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const ordered = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of ordered) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
};

const goToPage = (n, { scroll = true } = {}) => {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  currentPage = Math.min(Math.max(1, n), totalPages);
  renderCurrentPage();
  if (scroll) {
    const anchor = document.getElementById('publicaciones');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const renderPagination = (totalPages) => {
  if (!dom.pagination) return;
  dom.pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const makeBtn = (label, page, opts = {}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'page-btn' + (opts.extra ? ' ' + opts.extra : '');
    b.textContent = label;
    if (opts.current) {
      b.classList.add('is-current');
      b.setAttribute('aria-current', 'page');
    }
    if (opts.disabled) {
      b.disabled = true;
    } else {
      b.addEventListener('click', () => goToPage(page));
    }
    if (opts.ariaLabel) b.setAttribute('aria-label', opts.ariaLabel);
    return b;
  };

  // Anterior
  dom.pagination.appendChild(
    makeBtn('‹', currentPage - 1, {
      extra: 'page-arrow',
      disabled: currentPage === 1,
      ariaLabel: 'Página anterior',
    })
  );

  // Números (con elipsis)
  pageWindow(totalPages, currentPage).forEach(item => {
    if (item === '…') {
      const span = document.createElement('span');
      span.className = 'page-ellipsis';
      span.textContent = '…';
      span.setAttribute('aria-hidden', 'true');
      dom.pagination.appendChild(span);
    } else {
      dom.pagination.appendChild(
        makeBtn(String(item), item, {
          current: item === currentPage,
          ariaLabel: `Página ${item}`,
        })
      );
    }
  });

  // Siguiente
  dom.pagination.appendChild(
    makeBtn('›', currentPage + 1, {
      extra: 'page-arrow',
      disabled: currentPage === totalPages,
      ariaLabel: 'Página siguiente',
    })
  );
};

const renderCurrentPage = () => {
  dom.postsContainer.innerHTML = '';

  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    if (dom.pagination) dom.pagination.innerHTML = '';
    return;
  }
  dom.emptyState.classList.add('hidden');

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);

  slice.forEach((p, i) => dom.postsContainer.appendChild(renderEntry(p, start + i)));
  renderPagination(totalPages);
  observeReveal();
};

/* -----------------------
   Filtros, búsqueda, orden
   ----------------------- */
const applyFilters = () => {
  const q = dom.search.value.trim().toLowerCase();
  const type = activeType;
  const sort = dom.sort.value;

  filtered = posts.filter(p => {
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

  // Cualquier cambio de filtro/búsqueda/orden reinicia a la primera página.
  currentPage = 1;
  renderCurrentPage();
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
    posts = await res.json();
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
