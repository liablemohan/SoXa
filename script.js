/**
 * Sanskrit Platform — Phase 1 Script
 * ─────────────────────────────────────────────────────────────
 * Features:
 *  • Mobile navigation + hamburger
 *  • Hero carousel (touch, keyboard, auto-play)
 *  • Reading mode (Light / Sepia / Dark) — localStorage persisted
 *  • Script toggle (Devanāgarī / IAST / Roman) — localStorage persisted
 *  • Global search bar (expandable, basic client-side)
 *  • IntersectionObserver scroll entrance animations
 *  • Button press micro-animation
 *  • Tab UI (Contemporary Developments page)
 *  • Active nav state tracking
 *  • Reduced-motion awareness
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ============================================================
   HELPERS
   ============================================================ */

/** True if user prefers reduced motion */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Persist a key/value to localStorage safely */
const store = {
  set(key, value) {
    try { localStorage.setItem(`soxaPlatform_${key}`, value); } catch (_) {}
  },
  get(key) {
    try { return localStorage.getItem(`soxaPlatform_${key}`); } catch (_) { return null; }
  }
};

/* ============================================================
   ACTIVE NAV HIGHLIGHTING
   ============================================================ */

function initActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .bottom-nav-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   MOBILE NAV / HAMBURGER
   ============================================================ */

function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu   = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Dropdown on mobile (click to toggle)
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      e.preventDefault();
      dropdown.classList.toggle('open');
    });
  });
}

/* ============================================================
   READING MODE  — Light / Sepia / Dark
   Mode stored in localStorage and applied via body class
   ============================================================ */

const MODES       = ['mode-light', 'mode-sepia', 'mode-dark'];
const MODE_ICONS  = { 'mode-light': '☀️', 'mode-sepia': '📜', 'mode-dark': '🌙' };
const MODE_LABELS = { 'mode-light': 'Light', 'mode-sepia': 'Sepia', 'mode-dark': 'Dark' };

function applyMode(mode) {
  MODES.forEach(m => document.body.classList.remove(m));
  document.body.classList.add(mode);
  // Also set data-theme for components that use it
  document.documentElement.setAttribute('data-theme',
    mode === 'mode-dark' ? 'dark' : mode === 'mode-sepia' ? 'sepia' : 'light');

  // Update button states
  document.querySelectorAll('.reading-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Update nav icon button label
  const navBtn = document.getElementById('reading-mode-nav-btn');
  if (navBtn) {
    navBtn.querySelector('.mode-icon').textContent = MODE_ICONS[mode] || '☀️';
    navBtn.setAttribute('aria-label', `Reading mode: ${MODE_LABELS[mode]}`);
  }
}

function initReadingMode() {
  const saved = store.get('readingMode') || 'mode-light';

  // Apply saved mode on load (no transition flash)
  document.body.classList.add(saved);
  document.documentElement.setAttribute('data-theme',
    saved === 'mode-dark' ? 'dark' : saved === 'mode-sepia' ? 'sepia' : 'light');

  // Wire up all reading mode buttons on page
  document.querySelectorAll('.reading-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === saved);
    btn.addEventListener('click', () => {
      const newMode = btn.dataset.mode;
      applyMode(newMode);
      store.set('readingMode', newMode);
    });
  });

  // Nav icon button — cycles through modes
  const navBtn = document.getElementById('reading-mode-nav-btn');
  if (navBtn) {
    navBtn.querySelector('.mode-icon').textContent = MODE_ICONS[saved] || '☀️';
    navBtn.addEventListener('click', () => {
      const current = store.get('readingMode') || 'mode-light';
      const idx     = MODES.indexOf(current);
      const next    = MODES[(idx + 1) % MODES.length];
      applyMode(next);
      store.set('readingMode', next);
    });
  }
}

/* ============================================================
   SCRIPT TOGGLE  — Devanāgarī / IAST / Roman
   Swaps visible text with fade transition
   ============================================================ */

