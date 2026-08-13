// ---------- load content.json and render the whole page ----------
async function loadContent() {
  const res = await fetch('content.json', { cache: 'no-store' });
  return res.json();
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function render(data) {
  // ---- site basics ----
  document.title = `${data.site.name} — Actor`;
  document.getElementById('logo').textContent = data.site.name;
  document.getElementById('footerLogo').textContent = data.site.name;
  if (data.site.accent) document.documentElement.style.setProperty('--accent', data.site.accent);

  // ---- hero ----
  const heroBg = document.getElementById('heroBg');
  heroBg.innerHTML = '';
  data.hero.images.forEach((src, i) => {
    const slide = el('div', 'hero-slide' + (i === 0 ? ' active' : ''));
    slide.style.backgroundImage = `url('${src}')`;
    heroBg.appendChild(slide);
  });
  document.getElementById('heroEyebrow').textContent = data.site.eyebrow;
  document.getElementById('heroName').innerHTML = data.site.name.split(' ').join('<br>');
  document.getElementById('heroTag').textContent = data.site.tagline;

  // ---- about ----
  document.getElementById('aboutPortrait').src = data.about.portrait;
  document.getElementById('aboutPortrait').alt = `${data.site.name} — portrait`;
  document.getElementById('aboutHeading').innerHTML = data.about.heading;
  document.getElementById('aboutBio').textContent = data.about.bio;
  const bioNoteEl = document.getElementById('aboutBioNote');
  if (data.about.bioNote) { bioNoteEl.innerHTML = `<em>${data.about.bioNote}</em>`; bioNoteEl.style.display = ''; }
  else { bioNoteEl.style.display = 'none'; }
  const statRow = document.getElementById('statRow');
  statRow.innerHTML = '';
  data.about.stats.forEach(s => {
    statRow.appendChild(el('div', null, `<span>${s.value}</span><small>${s.label}</small>`));
  });

  // ---- range ----
  const rangeGrid = document.getElementById('rangeGrid');
  rangeGrid.innerHTML = '';
  data.range.forEach(r => {
    rangeGrid.appendChild(el('div', 'range-card',
      `<img src="${r.image}" alt="${r.title}" loading="lazy">
       <h3>${r.title}</h3><p>${r.desc}</p>`));
  });

  // ---- gallery filters ----
  const filters = document.getElementById('filters');
  filters.innerHTML = '';
  const allBtn = el('button', 'filter-btn active', 'All');
  allBtn.dataset.filter = 'all';
  filters.appendChild(allBtn);
  data.galleryCategories.forEach(c => {
    const btn = el('button', 'filter-btn', c.label);
    btn.dataset.filter = c.key;
    filters.appendChild(btn);
  });

  // ---- gallery grid ----
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  const items = [];
  data.galleryCategories.forEach(c => {
    (data.gallery[c.key] || []).forEach(src => {
      const thumb = src.replace(/(\.[a-zA-Z0-9]+)$/, '_thumb$1');
      items.push({ cat: c.key, full: src, thumb, label: c.label });
    });
  });
  items.forEach((item, i) => {
    const card = el('div', 'gallery-item');
    card.dataset.cat = item.cat;
    const img = el('img');
    img.loading = 'lazy';
    img.alt = `${item.label} — ${data.site.name}`;
    img.src = item.thumb;
    img.onerror = () => { img.onerror = null; img.src = item.full; };
    card.appendChild(img);
    card.addEventListener('click', () => openLightbox(i));
    grid.appendChild(card);
  });

  // ---- reel ----
  document.querySelector('#reel h2').textContent = data.reel.heading;
  document.querySelector('.reel-placeholder p:first-child').textContent = data.reel.status;
  document.querySelector('.reel-placeholder p.muted').textContent = data.reel.note;

  // ---- resume ----
  fillList('vitalsList', data.resume.vitals);
  fillList('skillsList', data.resume.skills);
  const creditsList = document.getElementById('creditsList');
  creditsList.innerHTML = '';
  data.resume.credits.forEach(c => {
    creditsList.appendChild(el('li', null, `<span>${c.title}</span><span>${c.meta}</span>`));
  });
  document.getElementById('resumeNote').textContent = data.resume.note;

  // ---- contact ----
  const emailLinks = document.querySelectorAll('.js-email');
  emailLinks.forEach(a => { a.href = `mailto:${data.contact.email}`; a.textContent = data.contact.email; });
  const igLink = document.getElementById('igLink');
  const imdbLink = document.getElementById('imdbLink');
  igLink.href = data.contact.instagram || '#';
  imdbLink.href = data.contact.imdb || '#';

  document.getElementById('year').textContent = new Date().getFullYear();

  return items;
}

function fillList(id, rows) {
  const listEl = document.getElementById(id);
  listEl.innerHTML = '';
  rows.forEach(r => listEl.appendChild(el('li', null, `<span>${r.label}</span><span>${r.value}</span>`)));
}

// ---------- filters ----------
function setupFilters() {
  document.getElementById('filters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(elm => {
      elm.classList.toggle('hide', f !== 'all' && elm.dataset.cat !== f);
    });
  });
}

// ---------- lightbox ----------
let GALLERY_ITEMS = [];
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
let currentIndex = 0;

function visibleIndices() {
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  return GALLERY_ITEMS.map((it, i) => i).filter(i => activeFilter === 'all' || GALLERY_ITEMS[i].cat === activeFilter);
}
function openLightbox(index) {
  currentIndex = index;
  lbImage.src = GALLERY_ITEMS[index].full;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function step(dir) {
  const vis = visibleIndices();
  const pos = vis.indexOf(currentIndex);
  const next = (pos + dir + vis.length) % vis.length;
  openLightbox(vis[next]);
}
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => step(-1));
document.getElementById('lbNext').addEventListener('click', () => step(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

// ---------- hero Ken Burns crossfade ----------
function setupHeroCrossfade() {
  setInterval(() => {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    let idx = [...slides].findIndex(s => s.classList.contains('active'));
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 6000);
}

// ---------- header scroll state ----------
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ---------- mobile nav ----------
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ---------- boot ----------
loadContent().then(data => {
  GALLERY_ITEMS = render(data);
  setupFilters();
  setupHeroCrossfade();
}).catch(err => {
  console.error('Failed to load content.json', err);
});
