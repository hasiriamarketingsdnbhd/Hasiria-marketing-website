/* ================================================================
   HASIRIA MARKETING — main.js v5.0
   EloRing — June 2026
   Single file for ALL pages. Real Formspree submission, ARIA,
   accessible validation, product tabs + catalogue filter.
================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR SCROLL ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const tick = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── HAMBURGER + MOBILE NAV ── */
  const burger = document.getElementById('hamburger');
  const mNav   = document.getElementById('mobileNav');
  if (burger && mNav) {
    burger.setAttribute('aria-controls','mobileNav');
    burger.setAttribute('aria-expanded','false');
    burger.setAttribute('aria-label','Open navigation menu');
    burger.addEventListener('click', () => {
      const open = mNav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    mNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open'); mNav.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-label','Open navigation menu');
    }));
  }

  /* ── ACTIVE NAV ON SCROLL ── */
  const secs  = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a, .mobile-nav a');
  if (secs.length) {
    const lo = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const h = '#' + e.target.id;
        links.forEach(a => a.classList.toggle('active',
          a.getAttribute('href') === h || a.getAttribute('href') === ('./' + h)));
      });
    }, { rootMargin: '-44% 0px -44% 0px' });
    secs.forEach(s => lo.observe(s));
  }

  /* ── SCROLL REVEAL ── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => ro.observe(el));
  }

  /* ── COUNTER ANIMATION ── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const co = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
      const s = performance.now();
      const run = t => {
        const p = Math.min((t - s) / 1800, 1), v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = (Number.isInteger(target) ? Math.round(v) : v.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run); co.unobserve(el);
    }, { threshold: 0.5 });
    co.observe(el);
  });

  /* ── HOMEPAGE PRODUCT TABS ── */
  const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
  const panels  = document.querySelectorAll('.products-panel[data-tab]');
  if (tabBtns.length) {
    const sw = t => {
      tabBtns.forEach(b => { b.classList.toggle('active', b.dataset.tab===t); b.setAttribute('aria-selected', String(b.dataset.tab===t)); });
      panels.forEach(p  => { p.classList.toggle('active', p.dataset.tab===t);  p.setAttribute('aria-hidden',   String(p.dataset.tab!==t)); });
    };
    tabBtns.forEach(b => { b.setAttribute('role','tab'); b.addEventListener('click', () => sw(b.dataset.tab)); });
    sw(tabBtns[0].dataset.tab);
  }

  /* ── CATALOGUE PAGE FILTER ── */
  const fBtns = document.querySelectorAll('.cat-filter-btn[data-filter]');
  if (fBtns.length) {
    fBtns.forEach(btn => btn.addEventListener('click', () => {
      fBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.product-section[data-cat]').forEach(s => {
        s.style.display = (f === 'all' || s.dataset.cat === f) ? '' : 'none';
      });
      if (f !== 'all') document.querySelector(`.product-section[data-cat="${f}"]`)?.scrollIntoView({ behavior:'smooth', block:'start' });
    }));
  }

  /* ── CONTACT FORM ── */
  const form    = document.getElementById('contactForm');
  const fOK     = document.getElementById('formSuccess');
  const fErr    = document.getElementById('formError');
  const fBtn    = document.getElementById('contactSubmitBtn');

  window.resetContactForm = () => {
    fOK  && (fOK.style.display  = 'none');
    fErr && (fErr.style.display = 'none');
    if (form) { form.style.display = ''; form.reset(); }
  };

  if (form && fBtn) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      // Validate
      let ok = true;
      [['name','Full Name'],['email','Email'],['message','Message']].forEach(([n,l]) => {
        const el = form.querySelector(`[name="${n}"]`); if (!el) return;
        el.parentNode.querySelector('.fe')?.remove();
        if (!el.value.trim()) {
          ok = false; el.style.borderColor = '#fca5a5'; el.setAttribute('aria-invalid','true');
          const m = Object.assign(document.createElement('span'),{ className:'fe', textContent:`${l} is required.` });
          m.setAttribute('role','alert'); m.style.cssText='display:block;font-size:.78rem;color:#b91c1c;margin-top:3px;';
          el.parentNode.appendChild(m);
          el.addEventListener('input',() => { el.style.borderColor=''; el.parentNode.querySelector('.fe')?.remove(); el.setAttribute('aria-invalid','false'); },{ once:true });
        }
      });
      if (!ok) return;
      // Loading
      fErr && (fErr.style.display = 'none');
      fBtn.disabled = true; fBtn.setAttribute('aria-busy','true');
      const lbl = fBtn.querySelector('.btn-label'), spn = fBtn.querySelector('.btn-spinner');
      lbl && (lbl.style.display = 'none'); spn && (spn.style.display = 'inline-flex');
      try {
        const r = await fetch('https://formspree.io/f/mojbqaoq', { method:'POST', body: new FormData(form), headers:{ Accept:'application/json' } });
        if (r.ok) { form.style.display = 'none'; fOK && (fOK.style.display = 'block'); }
        else { const j = await r.json().catch(()=>({})); throw new Error(j.error || 'Error ' + r.status); }
      } catch(err) { console.error(err); fErr && (fErr.style.display = 'block'); }
      finally {
        fBtn.disabled = false; fBtn.setAttribute('aria-busy','false');
        lbl && (lbl.style.display = ''); spn && (spn.style.display = 'none');
      }
    });
  }

});