function initScriptToggle() {
  const saved = store.get('scriptMode') || 'devanagari';

  function applyScript(mode) {
    // Update elements with data-deva, data-iast, data-roman attributes
    document.querySelectorAll('[data-deva]').forEach(el => {
      const deva  = el.dataset.deva  || '';
      const iast  = el.dataset.iast  || '';
      const roman = el.dataset.roman || '';

      let text;
      if (mode === 'devanagari') {
        text = deva;
        el.className = el.className.replace(/\b(iast|roman)\b/g, '').trim() + ' devanagari';
      } else if (mode === 'iast') {
        text = iast;
        el.className = el.className.replace(/\b(devanagari|roman)\b/g, '').trim() + ' iast';
      } else {
        text = roman;
        el.className = el.className.replace(/\b(devanagari|iast)\b/g, '').trim() + ' roman';
      }

      if (!prefersReducedMotion()) {
        el.style.opacity = '0';
        el.style.transition = 'opacity 300ms ease';
        setTimeout(() => {
          el.textContent = text;
          el.style.opacity = '1';
        }, 150);
      } else {
        el.textContent = text;
      }
    });

    // Update button states
    document.querySelectorAll('.script-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.script === mode);
    });

    // Update nav button label
    const navBtn = document.getElementById('script-toggle-nav-btn');
    if (navBtn) {
      const labels = { devanagari: 'देव', iast: 'IAST', roman: 'Rom' };
      navBtn.querySelector('.script-label').textContent = labels[mode] || 'देव';
    }
  }

  // Apply saved on load
  applyScript(saved);

  // Wire up toggle buttons
  document.querySelectorAll('.script-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.script;
      applyScript(mode);
      store.set('scriptMode', mode);
    });
  });

  // Nav cycle button
  const navBtn = document.getElementById('script-toggle-nav-btn');
  if (navBtn) {
    const modes = ['devanagari', 'iast', 'roman'];
    navBtn.addEventListener('click', () => {
      const current = store.get('scriptMode') || 'devanagari';
      const next    = modes[(modes.indexOf(current) + 1) % modes.length];
      applyScript(next);
      store.set('scriptMode', next);
    });
  }
}

/* ============================================================
   GLOBAL SEARCH BAR
   ============================================================ */

function initSearch() {
  const searchWrapper = document.querySelector('.nav-search');
  const searchBtn     = document.querySelector('.nav-search-btn');
  const searchInput   = document.querySelector('.nav-search-input');
  if (!searchWrapper || !searchBtn || !searchInput) return;

  let isOpen = false;

  searchBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    searchWrapper.classList.toggle('open', isOpen);
    if (isOpen) {
      searchInput.focus();
      searchBtn.setAttribute('aria-label', 'Submit search');
    } else {
      searchInput.value = '';
      searchBtn.setAttribute('aria-label', 'Open search');
    }
  });

  // Submit on Enter
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      const query = encodeURIComponent(searchInput.value.trim());
      // Client-side: highlight matching text on page
      highlightSearchResults(searchInput.value.trim());
    }
    if (e.key === 'Escape') {
      isOpen = false;
      searchWrapper.classList.remove('open');
      searchInput.value = '';
      searchBtn.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!searchWrapper.contains(e.target) && isOpen) {
      isOpen = false;
      searchWrapper.classList.remove('open');
      searchInput.value = '';
    }
  });
}

/** Very basic client-side text highlight (Phase 1 — no backend) */
function highlightSearchResults(query) {
  // Remove previous highlights
  document.querySelectorAll('mark.search-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
  if (!query) return;

  const walker = document.createTreeWalker(
    document.querySelector('main') || document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  nodes.forEach(textNode => {
    if (!textNode.textContent.match(regex)) return;
    const span = document.createElement('span');
    span.innerHTML = textNode.textContent.replace(regex,
      '<mark class="search-highlight" style="background:rgba(200,116,42,0.25);border-radius:2px;padding:0 2px;">$1</mark>');
    textNode.parentNode.replaceChild(span, textNode);
  });
}

/* ============================================================
   HERO CAROUSEL
   ============================================================ */

function initCarousel() {
  const slides   = document.querySelectorAll('.carousel-slide');
  const dots     = document.querySelectorAll('.carousel-dot');
  const prevBtn  = document.querySelector('.carousel-arrow-left');
  const nextBtn  = document.querySelector('.carousel-arrow-right');
  const container = document.querySelector('.carousel-container');

  if (!slides.length) return;

  let current    = 0;
  let intervalId = null;
  const DURATION = 6000;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function start() {
    if (prefersReducedMotion()) return; // Don't auto-play if reduced motion
    intervalId = setInterval(() => goTo(current + 1), DURATION);
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
  }

  function restart() { stop(); start(); }

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); restart(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); restart(); });

  // Dot buttons
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); restart(); });
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    const hero = document.querySelector('.hero-carousel');
    if (!hero) return;
    if (e.key === 'ArrowLeft')  { goTo(current - 1); restart(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); restart(); }
  });

  // Touch / swipe
  if (container) {
    let touchStartX = 0;
    container.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    // Pause on hover
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
  }

  start();
}

/* ============================================================
   SCROLL ENTRANCE ANIMATIONS (IntersectionObserver)
   ============================================================ */

