/* ==========================================================
   César Medina Tineo — Portada
   Publicaciones en dos pestañas: Investigación y Opinión.
   Cada lista muestra las entradas de data/posts.json cuyo
   `type` coincide con su atributo data-type.
   ========================================================== */

const POSTS_URL = './data/posts.json';

const isExternal = url => /^https?:\/\//i.test(url || '');
const isPdf = url => /\.pdf(?:$|[?#])/i.test(url || '');

// Fechas "YYYY-MM-DD": el año se toma del texto para no depender de zonas horarias.
const yearOf = iso => (String(iso || '').match(/^(\d{4})/) || [])[1] || '';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* -----------------------
   Render de publicaciones
   ----------------------- */
const renderWork = post => {
  const li = document.createElement('li');
  li.className = 'work';

  const newTab = isExternal(post.url) || isPdf(post.url);
  const attrs = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
  const kicker = [yearOf(post.date), isPdf(post.url) ? 'PDF' : ''].filter(Boolean).join(' - ');

  li.innerHTML = `
    <p class="work-kicker">${escapeHtml(kicker)}</p>
    <h2 class="work-title"><a href="${encodeURI(post.url || '#')}"${attrs}>${escapeHtml(post.title)}</a></h2>
    ${post.description ? `<p class="work-desc">${escapeHtml(post.description)}</p>` : ''}
  `;
  return li;
};

const renderLists = posts => {
  const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

  document.querySelectorAll('.work-list').forEach(list => {
    const items = posts.filter(p => p.type === list.dataset.type).sort(byDateDesc);
    list.replaceChildren(...items.map(renderWork));
    list.parentElement.querySelector('.empty').hidden = items.length > 0;
  });
};

/* -----------------------
   Pestañas
   ----------------------- */
const initTabs = () => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];

  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const step = e.key === 'ArrowRight' ? 1 : tabs.length - 1;
      const next = tabs[(i + step) % tabs.length];
      select(next);
      next.focus();
    });
  });
};

/* -----------------------
   Init
   ----------------------- */
const init = async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initTabs();

  let posts = [];
  try {
    const res = await fetch(POSTS_URL, { cache: 'no-store' });
    posts = await res.json();
  } catch (e) {
    console.error('Error cargando publicaciones:', e);
  }
  renderLists(posts);
};

document.addEventListener('DOMContentLoaded', init);
