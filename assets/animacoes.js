/* Animações de scroll — Jardel Costa Nutri
   GSAP 3 + ScrollTrigger + Lenis (rolagem suave).
   Respeita "reduzir movimento" do sistema: nesse caso nada anima. */
(function () {
  var root = document.documentElement;

  function showAll() { root.classList.remove('anim'); }

  if (!root.classList.contains('anim') || !window.gsap || !window.ScrollTrigger) {
    showAll();
    return;
  }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var EASE = 'power3.out';
  var header = document.querySelector('header');

  /* ---------- Rolagem suave (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      lerp: 0.1,
      smoothWheel: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // Links internos (#planos, #sobre...) com rolagem suave e desconto do cabeçalho fixo
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var offset = header ? header.offsetHeight : 0;
    var y = id === '#topo' ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
    lenis.scrollTo(y, { duration: 1.1 });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------- Cabeçalho ganha sombra ao rolar ---------- */
  if (header) {
    ScrollTrigger.create({
      start: 10,
      end: 'max',
      toggleClass: { targets: header, className: 'is-scrolled' }
    });
  }

  /* ---------- Entrada do topo ---------- */
  gsap.timeline({ defaults: { ease: EASE } })
    .fromTo('#topo .hero-in',
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 });
  showAll();

  /* ---------- Revelar ao rolar ---------- */
  function reveal(targets, opts) {
    var els = gsap.utils.toArray(targets);
    if (!els.length) return;
    opts = opts || {};
    var from = Object.assign({ autoAlpha: 0, y: 36 }, opts.from || {});
    gsap.set(els, from);
    ScrollTrigger.batch(els, {
      start: opts.start || 'top 88%',
      end: 'max',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          autoAlpha: 1, x: 0, y: 0, scale: 1,
          duration: opts.duration || 0.75,
          stagger: opts.stagger == null ? 0.09 : opts.stagger,
          ease: EASE,
          overwrite: 'auto',
          onStart: opts.onStart ? function () { batch.forEach(opts.onStart); } : null
        });
      }
    });
  }

  var sections = gsap.utils.toArray('body section').filter(function (s) { return s.id !== 'topo'; });

  // Títulos de seção: rótulo, título e texto em sequência
  sections.forEach(function (sec) {
    var h2 = sec.querySelector('h2');
    if (!h2 || sec.querySelector('.cta-box')) return;
    reveal(h2.parentElement.children, { stagger: 0.08, from: { y: 28 } });
  });

  // Grades de cards (objetivos, diferenciais, passos, resultados, depoimentos, presencial)
  gsap.utils.toArray('body section div[style*="display: grid"]').forEach(function (grid) {
    if (grid.id === 'plans-grid' || grid.closest('#topo')) return;
    reveal(grid.children);
  });

  // Perguntas frequentes
  reveal('#duvidas details', { from: { y: 20 }, stagger: 0.06 });

  // Seletor de planos e notas finais das seções
  reveal(['#planos .tabs', '#type-desc'], { from: { y: 20 } });
  reveal(gsap.utils.toArray('section > p:last-child, #como-funciona a[href="#planos"]'), { from: { y: 16 } });

  // Chamada final
  reveal('.cta-box', { from: { y: 40, scale: 0.96 }, duration: 0.9 });

  // Sobre: foto e texto vindo dos lados
  reveal('#sobre img', { from: { x: -40, y: 0 }, duration: 0.9 });

  /* ---------- Contadores dos resultados (−16,5 kg etc.) ---------- */
  gsap.utils.toArray('body section span').forEach(function (span) {
    var m = /^([−+\-]?)(\d+)(?:,(\d+))?\s*kg$/.exec(span.textContent.trim());
    if (!m) return;
    var sign = m[1], decimals = m[3] ? m[3].length : 0;
    var value = parseFloat(m[2] + (m[3] ? '.' + m[3] : ''));
    var counter = { v: 0 };
    ScrollTrigger.create({
      trigger: span,
      start: 'top 90%',
      end: 'max',
      once: true,
      onEnter: function () {
        gsap.to(counter, {
          v: value, duration: 1.4, ease: 'power2.out',
          onUpdate: function () {
            span.textContent = sign + counter.v.toFixed(decimals).replace('.', ',') + ' kg';
          }
        });
      }
    });
  });

  /* ---------- Cards dos planos (aparecem ao chegar e ao trocar de formato) ---------- */
  var plansGrid = document.getElementById('plans-grid');
  var plansSeen = false;
  if (plansGrid) {
    gsap.set(plansGrid.children, { autoAlpha: 0, y: 36 });
    ScrollTrigger.create({
      trigger: plansGrid,
      start: 'top 88%',
      end: 'max',
      once: true,
      onEnter: function () {
        plansSeen = true;
        gsap.to(plansGrid.children, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.09, ease: EASE });
      }
    });
    document.addEventListener('planos:render', function () {
      if (plansSeen) {
        gsap.fromTo(plansGrid.children, { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: EASE });
      } else {
        gsap.set(plansGrid.children, { autoAlpha: 0, y: 36 });
      }
    });
  }

  /* ---------- Parallax suave (só em telas grandes) ---------- */
  gsap.matchMedia().add('(min-width: 821px)', function () {
    gsap.to('#topo .hero-img', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '#topo', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.fromTo('#sobre img', { yPercent: 6 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '#sobre', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- Recalcular posições quando o layout muda ---------- */
  document.querySelectorAll('#duvidas details').forEach(function (d) {
    d.addEventListener('toggle', function () { ScrollTrigger.refresh(); });
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