function initScrollAnimations() {
  if (prefersReducedMotion()) return; // Respect user preference

  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Fire once
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   CONTACT FORM
   ============================================================ */

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.textContent = 'Message sent ✓';
      btn.disabled = true;
      btn.style.background = 'var(--color-open)';
    }
    setTimeout(() => form.reset(), 1000);
  });
}

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const btn   = form.querySelector('.btn');
    if (btn) {
      btn.textContent = 'Subscribed ✓';
      btn.disabled = true;
    }
    if (input) input.value = '';
  });
}

/* ============================================================
   TABS (Contemporary Developments page)
   ============================================================ */

function initTabs() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

/* ============================================================
   TIMELINE (About page — expandable entries)
   ============================================================ */

function initTimeline() {
  document.querySelectorAll('.timeline-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const expand = document.getElementById(btn.dataset.target);
      if (!expand) return;
      const isOpen = expand.classList.toggle('open');
      btn.textContent  = isOpen ? 'Show less ↑' : 'Show more ↓';
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

/* ============================================================
   CITE BUTTONS (copy citation to clipboard)
   ============================================================ */

function initCiteButtons() {
  document.querySelectorAll('.cite-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const citation = btn.dataset.citation || btn.closest('.repo-card')?.querySelector('.repo-card-title')?.textContent?.trim() || '';
      try {
        await navigator.clipboard.writeText(citation);
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1500);
      } catch (_) {
        btn.textContent = 'Copy failed';
        setTimeout(() => { btn.textContent = 'Cite'; }, 1500);
      }
    });
  });
}

/* ============================================================
   INITIALISE ALL — Phase 1
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initMobileNav();
  initReadingMode();
  initScriptToggle();
  initSearch();
  initCarousel();
  initScrollAnimations();
  initContactForm();
  initNewsletterForm();
  initTabs();
  initTimeline();
  initCiteButtons();

  /* ── Phase 2 ── */
  initCitationModal();
  initFilterSidebar();
  initSortBar();
  initPagination();
  initExportButtons();
  initRecordDetailPage();
  initCFPTable();
  initFontSizeControls();
  initMapPage();
  initFootnotes();

  /* ── Phase 3 ── */
  initPhase3();
});

/* ============================================================
   PHASE 2 — CITATION MODAL
   ============================================================ */

/**
 * Build all 5 citation strings from a data object attached to the
 * clicked "Cite" button (data-cite-*) or from the page's global
 * RECORD_DATA object (record.html).
 */
function buildCitations(d) {
  const year = d.year || new Date().getFullYear();
  const author = d.author || 'Unknown';
  const title = d.title || 'Untitled';
  const institution = d.institution || 'Unknown Institution';
  const url = d.url || window.location.href;
  const doi = d.doi || '';
  const degree = d.degree || 'Ph.D.';
  const type = d.type || 'Thesis';
  const retrieved = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  // APA 7
  const apa = `${author} (${year}). *${title}* [${degree} dissertation, ${institution}]. SoXa Sanskrit Platform. ${url}${doi ? '\n  https://doi.org/' + doi : ''}`;

  // Chicago 17
  const chicago = `${author}. "${title}." ${degree} diss., ${institution}, ${year}. Accessed ${retrieved}. ${url}`;

  // MLA 9
  const mla = `${author}. "${title}." ${degree} dissertation, ${institution}, ${year}. SoXa Sanskrit Platform, ${url}. Accessed ${retrieved}.`;

  // BibTeX
  const key = (author.split(' ').pop() || 'author').toLowerCase() + year;
  const bibtex = `@phdthesis{${key},
  author    = {${author}},
  title     = {{${title}}},
  school    = {${institution}},
  year      = {${year}},
  type      = {${degree}},
  url       = {${url}},
  note      = {Accessed: ${retrieved}}
}`;

  // TEI-XML
  const tei = `<bibl xmlns="http://www.tei-c.org/ns/1.0" type="thesis">
  <author>${author}</author>
  <title level="m">${title}</title>
  <date when="${year}">${year}</date>
  <pubPlace>${institution}</pubPlace>
  <note type="degree">${degree}</note>
  <ref target="${url}"/>
</bibl>`;

  return { apa, chicago, mla, bibtex, tei };
}

