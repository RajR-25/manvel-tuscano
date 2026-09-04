(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-ready');

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------------------
     PROJECT DATA (used by the land-acquisition modal)
  --------------------------------------------------------------------- */
  const PROJECTS = {
    jindal: {
      tag: 'PARCEL / A—01',
      name: 'Jindal',
      location: 'Raigad & Ratnagiri, Maharashtra',
      acres: '2,000 Acres',
      desc: 'Large-scale land acquisition assignment undertaken for Jindal. The assignment involved identifying, negotiating and assembling parcels across the Raigad and Ratnagiri belt of Maharashtra.',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'
    },
    reliance: {
      tag: 'PARCEL / A—02',
      name: 'Reliance',
      location: 'Uran, Raigad, Maharashtra',
      acres: '900 Acres',
      desc: 'Land acquisition assignment undertaken for Reliance in the Uran region, covering coordination across multiple landholders and stakeholders in the area.',
      img: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80'
    },
    dlf: {
      tag: 'PARCEL / A—03',
      name: 'DLF',
      location: 'Khalapur, Panvel, Maharashtra',
      acres: '300 Acres',
      desc: 'Large-scale land acquisition assignment undertaken for DLF in the Khalapur belt near Panvel, Maharashtra.',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'
    },
    capricorn: {
      tag: 'PARCEL / A—04',
      name: 'Capricorn Infrastructure',
      location: 'Panvel, Raigad, Maharashtra',
      acres: '200 Acres',
      desc: 'Land acquisition assignment undertaken for Capricorn Infrastructure across the Panvel region of Raigad, Maharashtra.',
      img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80'
    }
  };

  const FALLBACK_IMG =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
        <rect width="100%" height="100%" fill="#E4DDCF"/>
        <text x="50%" y="50%" font-family="monospace" font-size="14" fill="#7a7362"
          text-anchor="middle">IMAGE UNAVAILABLE</text>
      </svg>`
    );

  /* ---------------------------------------------------------------------
     IMAGE FALLBACKS
  --------------------------------------------------------------------- */
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function onErr() {
      this.removeEventListener('error', onErr);
      this.src = FALLBACK_IMG;
    }, { once: true });
  });

  /* ---------------------------------------------------------------------
     NAV: scroll state, dark-on-dark-section, active link, scroll progress
  --------------------------------------------------------------------- */
  const nav = document.getElementById('siteNav');
  const progressFill = document.getElementById('progressFill');
  const navLinks = document.querySelectorAll('[data-nav]');
  const darkSections = document.querySelectorAll('#hero, #industrial, #scale, #hospitality');
  const allSections = document.querySelectorAll('main section[id]');

  function updateNavOnScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);

    // dark background check: is nav currently overlapping a dark section?
    let isDark = false;
    darkSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 90 && r.bottom >= 90) isDark = true;
    });
    nav.classList.toggle('is-dark', isDark);

    // progress bar
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (y / scrollable) * 100 : 0;
    progressFill.style.width = pct + '%';

    // active link
    let currentId = '';
    allSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 140 && r.bottom > 140) currentId = sec.id;
    });
    navLinks.forEach((a) => {
      const match = a.getAttribute('href') === '#' + currentId;
      a.classList.toggle('is-active', match && currentId !== '');
    });
  }
  window.addEventListener('scroll', updateNavOnScroll, { passive: true });
  updateNavOnScroll();

  /* ---------------------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------------------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function openMobileMenu() {
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  burger.addEventListener('click', () => {
    burger.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
  });
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileMenu));

  /* ---------------------------------------------------------------------
     SMOOTH SCROLL for in-page anchors (native smooth-scroll + nav offset)
  --------------------------------------------------------------------- */
  const PANEL_IDS = ['land', 'hospitality', 'industrial'];
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const bareId = id.slice(1);
      if (PANEL_IDS.includes(bareId)) {
        // Ensure the matching experience panel is switched in before scrolling to it
        showPanel(bareId, { scrollTo: true });
        return;
      }
      const navH = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------------------
     EXPERIENCE TABS (land / hospitality / industrial)
  --------------------------------------------------------------------- */
  const tabs = document.querySelectorAll('.exp-tab');
  const panels = document.querySelectorAll('[data-panel]');

  function showPanel(name, { scrollTo = false } = {}) {
    panels.forEach((p) => p.classList.toggle('is-visible', p.dataset.panel === name));
    tabs.forEach((t) => {
      const active = t.dataset.tab === name;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    if (scrollTo) {
      const target = document.querySelector(`[data-panel="${name}"]`);
      const navH = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    ScrollTrigger && ScrollTrigger.refresh();
  }
  tabs.forEach((t) => t.addEventListener('click', () => showPanel(t.dataset.tab, { scrollTo: true })));
  showPanel('land');

  /* ---------------------------------------------------------------------
     PROJECT MODAL (Land Acquisition case studies)
  --------------------------------------------------------------------- */
  const modal = document.getElementById('projectModal');
  const modalImg = document.getElementById('modalImg');
  const modalTag = document.getElementById('modalTag');
  const modalName = document.getElementById('modalName');
  const modalLocation = document.getElementById('modalLocation');
  const modalAcres = document.getElementById('modalAcres');
  const modalDesc = document.getElementById('modalDesc');
  let lastFocused = null;

  function openModal(key) {
    const data = PROJECTS[key];
    if (!data) return;
    modalImg.src = data.img;
    modalImg.alt = data.name + ' — ' + data.location;
    modalTag.textContent = data.tag;
    modalName.textContent = data.name;
    modalLocation.textContent = data.location;
    modalAcres.textContent = data.acres;
    modalDesc.textContent = data.desc;

    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('modalClose').focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.open));
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ---------------------------------------------------------------------
     HOSPITALITY DRAG-TO-SCROLL RAIL
  --------------------------------------------------------------------- */
  const rail = document.getElementById('stayRail');
  let isDown = false, startX, scrollLeft;

  rail.addEventListener('pointerdown', (e) => {
    isDown = true;
    rail.classList.add('is-dragging');
    startX = e.pageX - rail.offsetLeft;
    scrollLeft = rail.scrollLeft;
  });
  ['pointerup', 'pointerleave'].forEach((evt) =>
    rail.addEventListener(evt, () => { isDown = false; rail.classList.remove('is-dragging'); })
  );
  rail.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - rail.offsetLeft;
    rail.scrollLeft = scrollLeft - (x - startX) * 1.4;
  });
  rail.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      rail.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  /* ---------------------------------------------------------------------
     ANIMATED COUNTERS
  --------------------------------------------------------------------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target.toLocaleString('en-IN') + suffix; return; }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('en-IN') + suffix; }
    });
  }

  const counters = document.querySelectorAll('[data-count]');
  if (window.gsap && window.ScrollTrigger) {
    counters.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => animateCount(el)
      });
    });
  } else {
    counters.forEach((el) => {
      el.textContent = (parseInt(el.dataset.count, 10) || 0).toLocaleString('en-IN') + (el.dataset.suffix || '');
    });
  }

  /* ---------------------------------------------------------------------
     REVEAL ANIMATIONS (scroll-triggered fade/line reveals)
  --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.utils.toArray('.reveal-up').forEach((el, i) => {
      if (el.closest('.hero')) return; // hero elements animate via the load timeline below
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    gsap.utils.toArray('.reveal-line span').forEach((el) => {
      gsap.to(el, {
        y: '0%',
        duration: 1,
        ease: 'power4.out',
        delay: 0.15,
        scrollTrigger: { trigger: el, start: 'top 95%' }
      });
    });

    // Hero entrance on load
    gsap.timeline({ delay: 0.15 })
      .to('.hero-media img', { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
      .to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.2)
      .to('.hero-title .line span', { y: '0%', duration: 1, ease: 'power4.out', stagger: 0.09 }, 0.3)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.7)
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.82)
      .to('.hero-float-card', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.95);

    // subtle parallax on hero + industrial images
    gsap.to('.hero-media img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.industrial-media img', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.industrial', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  } else {
    // No-motion fallback: just show everything
    document.querySelectorAll('.reveal-up').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    document.querySelectorAll('.reveal-line span').forEach((el) => { el.style.transform = 'none'; });
  }

  /* ---------------------------------------------------------------------
     INDIA MAP — hub data, marker interaction, reveal animation
  --------------------------------------------------------------------- */
  const MAP_HUBS = {
    surat: {
      name: 'Surat',
      region: 'Gujarat',
      projects: [
        { name: 'Junar Sugar Ltd.', location: 'Surat, Gujarat', detail: 'Industrial project involvement', category: 'industrial' }
      ]
    },
    raigad: {
      name: 'Raigad \u2013 Panvel Belt',
      region: 'Maharashtra \u00b7 Raigad, Ratnagiri, Uran, Panvel, Khalapur, Lonavala',
      projects: [
        { name: 'Jindal', location: 'Raigad & Ratnagiri', detail: '2,000 Acres \u00b7 Land acquisition', category: 'land' },
        { name: 'Reliance', location: 'Uran, Raigad', detail: '900 Acres \u00b7 Land acquisition', category: 'land' },
        { name: 'DLF', location: 'Khalapur, Panvel', detail: '300 Acres \u00b7 Land acquisition', category: 'land' },
        { name: 'Capricorn Infrastructure', location: 'Panvel, Raigad', detail: '200 Acres \u00b7 Land acquisition', category: 'land' },
        { name: 'Lonavala Land', location: 'Valvan Dam, Lonavala', detail: '300 Acres \u00b7 In development', category: 'current' },
        { name: 'Khalapur Land', location: 'Khalapur, Raigad', detail: '800 Acres \u00b7 Current opportunity', category: 'current' }
      ]
    },
    goa: {
      name: 'Goa',
      region: 'Goa Coastline',
      projects: [
        { name: 'Hotel Casa Vente', location: 'Goa', detail: 'Hospitality venture', category: 'hospitality' },
        { name: 'Hotel Zulu Land', location: 'Anjuna Beach, Goa', detail: 'Hospitality venture', category: 'hospitality' },
        { name: 'Sea Lunch by Curlies', location: 'Goa', detail: 'Hospitality venture', category: 'hospitality' },
        { name: 'Film City Project', location: 'Goa', detail: 'Ongoing \u00b7 Current opportunity', category: 'current' }
      ]
    }
  };
  const CATEGORY_CLASS = { land: 'legend-land', hospitality: 'legend-hospitality', industrial: 'legend-industrial', current: 'legend-current' };

  const mapMarkers = document.querySelectorAll('.map-marker');
  const mapPanel = document.getElementById('mapPanel');

  function renderHub(hubKey) {
    const hub = MAP_HUBS[hubKey];
    if (!hub) return;
    const rows = hub.projects.map((p) => `
      <div class="map-panel-row">
        <span class="legend-swatch ${CATEGORY_CLASS[p.category]} map-row-icon"></span>
        <div class="map-row-body">
          <h4>${p.name}</h4>
          <p>${p.location} &middot; ${p.detail}</p>
        </div>
      </div>`).join('');
    mapPanel.innerHTML = `
      <span class="map-panel-hub-name">${hub.name}</span>
      <span class="map-panel-region">${hub.region}</span>
      <div class="map-panel-list">${rows}</div>`;
  }

  mapMarkers.forEach((m) => {
    const activate = () => {
      mapMarkers.forEach((other) => { other.classList.remove('is-active'); other.setAttribute('aria-expanded', 'false'); });
      m.classList.add('is-active');
      m.setAttribute('aria-expanded', 'true');
      renderHub(m.dataset.hub);
    };
    m.addEventListener('click', activate);
    m.addEventListener('pointerenter', activate);
    m.addEventListener('focus', activate);
  });

  /* Reveal the India outline, connector line and markers when the map scrolls into view */
  const indiaFrame = document.querySelector('.india-map-frame');
  if (indiaFrame) {
    const revealMap = () => {
      const markerInners = document.querySelectorAll('.marker-inner');
      if (!window.gsap) {
        document.querySelector('.india-path').style.opacity = 1;
        document.querySelector('.india-connector').style.strokeDashoffset = 0;
        markerInners.forEach((m) => { m.style.opacity = 1; m.style.transform = 'scale(1)'; });
        return;
      }
      const tl = gsap.timeline();
      tl.to('.india-path', { opacity: 1, duration: 1.1, ease: 'power2.out' })
        .to('.india-connector', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.6')
        .to(markerInners, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.14 }, '-=0.8');
    };
    if (window.gsap && window.ScrollTrigger && !reduceMotion) {
      ScrollTrigger.create({ trigger: indiaFrame, start: 'top 80%', once: true, onEnter: revealMap });
    } else {
      revealMap();
    }
  }

  /* ---------------------------------------------------------------------
     CONTACT FORM (front-end only — no real submission endpoint)
  --------------------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      formNote.textContent = 'Please fill in your name, email and message.';
      formNote.style.color = '#B15731';
      return;
    }
    formNote.style.color = '';
    formNote.textContent = 'Thank you — your enquiry has been noted. This form is a front-end demo and is not yet connected to an email service.';
    form.reset();
  });

  /* ---------------------------------------------------------------------
     FOOTER YEAR
  --------------------------------------------------------------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

})();
