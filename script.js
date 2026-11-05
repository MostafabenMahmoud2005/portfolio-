(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress, nav state, back-to-top
  const nav = $('#nav'), bar = $('#progress'), top = $('#top');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 40);
    top.classList.toggle('show', y > 600);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.onclick = () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

  // Mobile menu
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.onclick = () => setMenu(!menu.classList.contains('open'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Reveal on scroll + optional skill level bars
  $$('.chip[data-level]').forEach(c => c.style.setProperty('--lv', c.dataset.level));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); $$('.chip', e.target).forEach(c => c.classList.add('in')); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  // Active nav link
  const links = $$('a[href^="#"]', menu);
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => so.observe(s));

  // Mouse glow + hero parallax
  const glow = $('#glow'), viz = $('.viz');
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
      if (viz) viz.style.translate = `${(e.clientX / innerWidth - .5) * -14}px ${(e.clientY / innerHeight - .5) * -14}px`;
    });
  }

  // Particles
  const cv = $('#particles'), ctx = cv.getContext('2d');
  let W, H, pts = [];
  const size = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; pts = Array.from({ length: Math.min(60, W / 20 | 0) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 })); };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
      ctx.fillStyle = 'rgba(138,220,200,.6)'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
        if (d < 120) { ctx.strokeStyle = `rgba(54,194,160,${.18 * (1 - d / 120)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
    });
    if (!reduce && !document.hidden) requestAnimationFrame(draw);
  };
  size(); draw(); addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => !document.hidden && !reduce && draw());

  // Testimonial slider
  const track = $('.track'), slides = $$('.slide'), dots = $('#dots'); let idx = 0, timer;
  const go = i => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === idx));
    clearInterval(timer); if (!reduce) timer = setInterval(() => go(idx + 1), 7000);
  };
  slides.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1)); b.onclick = () => go(i); dots.append(b); });
  $('#prev').onclick = () => go(idx - 1); $('#next').onclick = () => go(idx + 1); go(0);

  // Contact form validation (front-end only)
  const form = $('#form'), st = $('#status');
  form.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('input,textarea', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle('bad', bad); if (bad) ok = false;
    });
    st.className = 'status' + (ok ? ' ok' : '');
    st.textContent = ok ? 'Form is valid, but no backend is connected yet, so nothing was sent. Please email me directly.' : 'Please fill in every field with valid details.';
  });
})();