function initCitationModal() {
  // Inject modal HTML if not already present
  if (!document.getElementById('citation-modal-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'citation-modal-overlay';
    overlay.className = 'citation-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Citation formats');
    overlay.innerHTML = `
      <div class="citation-modal" id="citation-modal">
        <div class="citation-modal-header">
          <span class="citation-modal-title">Cite this Work</span>
          <button class="citation-modal-close" aria-label="Close citation modal" id="citation-modal-close">✕</button>
        </div>
        <div class="citation-format-tabs" role="tablist">
          <button class="citation-format-tab active" role="tab" aria-selected="true"  data-format="apa">APA 7</button>
          <button class="citation-format-tab"        role="tab" aria-selected="false" data-format="chicago">Chicago</button>
          <button class="citation-format-tab"        role="tab" aria-selected="false" data-format="mla">MLA 9</button>
          <button class="citation-format-tab"        role="tab" aria-selected="false" data-format="bibtex">BibTeX</button>
          <button class="citation-format-tab"        role="tab" aria-selected="false" data-format="tei">TEI-XML</button>
        </div>
        <div class="citation-modal-body">
          <div class="citation-format-panel active" id="panel-apa">
            <div class="citation-text-box" id="cite-text-apa"></div>
            <button class="citation-copy-btn" id="copy-btn-apa">📋 Copy APA Citation</button>
          </div>
          <div class="citation-format-panel" id="panel-chicago">
            <div class="citation-text-box" id="cite-text-chicago"></div>
            <button class="citation-copy-btn" id="copy-btn-chicago">📋 Copy Chicago Citation</button>
          </div>
          <div class="citation-format-panel" id="panel-mla">
            <div class="citation-text-box" id="cite-text-mla"></div>
            <button class="citation-copy-btn" id="copy-btn-mla">📋 Copy MLA Citation</button>
          </div>
          <div class="citation-format-panel" id="panel-bibtex">
            <div class="citation-text-box" id="cite-text-bibtex"></div>
            <button class="citation-copy-btn" id="copy-btn-bibtex">📋 Copy BibTeX</button>
          </div>
          <div class="citation-format-panel" id="panel-tei">
            <div class="citation-text-box" id="cite-text-tei"></div>
            <button class="citation-copy-btn" id="copy-btn-tei">📋 Copy TEI-XML</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  const overlay = document.getElementById('citation-modal-overlay');
  const modal   = document.getElementById('citation-modal');

  function openModal(data) {
    const citations = buildCitations(data);
    const formats = ['apa', 'chicago', 'mla', 'bibtex', 'tei'];
    formats.forEach(fmt => {
      const el = document.getElementById(`cite-text-${fmt}`);
      if (el) el.textContent = citations[fmt];
    });
    // Reset to APA tab
    document.querySelectorAll('.citation-format-tab').forEach((btn, i) => {
      btn.classList.toggle('active', i === 0);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    });
    document.querySelectorAll('.citation-format-panel').forEach((panel, i) => {
      panel.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('.citation-copy-btn').forEach(btn => btn.classList.remove('copied'));
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('citation-modal-close').focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Format tabs
  document.querySelectorAll('.citation-format-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const fmt = tab.dataset.format;
      document.querySelectorAll('.citation-format-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      document.querySelectorAll('.citation-format-panel').forEach(p => {
        p.classList.toggle('active', p.id === `panel-${fmt}`);
      });
    });
  });

  // Copy buttons
  ['apa', 'chicago', 'mla', 'bibtex', 'tei'].forEach(fmt => {
    const btn = document.getElementById(`copy-btn-${fmt}`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const text = document.getElementById(`cite-text-${fmt}`)?.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = `📋 Copy ${fmt.toUpperCase() === 'APA' ? 'APA' : fmt.toUpperCase() === 'MLA' ? 'MLA' : fmt.charAt(0).toUpperCase() + fmt.slice(1)} Citation`;
        }, 2200);
      }).catch(() => {
        btn.textContent = 'Select text above and copy manually';
      });
    });
  });

  // Close
  document.getElementById('citation-modal-close')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  // Cite buttons — delegate from document, works for dynamically injected cards too
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-cite-title]') || e.target.closest('.cite-modal-btn');
    if (!btn) return;
    e.preventDefault();
    // Gather data attrs from btn
    const data = {
      title:       btn.dataset.citeTitle       || btn.closest('[data-cite-title]')?.dataset.citeTitle || 'Untitled',
      author:      btn.dataset.citeAuthor      || btn.closest('[data-cite-author]')?.dataset.citeAuthor || 'Unknown',
      institution: btn.dataset.citeInstitution || 'Unknown Institution',
      year:        btn.dataset.citeYear        || '',
      degree:      btn.dataset.citeDegree      || 'Ph.D.',
      url:         btn.dataset.citeUrl         || window.location.href,
    };
    // Try to pull from parent article card if not on btn directly
    const card = btn.closest('.repo-card, article, [data-record]');
    if (card) {
      data.title       = data.title       || card.dataset.citeTitle;
      data.author      = data.author      || card.dataset.citeAuthor;
      data.institution = data.institution || card.dataset.citeInstitution;
      data.year        = data.year        || card.dataset.citeYear;
    }
    openModal(data);
  });

  // Also expose globally for inline handlers
  window.openCitationModal = openModal;
}

/* ============================================================
   PHASE 2 — FILTER SIDEBAR
   ============================================================ */

function initFilterSidebar() {
  const sidebar   = document.querySelector('.filter-sidebar');
  const backdrop  = document.querySelector('.filter-sidebar-backdrop');
  const mobileBtn = document.querySelector('.filter-mobile-btn');
  const clearAll  = document.querySelector('.filter-clear-all');
  const searchEl  = document.querySelector('.filter-search');
  const activeBar = document.querySelector('.active-filters');
  const resultEl  = document.querySelector('.result-count strong');
  const cardsContainer = document.querySelector('.repo-cards-grid, .articles-grid, [data-filterable]');

  if (!sidebar || !cardsContainer) return;

  let cards = Array.from(cardsContainer.querySelectorAll('[data-filter-subject], article, .repo-card'));
  let activeFilters = {}; // { groupKey: Set<value> }
  let searchQuery = '';

  function getCardText(card) {
    return card.textContent.toLowerCase();
  }

  function getCardTags(card) {
    return Array.from(card.querySelectorAll('.tag, .tags span, .card-subject-tag'))
      .map(t => t.textContent.trim().toLowerCase());
  }

  function applyFilters() {
    let visible = 0;
    const hasActiveFilters = Object.values(activeFilters).some(s => s.size > 0);

    cards.forEach(card => {
      const text = getCardText(card);
      const tags = getCardTags(card);

      // Text search
      const textMatch = !searchQuery || text.includes(searchQuery);

      // Facet match — card must match at least one value from each active group
      const facetMatch = Object.entries(activeFilters).every(([, values]) => {
        if (values.size === 0) return true;
        return [...values].some(v => text.includes(v.toLowerCase()) || tags.includes(v.toLowerCase()));
      });

      const show = textMatch && facetMatch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Update result count
    if (resultEl) resultEl.textContent = visible;

    // Zero state
    const zeroState = document.querySelector('.zero-state');
    if (zeroState) zeroState.classList.toggle('visible', visible === 0);

    // Clear all visibility
    clearAll?.classList.toggle('visible', hasActiveFilters || !!searchQuery);
    mobileBtn?.classList.toggle('has-active', hasActiveFilters || !!searchQuery);

    // Update mobile badge count
    const badge = mobileBtn?.querySelector('.filter-count-badge');
    if (badge) {
      const count = Object.values(activeFilters).reduce((n, s) => n + s.size, 0);
      badge.textContent = count;
    }

    // Rebuild active chips
    renderActiveChips();
  }

  function renderActiveChips() {
    if (!activeBar) return;
    activeBar.innerHTML = '';
    Object.entries(activeFilters).forEach(([group, values]) => {
      values.forEach(val => {
        const chip = document.createElement('span');
        chip.className = 'filter-chip';
        chip.innerHTML = `${val} <button class="filter-chip-remove" aria-label="Remove filter ${val}">×</button>`;
        chip.querySelector('.filter-chip-remove').addEventListener('click', () => {
          const set = activeFilters[group];
          set.delete(val);
          // Uncheck the corresponding checkbox
          const cb = sidebar.querySelector(`input[data-filter-group="${group}"][value="${val}"]`);
          if (cb) cb.checked = false;
          applyFilters();
        });
        activeBar.appendChild(chip);
      });
    });
    // Search chip
    if (searchQuery) {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.innerHTML = `"${searchQuery}" <button class="filter-chip-remove" aria-label="Clear search">×</button>`;
      chip.querySelector('.filter-chip-remove').addEventListener('click', () => {
        searchQuery = '';
        if (searchEl) searchEl.value = '';
        applyFilters();
      });
      activeBar.appendChild(chip);
    }
  }

  // Wire checkboxes
  sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const group = cb.dataset.filterGroup || 'default';
    if (!activeFilters[group]) activeFilters[group] = new Set();
    cb.addEventListener('change', () => {
      if (cb.checked) activeFilters[group].add(cb.value);
      else activeFilters[group].delete(cb.value);
      applyFilters();
    });
  });

  // Search
  searchEl?.addEventListener('input', () => {
    searchQuery = searchEl.value.trim().toLowerCase();
    applyFilters();
  });

  // Clear all
  clearAll?.addEventListener('click', () => {
    searchQuery = '';
    if (searchEl) searchEl.value = '';
    Object.keys(activeFilters).forEach(k => activeFilters[k].clear());
    sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    applyFilters();
  });

  // Collapsible groups
  sidebar.querySelectorAll('.filter-group-label').forEach(label => {
    label.addEventListener('click', () => {
      label.closest('.filter-group').classList.toggle('collapsed');
    });
  });

  // Mobile open/close
  mobileBtn?.addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  });
  backdrop?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  });

  // Initial count
  if (resultEl) resultEl.textContent = cards.length;
}

/* ============================================================
   PHASE 2 — SORT BAR
   ============================================================ */

function initSortBar() {
  const cardsContainer = document.querySelector('.repo-cards-grid, .articles-grid, [data-filterable]');
  if (!cardsContainer) return;

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const order = btn.dataset.sort;
      const cards = Array.from(cardsContainer.children);

      cards.sort((a, b) => {
        const ya = parseInt(a.dataset.year || a.querySelector('[data-year]')?.dataset.year || '2000', 10);
        const yb = parseInt(b.dataset.year || b.querySelector('[data-year]')?.dataset.year || '2000', 10);
        const ca = parseInt(a.dataset.citations || '0', 10);
        const cb = parseInt(b.dataset.citations || '0', 10);
        if (order === 'newest') return yb - ya;
        if (order === 'oldest') return ya - yb;
        if (order === 'cited')  return cb - ca;
        return 0;
      });

      cards.forEach(card => cardsContainer.appendChild(card));
    });
  });
}

/* ============================================================
   PHASE 2 — PAGINATION
   ============================================================ */

function initPagination() {
  const container    = document.querySelector('[data-paginate]');
  const paginationEl = document.querySelector('.pagination');
  if (!container || !paginationEl) return;

  const pageSize = parseInt(container.dataset.pageSize || '10', 10);
  let allCards   = Array.from(container.querySelectorAll('.repo-card, article'));
  let currentPage = 1;

  function totalPages() {
    return Math.ceil(allCards.filter(c => c.style.display !== 'none').length / pageSize);
  }

  function showPage(page) {
    currentPage = page;
    const visible = allCards.filter(c => c.style.display !== 'none');
    const start   = (page - 1) * pageSize;
    visible.forEach((c, i) => {
      c.dataset.pageHide = (i < start || i >= start + pageSize) ? 'true' : 'false';
      c.style.visibility = c.dataset.pageHide === 'true' ? 'hidden' : '';
      c.style.position   = c.dataset.pageHide === 'true' ? 'absolute' : '';
      c.style.opacity    = c.dataset.pageHide === 'true' ? '0' : '';
      c.style.pointerEvents = c.dataset.pageHide === 'true' ? 'none' : '';
    });
    renderPagination();
    window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
  }

  function renderPagination() {
    const tp = totalPages();
    if (tp <= 1) { paginationEl.innerHTML = ''; return; }
    const items = [];
    items.push(`<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">←</button>`);
    for (let i = 1; i <= tp; i++) {
      if (i === 1 || i === tp || Math.abs(i - currentPage) <= 1) {
        items.push(`<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}" aria-label="Page ${i}" aria-current="${i === currentPage ? 'page' : 'false'}">${i}</button>`);
      } else if (Math.abs(i - currentPage) === 2) {
        items.push(`<span class="page-ellipsis">…</span>`);
      }
    }
    items.push(`<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === tp ? 'disabled' : ''} aria-label="Next page">→</button>`);
    paginationEl.innerHTML = items.join('');
    paginationEl.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => { if (!btn.disabled) showPage(parseInt(btn.dataset.page, 10)); });
    });
  }

  showPage(1);
}

