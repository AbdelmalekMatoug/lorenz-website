/* =====================================================
   LORENZ UYTTEBROECK – Animations & Interactions
   ===================================================== */

// ---- PAGE LOAD FADE IN ----
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .6s ease';
    document.body.style.opacity = '1';
  });

  initParticles();
  initScrollReveal();
  initCounters();
  initTilt();
  initLightbox();
});

// ---- LIGHTBOX ----
function initLightbox() {
  const items = Array.from(document.querySelectorAll('.realisatie-item img'));
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  let current = 0;

  function open(i) {
    current = i;
    lbImg.src = items[i].src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function prev() { open((current - 1 + items.length) % items.length); }
  function next() { open((current + 1) % items.length); }

  items.forEach((img, i) => img.parentElement.addEventListener('click', () => open(i)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', prev);
  document.getElementById('lbNext').addEventListener('click', next);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     close();
  });
}

// ---- STICKY HEADER ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
});

// ---- MOBILE MENU ----
const hamburger   = document.getElementById('hamburger');
const mobNav      = document.getElementById('mobNav');
const mobBackdrop = document.getElementById('mobBackdrop');
const mobClose    = document.getElementById('mobClose');

function openMenu() {
  mobNav.classList.add('open');
  mobBackdrop.classList.add('active');
  mobNav.setAttribute('aria-hidden', 'false');
  hamburger.classList.add('open');
  document.body.classList.add('menu-open');
}
function closeMenu() {
  mobNav.classList.remove('open');
  mobBackdrop.classList.remove('active');
  mobNav.setAttribute('aria-hidden', 'true');
  hamburger.classList.remove('open');
  document.body.classList.remove('menu-open');
}

hamburger.addEventListener('click', () => mobNav.classList.contains('open') ? closeMenu() : openMenu());
mobClose.addEventListener('click', closeMenu);
mobBackdrop.addEventListener('click', closeMenu);
document.querySelectorAll('.mob-nav-link').forEach(l => l.addEventListener('click', closeMenu));

// ---- ACTIVE NAV ----
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  document.querySelectorAll('.mob-nav-link').forEach(l =>
    l.classList.toggle('active', l.getAttribute('href') === '#' + current));
}

