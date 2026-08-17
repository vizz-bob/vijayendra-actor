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
  setupAboutCarousel(data);
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
    rangeGrid.appendChild(el('div', 'range-card reveal',
      `<div class="range-card-media"><img src="${r.image}" alt="${r.title}" loading="lazy"></div>
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

  // ---- gallery grid (grouped by category, with headings shown in the "All" view) ----
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  const items = [];
  data.galleryCategories.forEach(c => {
    const catPhotos = data.gallery[c.key] || [];
    const catItems = catPhotos.map(src => {
      const thumb = src.replace(/(\.[a-zA-Z0-9]+)$/, '_thumb$1');
      return { cat: c.key, full: src, thumb, label: c.label };
    });

    const block = el('div', 'gallery-category');
    block.dataset.cat = c.key;
    block.appendChild(el('h3', 'gallery-cat-heading',
      `${c.label} <span class="gallery-cat-count">${catItems.length}</span>`));
    const catGrid = el('div', 'gallery-grid');
    block.appendChild(catGrid);
    grid.appendChild(block);

    catItems.forEach(item => {
      const globalIndex = items.length;
      items.push(item);
      const card = el('div', 'gallery-item reveal');
      card.dataset.cat = item.cat;
      const img = el('img');
      img.loading = 'lazy';
      img.alt = `${item.label} — ${data.site.name}`;
      img.src = item.thumb;
      img.onerror = () => { img.onerror = null; img.src = item.full; };
      card.appendChild(img);
      card.addEventListener('click', () => openLightbox(globalIndex));
      catGrid.appendChild(card);
    });
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

  const waDigits = (data.contact.whatsapp || '').replace(/[^\d]/g, '');
  const waHref = waDigits ? `https://wa.me/${waDigits}` : '';
  const whatsappLink = document.getElementById('whatsappLink');
  const waFloat = document.getElementById('waFloat');
  [whatsappLink, waFloat].forEach(node => {
    if (!node) return;
    if (waHref) { node.href = waHref; node.style.display = ''; }
    else { node.style.display = 'none'; }
  });

  const igLink = document.getElementById('igLink');
  const imdbLink = document.getElementById('imdbLink');
  if (data.contact.instagram) { igLink.href = data.contact.instagram; igLink.style.display = ''; }
  else { igLink.style.display = 'none'; }
  if (data.contact.imdb) { imdbLink.href = data.contact.imdb; imdbLink.style.display = ''; }
  else { imdbLink.style.display = 'none'; }

  document.getElementById('year').textContent = new Date().getFullYear();

  setupContactForm(data.contact.email);

  return items;
}

// ---------- about photo carousel ----------
function setupAboutCarousel(data) {
  const frame = document.getElementById('aboutMedia');
  if (!frame) return;
  const portraits = (data.about.portraits && data.about.portraits.length)
    ? data.about.portraits
    : (data.about.portrait ? [data.about.portrait] : []);
  frame.innerHTML = '';
  if (!portraits.length) return;

  portraits.forEach((src, i) => {
    const img = el('img', 'about-slide' + (i === 0 ? ' active' : ''));
    img.src = src;
    img.alt = `${data.site.name} — portrait`;
    img.loading = 'lazy';
    frame.appendChild(img);
  });

  if (portraits.length < 2) return;

  const dots = el('div', 'about-dots');
  portraits.forEach((_, i) => {
    const dot = el('button', 'about-dot' + (i === 0 ? ' active' : ''));
    dot.type = 'button';
    dot.dataset.i = i;
    dot.setAttribute('aria-label', `Show photo ${i + 1}`);
    dots.appendChild(dot);
  });
  frame.appendChild(dots);

  let idx = 0;
  let timer = null;
  function show(i) {
    idx = i;
    frame.querySelectorAll('.about-slide').forEach((s, si) => s.classList.toggle('active', si === i));
    frame.querySelectorAll('.about-dot').forEach((d, di) => d.classList.toggle('active', di === i));
  }
  function start() { stop(); timer = setInterval(() => show((idx + 1) % portraits.length), 3200); }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.about-dot');
    if (!dot) return;
    show(parseInt(dot.dataset.i, 10));
  });
  // pause the auto-rotate on click, resume once the cursor leaves the photo
  frame.addEventListener('click', stop);
  frame.addEventListener('mouseleave', start);
  start();
}

// ---------- contact form (mailto handoff — no backend needed) ----------
function setupContactForm(email) {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const fromEmail = document.getElementById('cfEmail').value.trim();
    const message = document.getElementById('cfMessage').value.trim();
    const subject = encodeURIComponent(`New inquiry from ${name} — via portfolio site`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${fromEmail}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });
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
    const isAll = f === 'all';
    document.querySelectorAll('.gallery-category').forEach(block => {
      const match = isAll || block.dataset.cat === f;
      block.classList.toggle('hide', !match);
      // headings only make sense when browsing "All" — a single active
      // category filter already says which one you're looking at
      block.classList.toggle('single', !isAll);
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
  const frame = document.getElementById('heroBg');
  let timer = null;
  function tick() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    let idx = [...slides].findIndex(s => s.classList.contains('active'));
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }
  function start() { stop(); timer = setInterval(tick, 3200); }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  if (frame) {
    // pause the auto-rotate on click, resume once the cursor leaves the photo
    frame.addEventListener('click', stop);
    frame.addEventListener('mouseleave', start);
  }
  start();
}

// ---------- scroll reveal ----------
function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(elm => elm.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(elm => io.observe(elm));
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
  setupReveal();
}).catch(err => {
  console.error('Failed to load content.json', err);
});