/* ============================================================
   PHASE 2 — EXPORT (CSV + BibTeX)
   ============================================================ */

function initExportButtons() {
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.export;
      const cards  = Array.from(document.querySelectorAll('.repo-card, article')).filter(c => c.style.display !== 'none');

      if (format === 'csv') {
        const rows = [['Title','Author','Institution','Year','Degree','Access']];
        cards.forEach(c => {
          rows.push([
            c.dataset.citeTitle       || c.querySelector('.repo-card-title, .article-card-title, h2, h3')?.textContent?.trim() || '',
            c.dataset.citeAuthor      || c.querySelector('[class*="author"]')?.textContent?.trim()      || '',
            c.dataset.citeInstitution || c.querySelector('[class*="institution"]')?.textContent?.trim() || '',
            c.dataset.year            || c.querySelector('time')?.getAttribute('datetime')?.slice(0,4)  || '',
            c.dataset.citeDegree      || '',
            c.querySelector('.badge-open, .badge-download, .badge-restricted')?.textContent?.trim()      || '',
          ]);
        });
        const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        downloadFile(csv, 'soxa-export.csv', 'text/csv');

      } else if (format === 'bibtex') {
        const entries = cards.map(c => {
          const author = c.dataset.citeAuthor || 'Unknown';
          const year   = c.dataset.year || new Date().getFullYear();
          const title  = c.dataset.citeTitle || 'Untitled';
          const inst   = c.dataset.citeInstitution || 'Unknown';
          const key    = (author.split(' ').pop() || 'author').toLowerCase() + year;
          return `@phdthesis{${key},\n  author = {${author}},\n  title  = {{${title}}},\n  school = {${inst}},\n  year   = {${year}}\n}`;
        });
        downloadFile(entries.join('\n\n'), 'soxa-export.bib', 'text/plain');
      }
    });
  });
}

