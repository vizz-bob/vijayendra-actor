// ---------- data: gallery images ----------
const GALLERY = {
  suit: ["2A6A3871","2A6A3872","2A6A3873","2A6A3876","2A6A3877","2A6A3879","2A6A3880","2A6A3882","2A6A3883","2A6A3885","2A6A3887","2A6A3888","2A6A3907","2A6A3916"],
  traditional: ["2A6A4029","2A6A4033","2A6A4035","2A6A4036","2A6A4038","2A6A4039","2A6A4042","2A6A4044","2A6A4046","2A6A4049"],
  casual: ["2A6A4053","2A6A4054","2A6A4057","2A6A4058","2A6A4061","2A6A4065","2A6A4067","2A6A4070","2A6A4077","2A6A4085"],
};

const LABELS = { suit: "Suit & Tie", traditional: "Traditional", casual: "Smart Casual" };

// ---------- build gallery grid ----------
const grid = document.getElementById('galleryGrid');
const items = [];
Object.entries(GALLERY).forEach(([cat, names]) => {
  names.forEach(name => {
    const full = `assets/img/gallery/${cat}/${name}.jpg`;
    const thumb = `assets/img/gallery/${cat}/${name}_thumb.jpg`;
    items.push({ cat, full, thumb, name });
  });
});

items.forEach((item, i) => {
  const el = document.createElement('div');
  el.className = 'gallery-item';
  el.dataset.cat = item.cat;
  el.dataset.index = i;
  el.innerHTML = `<img src="${item.thumb}" alt="${LABELS[item.cat]} — ${item.name}" loading="lazy">`;
  el.addEventListener('click', () => openLightbox(i));
  grid.appendChild(el);
});

// ---------- filters ----------
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(el => {
      el.classList.toggle('hide', f !== 'all' && el.dataset.cat !== f);
    });
  });
});

// ---------- lightbox ----------
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
let currentIndex = 0;

function visibleIndices() {
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  return items.map((it, i) => i).filter(i => activeFilter === 'all' || items[i].cat === activeFilter);
}

function openLightbox(index) {
  currentIndex = index;
  lbImage.src = items[index].full;
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
const slides = document.querySelectorAll('.hero-slide');
let slideIndex = 0;
setInterval(() => {
  slides[slideIndex].classList.remove('active');
  slideIndex = (slideIndex + 1) % slides.length;
  slides[slideIndex].classList.add('active');
}, 6000);

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

// ---------- footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