// =====================================================
// HERO PARTICLE CANVAS (snowflakes + warm dots)
// =====================================================
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'heroCanvas';
  canvas.style.cssText = `
    position:absolute;inset:0;width:100%;height:100%;
    pointer-events:none;z-index:1;opacity:.55;
  `;
  document.querySelector('.hero').prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); spawnAll(); });

  class Particle {
    constructor(type) {
      this.type = type; // 'snow' | 'warm' | 'sun' | 'bolt'
      this.reset(true);
    }
    reset(initial = false) {
      const upward = this.type === 'warm' || this.type === 'sun';
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : (upward ? H + 20 : -20);
      this.r  = this.type === 'snow'
        ? Math.random() * 2 + 1
        : this.type === 'bolt'
        ? Math.random() * 3 + 5
        : this.type === 'sun'
        ? Math.random() * 3 + 3
        : Math.random() * 2 + 1.5;
      this.speedY = upward
        ? -(Math.random() * .5 + .25)
        :  (Math.random() * .6 + .3);
      this.speedX = (Math.random() - .5) * .4;
      this.opacity = Math.random() * .4 + .45;
      this.spin    = Math.random() * Math.PI * 2;
      this.spinSpeed = this.type === 'bolt' ? 0 : (Math.random() - .5) * .03;
      this.arms    = this.type === 'snow' ? (Math.random() > .5 ? 6 : 4) : 0;
    }
    drawSnowflake() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.spin);
      ctx.globalAlpha = this.opacity;
      ctx.strokeStyle = 'rgba(180,210,255,1)';
      ctx.lineWidth = .8;
      for (let i = 0; i < this.arms; i++) {
        ctx.rotate((Math.PI * 2) / this.arms);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.r * 4);
        ctx.moveTo(0, -this.r * 1.5);
        ctx.lineTo(-this.r, -this.r * 2.5);
        ctx.moveTo(0, -this.r * 1.5);
        ctx.lineTo( this.r, -this.r * 2.5);
        ctx.stroke();
      }
      ctx.restore();
    }
    drawWarm() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,130,31,1)`;
      ctx.fill();
      ctx.restore();
    }
    drawSun() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.spin);
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,210,50,1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,50,1)';
      ctx.lineWidth = .7;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (this.r + 1.5), Math.sin(a) * (this.r + 1.5));
        ctx.lineTo(Math.cos(a) * (this.r * 2.8),  Math.sin(a) * (this.r * 2.8));
        ctx.stroke();
      }
      ctx.restore();
    }
    drawBolt() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = 'rgba(255,228,30,1)';
      ctx.shadowColor = 'rgba(255,210,0,.8)';
      ctx.shadowBlur = 8;
      const s = this.r * 2.8;
      ctx.beginPath();
      ctx.moveTo( .30*s, -s);      // top-right
      ctx.lineTo(-.20*s,  .15*s);  // center-left (lower)
      ctx.lineTo( .25*s,  .15*s);  // center-right (lower)  ← horizontal step
      ctx.lineTo(-.30*s,  s);      // bottom-left
      ctx.lineTo( .15*s, -.15*s);  // center-right (upper)
      ctx.lineTo(-.25*s, -.15*s);  // center-left (upper)   ← horizontal step back
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    update() {
      this.y    += this.speedY;
      this.x    += this.speedX + Math.sin(this.y * .015) * .3;
      this.spin += this.spinSpeed;
      const upward = this.type === 'warm' || this.type === 'sun';
      if (!upward && this.y > H + 20) this.reset();
      if ( upward && this.y < -20)    this.reset();
    }
    draw() {
      switch (this.type) {
        case 'snow': this.drawSnowflake(); break;
        case 'warm': this.drawWarm();      break;
        case 'sun':  this.drawSun();       break;
        case 'bolt': this.drawBolt();      break;
      }
    }
  }

  function spawnAll() {
    particles = [];
    const count = Math.min(60, Math.floor(W / 22));
    for (let i = 0; i < count; i++)           particles.push(new Particle('snow'));
    for (let i = 0; i < count * .4; i++)      particles.push(new Particle('warm'));
    for (let i = 0; i < count * .25; i++)     particles.push(new Particle('sun'));
    for (let i = 0; i < count * .2; i++)      particles.push(new Particle('bolt'));
  }
  spawnAll();

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

// =====================================================
// SCROLL REVEAL (staggered)
// =====================================================
function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity:0; transform:translateY(36px); transition:opacity .65s cubic-bezier(.4,0,.2,1), transform .65s cubic-bezier(.4,0,.2,1); }
    .reveal.visible { opacity:1; transform:translateY(0); }
    .reveal-left  { opacity:0; transform:translateX(-40px); transition:opacity .7s ease, transform .7s ease; }
    .reveal-left.visible  { opacity:1; transform:translateX(0); }
    .reveal-right { opacity:0; transform:translateX(40px);  transition:opacity .7s ease, transform .7s ease; }
    .reveal-right.visible { opacity:1; transform:translateX(0); }
  `;
  document.head.appendChild(style);

  // Tag elements
  document.querySelectorAll('.dienst-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.waarom-item').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.08}s`;
  });
  document.querySelectorAll('.contact-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.section-header').forEach(el => el.classList.add('reveal'));
  document.querySelector('.over-visual')?.classList.add('reveal-left');
  document.querySelector('.over-content')?.classList.add('reveal-right');
  document.querySelector('.contact-form')?.classList.add('reveal-right');
  document.querySelector('.cta-inner')?.classList.add('reveal');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));
}

// =====================================================
// COUNTER ANIMATION (stats)
// =====================================================
function initCounters() {
  const stats = document.querySelectorAll('.stat strong');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const raw = el.textContent.trim();
      // only animate purely numeric values
      const num = parseFloat(raw);
      if (isNaN(num)) { io.unobserve(el); return; }
      const suffix = raw.replace(String(num), '');
      const duration = 1600;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (num < 10 ? (num * eased).toFixed(0) : Math.round(num * eased)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = raw;
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: .8 });
  stats.forEach(s => io.observe(s));
}

// =====================================================
// 3D TILT ON CARDS
// =====================================================
function initTilt() {
  document.querySelectorAll('.dienst-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s ease, box-shadow .3s ease, border-color .3s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform .1s ease, box-shadow .3s ease, border-color .3s ease';
    });
  });
}


// ---- CONTACT FORM ----
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');

  // Belgian phone validation (strip non-digits, check 10 digits starting with 0 or 11 with 32)
  const telInput = form.querySelector('#telefoon');
  const digits   = telInput.value.replace(/\D/g, '');
  const validTel = /^0\d{9}$/.test(digits) || /^32\d{9}$/.test(digits);
  if (!validTel) {
    telInput.setCustomValidity('Voer een geldig Belgisch nummer in (bijv. 0470 00 00 00)');
    telInput.reportValidity();
    return;
  }
  telInput.setCustomValidity('');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Versturen...';

  try {
    const res = await fetch('https://formspree.io/f/JOUW_FORM_ID', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const msg = document.getElementById('formSuccess');
      msg.style.display = 'flex';
      msg.style.animation = 'fadeSlideIn .4s ease';
      form.reset();
    } else {
      alert('Er is iets misgegaan. Stuur een e-mail naar Lorenz.uyttebroeck@hotmail.com');
    }
  } catch {
    alert('Geen verbinding. Probeer later opnieuw.');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Offerte aanvragen';
}