function downloadFile(content, filename, type) {
  const a   = document.createElement('a');
  a.href    = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ============================================================
   PHASE 2 — RECORD DETAIL PAGE
   ============================================================ */

function initRecordDetailPage() {
  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  buildTableOfContents(articleBody);
  initScrollProgress(articleBody);
  initFontSizeControls();
  initFootnotes();

  // "Open citation modal" inline button on article footer
  document.querySelectorAll('.citation-copy-inline').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.citation-block');
      const text  = block?.querySelector('.citation-block-text')?.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy citation', 2000);
      });
    });
  });
}

function buildTableOfContents(articleBody) {
  const tocList = document.getElementById('toc-list');
  if (!tocList) return;

  const headings = articleBody.querySelectorAll('h2, h3');
  if (headings.length === 0) { document.querySelector('.toc-label')?.remove(); return; }

  headings.forEach((h, i) => {
    if (!h.id) h.id = `section-${i}`;
    const li = document.createElement('li');
    li.className = `toc-item ${h.tagName === 'H3' ? 'h3' : ''}`;
    li.innerHTML = `<a href="#${h.id}">${h.textContent}</a>`;
    tocList.appendChild(li);
  });

  // Active heading tracking via IntersectionObserver
  if (!prefersReducedMotion()) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const item = tocList.querySelector(`a[href="#${id}"]`)?.parentElement;
        if (item) item.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-10% 0px -80% 0px' });
    headings.forEach(h => obs.observe(h));
  }
}

function initScrollProgress(articleBody) {
  const ringFill  = document.querySelector('.progress-ring-fill');
  const ringText  = document.querySelector('.progress-ring-text');
  if (!ringFill || !articleBody) return;

  const circumference = 2 * Math.PI * 17; // r=17 from SVG
  ringFill.style.strokeDasharray  = circumference;
  ringFill.style.strokeDashoffset = circumference;

  function update() {
    const rect   = articleBody.getBoundingClientRect();
    const total  = articleBody.offsetHeight;
    const scrolled = Math.max(0, -rect.top);
    const pct    = Math.min(100, Math.round((scrolled / total) * 100));
    const offset = circumference - (pct / 100) * circumference;
    ringFill.style.strokeDashoffset = offset;
    if (ringText) ringText.textContent = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   PHASE 2 — FONT SIZE CONTROLS (A- / A+)
   ============================================================ */

function initFontSizeControls() {
  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  const sizes = [15, 16, 17, 18, 20, 22];
  let sizeIdx = 2; // default 17px

  const saved = store.get('fontSize');
  if (saved) {
    const idx = sizes.indexOf(parseInt(saved, 10));
    if (idx >= 0) sizeIdx = idx;
  }
  articleBody.style.fontSize = sizes[sizeIdx] + 'px';

  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.size === 'decrease') sizeIdx = Math.max(0, sizeIdx - 1);
      else sizeIdx = Math.min(sizes.length - 1, sizeIdx + 1);
      articleBody.style.fontSize = sizes[sizeIdx] + 'px';
      store.set('fontSize', sizes[sizeIdx]);
    });
  });
}

/* ============================================================
   PHASE 2 — FOOTNOTES (expandable popup)
   ============================================================ */

function initFootnotes() {
  const popup = document.querySelector('.footnote-popup');
  if (!popup) return;

  const closeBtn = popup.querySelector('.footnote-close');

  document.querySelectorAll('.footnote-ref').forEach(ref => {
    ref.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(ref.getAttribute('href'));
      if (target) {
        popup.innerHTML = `<button class="footnote-close" aria-label="Close footnote">×</button>${target.innerHTML}`;
        popup.classList.add('visible');
        popup.querySelector('.footnote-close')?.addEventListener('click', () => popup.classList.remove('visible'));
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') popup.classList.remove('visible');
  });

  document.addEventListener('click', e => {
    if (!popup.contains(e.target) && !e.target.closest('.footnote-ref')) {
      popup.classList.remove('visible');
    }
  });
}

/* ============================================================
   PHASE 2 — CFP TABLE SORT
   ============================================================ */

function initCFPTable() {
  const table = document.querySelector('.cfp-table');
  if (!table) return;

  const tbody = table.querySelector('tbody');
  const rows  = Array.from(tbody?.querySelectorAll('tr') || []);
  let sortCol = null;
  let sortAsc = true;

  table.querySelectorAll('th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) sortAsc = !sortAsc;
      else { sortCol = col; sortAsc = true; }

      table.querySelectorAll('th').forEach(t => {
        t.classList.remove('sort-asc','sort-desc','sorted');
      });
      th.classList.add('sorted', sortAsc ? 'sort-asc' : 'sort-desc');

      rows.sort((a, b) => {
        const idx  = Array.from(th.parentElement.children).indexOf(th);
        const va   = a.children[idx]?.textContent.trim() || '';
        const vb   = b.children[idx]?.textContent.trim() || '';
        const cmp  = va.localeCompare(vb, undefined, { numeric: true });
        return sortAsc ? cmp : -cmp;
      });

      rows.forEach(r => tbody.appendChild(r));
    });
  });

  // Subject filter chips
  document.querySelectorAll('.cfp-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const activeSubjects = Array.from(document.querySelectorAll('.cfp-filter-chip.active'))
        .map(c => c.dataset.subject?.toLowerCase() || '');

      rows.forEach(row => {
        if (activeSubjects.length === 0) {
          row.style.display = '';
          return;
        }
        const subjects = Array.from(row.querySelectorAll('.cfp-subject-tag'))
          .map(t => t.textContent.trim().toLowerCase());
        row.style.display = activeSubjects.some(s => subjects.includes(s)) ? '' : 'none';
      });

      // Zero state
      const visibleCount = rows.filter(r => r.style.display !== 'none').length;
      let zeroRow = tbody.querySelector('.cfp-zero-row');
      if (visibleCount === 0) {
        if (!zeroRow) {
          zeroRow = document.createElement('tr');
          zeroRow.className = 'cfp-zero-row';
          zeroRow.innerHTML = `<td colspan="5" style="text-align:center;padding:var(--space-10);color:var(--color-text-tertiary);font-family:var(--font-ui)">No CFPs matching this subject area.</td>`;
          tbody.appendChild(zeroRow);
        }
      } else {
        zeroRow?.remove();
      }
    });
  });
}

/* ============================================================
   PHASE 2 — LEAFLET MAP
   ============================================================ */

function initMapPage() {
  const mapEl = document.getElementById('inscription-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Map centre: India
  const map = L.map('inscription-map', { center: [20.5, 78.9], zoom: 5, scrollWheelZoom: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  // Custom teal marker icon
  const tealIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#0F6E56;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

  // Inscription data (mirrors epigraphical.html content)
  const inscriptions = [
    { title: 'Mahācandra Copper Plate Grant', period: '7th c. CE', script: 'Old Kannada', region: 'South', lat: 15.3, lng: 75.1, id: 1 },
    { title: 'Aihole Praśasti of Pulakeśin II', period: '634 CE', script: 'Old Kannada', region: 'South', lat: 15.9, lng: 76.2, id: 2 },
    { title: 'Junagadh Rock Inscription of Rudradāman I', period: 'c. 150 CE', script: 'Brāhmī', region: 'West', lat: 21.5, lng: 70.5, id: 3 },
    { title: 'Prayagraj Praśasti of Samudragupta', period: '4th c. CE', script: 'Brāhmī (Gupta)', region: 'North', lat: 25.4, lng: 81.8, id: 4 },
    { title: 'Thanjavur Big Temple Inscription', period: '1010 CE', script: 'Grantha Tamil', region: 'South', lat: 10.8, lng: 79.1, id: 5 },
    { title: 'Nagarjunakonda Buddhist Foundation Record', period: '3rd c. CE', script: 'Brāhmī', region: 'South', lat: 16.5, lng: 79.2, id: 6 },
  ];

  const markers = [];

  inscriptions.forEach(ins => {
    const marker = L.marker([ins.lat, ins.lng], { icon: tealIcon })
      .bindPopup(`
        <div class="map-popup-title">${ins.title}</div>
        <div class="map-popup-meta">
          Period: ${ins.period}<br>
          Script: ${ins.script}<br>
          Region: ${ins.region} India
        </div>
        <a href="record.html?type=epigraphical&id=${ins.id}" class="map-popup-link">View record →</a>
      `)
      .addTo(map);
    marker._inscriptionRegion = ins.region;
    markers.push(marker);
  });

  // Region filter
  document.querySelectorAll('[data-map-region]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-map-region]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const region = btn.dataset.mapRegion;
      markers.forEach(m => {
        if (region === 'all' || m._inscriptionRegion === region) {
          m.addTo(map);
        } else {
          m.remove();
        }
      });
    });
  });

  // Map/Grid view toggle
  document.querySelectorAll('.map-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      const gridEl = document.querySelector('.inscription-card-grid');
      if (view === 'map') {
        mapEl.style.display = '';
        if (gridEl) gridEl.style.display = 'none';
        map.invalidateSize();
      } else {
        mapEl.style.display = 'none';
        if (gridEl) gridEl.style.display = '';
      }
    });
  });
}
