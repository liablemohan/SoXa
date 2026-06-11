/* ============================================================
   PHASE 3 — MASTER INITIALIZER
   ============================================================ */

function initPhase3() {
  injectPhase3Styles();
  initNavDropdownsPhase3();
  initUserAuth();
  initMultilingual();
  initBookmarks();
  initSpotlightCarousel();
  initScholarDirectoryFilter();
  initContributeFlow();
  initPortalQueue();
  initPhoneticHelper();
  initThesisDataAndListSwitcher();
}

/* ============================================================
   PHASE 3 — NAV DROPDOWNS (language + user menu)
   ============================================================ */

function initNavDropdownsPhase3() {
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const menu    = dropdown.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      // Close siblings
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== dropdown) {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

/* ============================================================
   PHASE 3 — USER AUTH (localStorage-based)
   ============================================================ */

const AUTH_KEY = 'soxa-user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

function setUser(user) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch(_) {}
}

function clearUser() {
  try { localStorage.removeItem(AUTH_KEY); } catch(_) {}
}

function initUserAuth() {
  if (!document.getElementById('auth-modal-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.className = 'auth-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Sign in to SoXa');
    overlay.innerHTML = `
      <div class="auth-modal" id="auth-modal">
        <button class="auth-modal-close" id="auth-modal-close" aria-label="Close">&#x2715;</button>
        <div class="auth-modal-logo">
          <span class="auth-brand-name">SoXa</span>
          <span class="auth-brand-sub">Sanskrit Platform</span>
        </div>
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab active" data-auth-tab="signin" role="tab" aria-selected="true">Sign In</button>
          <button class="auth-tab" data-auth-tab="signup" role="tab" aria-selected="false">Register</button>
        </div>
        <div class="auth-panel active" id="auth-panel-signin">
          <form class="auth-modal-form" id="signin-form" novalidate>
            <label for="signin-email">Email</label>
            <input id="signin-email" type="email" placeholder="scholar@university.edu" required autocomplete="email">
            <label for="signin-password">Password</label>
            <input id="signin-password" type="password" placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;" required autocomplete="current-password">
            <p class="auth-error" id="signin-error" role="alert" style="display:none;"></p>
            <button type="submit" class="btn btn-primary auth-submit-btn">Sign In</button>
          </form>
          <p class="auth-switch-row">New to SoXa? <button class="auth-switch-btn" data-target="signup">Register here &rarr;</button></p>
        </div>
        <div class="auth-panel" id="auth-panel-signup">
          <form class="auth-modal-form" id="signup-form" novalidate>
            <label for="signup-name">Full Name</label>
            <input id="signup-name" type="text" placeholder="Dr. Meera Krishnamurthy" required autocomplete="name">
            <label for="signup-institution">Institution</label>
            <input id="signup-institution" type="text" placeholder="e.g. Banaras Hindu University" required>
            <label for="signup-email">Email</label>
            <input id="signup-email" type="email" placeholder="scholar@university.edu" required autocomplete="email">
            <label for="signup-password">Password</label>
            <input id="signup-password" type="password" placeholder="Min. 6 characters" required autocomplete="new-password">
            <p class="auth-error" id="signup-error" role="alert" style="display:none;"></p>
            <button type="submit" class="btn btn-primary auth-submit-btn">Create Account</button>
          </form>
          <p class="auth-switch-row">Already registered? <button class="auth-switch-btn" data-target="signin">Sign in &rarr;</button></p>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Tab switching
    overlay.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        overlay.querySelectorAll('.auth-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        overlay.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        document.getElementById('auth-panel-' + tab.dataset.authTab)?.classList.add('active');
      });
    });

    // Panel switch links
    overlay.querySelectorAll('.auth-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        overlay.querySelectorAll('.auth-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.authTab === target);
          t.setAttribute('aria-selected', t.dataset.authTab === target ? 'true' : 'false');
        });
        overlay.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('auth-panel-' + target)?.classList.add('active');
      });
    });

    // Sign-in form
    document.getElementById('signin-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const email    = document.getElementById('signin-email').value.trim();
      const password = document.getElementById('signin-password').value;
      const errEl    = document.getElementById('signin-error');
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem('soxa-account-' + email)); } catch(_) {}
      if (!saved || saved.password !== password) {
        errEl.textContent = 'Invalid email or password. Try again or register.';
        errEl.style.display = 'block';
        return;
      }
      errEl.style.display = 'none';
      setUser({ name: saved.name, email, institution: saved.institution });
      closeAuthModal();
      renderUserMenu();
      showToast('Welcome back, ' + saved.name.split(' ')[0] + '!');
    });

    // Sign-up form
    document.getElementById('signup-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name     = document.getElementById('signup-name').value.trim();
      const inst     = document.getElementById('signup-institution').value.trim();
      const email    = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const errEl    = document.getElementById('signup-error');
      if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; return; }
      if (!name || !email)     { errEl.textContent = 'Please fill in all required fields.'; errEl.style.display = 'block'; return; }
      try { localStorage.setItem('soxa-account-' + email, JSON.stringify({ name, institution: inst, password })); } catch(_) {}
      errEl.style.display = 'none';
      setUser({ name, email, institution: inst });
      closeAuthModal();
      renderUserMenu();
      showToast('Account created! Welcome, ' + name.split(' ')[0] + '!');
    });

    document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });
  }

  renderUserMenu();
}

function openAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

function renderUserMenu() {
  const user       = getUser();
  const trigger    = document.querySelector('.user-menu-trigger');
  const initialsEl = document.querySelector('.user-menu-trigger .user-initials');
  const dropdown   = document.getElementById('user-menu-dropdown');
  if (!trigger || !dropdown) return;

  if (user) {
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    if (initialsEl) initialsEl.textContent = initials;
    trigger.setAttribute('title', user.name);
    dropdown.innerHTML = `
      <li role="none" class="user-menu-header">
        <span class="user-menu-name">${user.name}</span>
        <span class="user-menu-inst">${user.institution || ''}</span>
      </li>
      <li role="none"><a href="portal.html" role="menuitem" class="user-menu-link">🏛️ My Portal</a></li>
      <li role="none"><a href="contribute.html" role="menuitem" class="user-menu-link">&#x270D;&#xFE0F; Contribute</a></li>
      <li role="none"><button id="user-signout-btn" role="menuitem" class="user-menu-link user-signout">Sign Out</button></li>`;
    document.getElementById('user-signout-btn')?.addEventListener('click', () => {
      clearUser(); renderUserMenu(); showToast('You have been signed out.');
    });
  } else {
    if (initialsEl) initialsEl.textContent = '';
    trigger.setAttribute('title', 'Sign In');
    dropdown.innerHTML = `
      <li role="none"><button id="user-signin-btn" role="menuitem" class="user-menu-link user-signin-cta">Sign In / Register &rarr;</button></li>`;
    document.getElementById('user-signin-btn')?.addEventListener('click', () => {
      document.querySelector('.user-menu')?.classList.remove('open');
      openAuthModal();
    });
  }
}

/* ============================================================
   PHASE 3 — MULTILINGUAL ENGINE (EN / HI / SA)
   ============================================================ */

var TRANSLATIONS = {
  en: {
    subtitle: 'Sanskrit Platform',
    home: 'Home',
    repositories: 'Repositories',
    developments: 'Developments',
    community: 'Community',
    about: 'About',
    contact: 'Contact',
    title_thesis: '📜 Thesis Repository',
    title_epigraphical: '🪨 Epigraphical Archive',
    title_literary: '📚 Literary History',
    search_placeholder: 'Search texts, authors\u2026',
  },
  hi: {
    subtitle: 'संस्कृत प्लेटफॉर्म',
    home: 'होम',
    repositories: 'संग्रह',
    developments: 'विकास',
    community: 'समुदाय',
    about: 'हमारे बारे में',
    contact: 'संपर्क',
    title_thesis: '📜 शोध-ग्रंथ संग्रह',
    title_epigraphical: '🪨 शिलालेख अभिलेखागार',
    title_literary: '📚 साहित्य-इतिहास',
    search_placeholder: 'पाठ, लेखक खोजें\u2026',
  },
  sa: {
    subtitle: 'संस्कृत-वेदिका',
    home: 'गृहम्',
    repositories: 'संग्रहालयाः',
    developments: 'विकासः',
    community: 'समुदायः',
    about: 'अस्माकं विषये',
    contact: 'सम्पर्कः',
    title_thesis: '📜 शोधग्रन्थ-संग्रहः',
    title_epigraphical: '🪨 शिलालेख-कोशः',
    title_literary: '📚 साहित्य-इतिहासः',
    search_placeholder: 'पाठान् अन्वेषयतु\u2026',
  }
};

function applyLanguage(lang) {
  var t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-trn]').forEach(el => {
    var key = el.dataset.trn;
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll('[data-trn-placeholder]').forEach(el => {
    var key = el.dataset.trnPlaceholder;
    if (t[key]) el.setAttribute('placeholder', t[key]);
  });
  document.querySelectorAll('.lang-code-label').forEach(el => {
    el.textContent = lang.toUpperCase();
  });
  document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  store.set('lang', lang);
  document.documentElement.setAttribute('lang', lang === 'sa' ? 'sa' : lang === 'hi' ? 'hi' : 'en');
}

function initMultilingual() {
  var saved = store.get('lang') || 'en';
  applyLanguage(saved);
  document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
      btn.closest('.nav-dropdown')?.classList.remove('open');
    });
  });
}

/* ============================================================
   PHASE 3 — BOOKMARKS / READING LIST
   ============================================================ */

var BOOKMARK_KEY = 'soxa-reading-list';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; } catch { return []; }
}

function saveBookmarks(list) {
  try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list)); } catch(_) {}
}

function toggleBookmark(id, title, url) {
  var list = getBookmarks();
  var idx  = list.findIndex(b => b.id === id);
  if (idx > -1) { list.splice(idx, 1); } else { list.unshift({ id, title, url, savedAt: new Date().toISOString() }); }
  saveBookmarks(list);
  return idx === -1;
}

function initBookmarks() {
  document.querySelectorAll('[data-bookmark-id]').forEach(btn => {
    var id    = btn.dataset.bookmarkId;
    var title = btn.dataset.bookmarkTitle || document.title;
    var url   = btn.dataset.bookmarkUrl   || window.location.href;
    var saved = getBookmarks().some(b => b.id === id);
    btn.classList.toggle('bookmarked', saved);
    btn.setAttribute('title', saved ? 'Remove from reading list' : 'Save to reading list');
    btn.addEventListener('click', () => {
      var added = toggleBookmark(id, title, url);
      btn.classList.toggle('bookmarked', added);
      btn.setAttribute('title', added ? 'Remove from reading list' : 'Save to reading list');
      showToast(added ? '📌 Saved to reading list' : '🗑️ Removed from reading list');
    });
  });
}

function showToast(message) {
  var toast = document.getElementById('soxa-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'soxa-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

/* ============================================================
   PHASE 3 — SCHOLAR SPOTLIGHT CAROUSEL (community.html)
   ============================================================ */

function initSpotlightCarousel() {
  var slidesEl = document.querySelector('.spotlight-slides');
  if (!slidesEl) return;
  var slides  = Array.from(slidesEl.querySelectorAll('.spotlight-slide'));
  if (!slides.length) return;
  var current = 0;

  function goTo(index) {
    slides[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
  }

  slides[0].classList.add('active');
  document.getElementById('spotlight-prev')?.addEventListener('click', () => goTo(current - 1));
  document.getElementById('spotlight-next')?.addEventListener('click', () => goTo(current + 1));

  if (!prefersReducedMotion()) {
    var autoId = setInterval(() => goTo(current + 1), 5000);
    slidesEl.addEventListener('mouseenter', () => clearInterval(autoId));
    slidesEl.addEventListener('mouseleave', () => { autoId = setInterval(() => goTo(current + 1), 5000); });
  }
}

/* ============================================================
   PHASE 3 — SCHOLAR DIRECTORY FILTER (community.html)
   ============================================================ */

function initScholarDirectoryFilter() {
  var grid  = document.querySelector('.scholar-directory-grid');
  var chips = document.querySelectorAll('.filter-chips .filter-chip[data-field]');
  if (!grid || !chips.length) return;
  var cards = Array.from(grid.querySelectorAll('.scholar-card'));
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      var field = chip.dataset.field;
      cards.forEach(card => {
        card.style.display = (field === 'all' || card.dataset.field === field) ? '' : 'none';
      });
    });
  });
}

/* ============================================================
   PHASE 3 — CONTRIBUTE FLOW (contribute.html)
   ============================================================ */

function initContributeFlow() {
  var editor    = document.getElementById('contribute-editor');
  var preview   = document.getElementById('contribute-preview');
  var form      = document.getElementById('contribute-form');
  var exportBtn = document.getElementById('contribute-export-btn');
  var citOut    = document.getElementById('citation-output-block');

  if (!editor || !preview) return;

  function renderPreview() {
    preview.innerHTML = markdownToHtml(editor.value) ||
      '<p style="color:var(--color-text-tertiary);font-style:italic;">Your rendered preview will appear here\u2026</p>';
  }

  function getCiteData() {
    return {
      title:       document.getElementById('cite-in-title')?.value       || 'Untitled',
      author:      document.getElementById('cite-in-author')?.value      || 'Unknown',
      institution: document.getElementById('cite-in-inst')?.value        || 'Unknown Institution',
      year:        document.getElementById('cite-in-year')?.value        || new Date().getFullYear(),
      degree:      document.getElementById('cite-in-degree')?.value      || 'Ph.D.',
      url:         window.location.href,
    };
  }

  var activeCitFmt = 'apa';

  function updateAutocitation() {
    if (!citOut) return;
    var cits = buildCitations(getCiteData());
    citOut.textContent = cits[activeCitFmt] || '';
  }

  editor.addEventListener('input', () => { renderPreview(); updateAutocitation(); });

  document.querySelectorAll('.citation-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.citation-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCitFmt = btn.dataset.format;
      updateAutocitation();
    });
  });

  ['cite-in-title','cite-in-author','cite-in-inst','cite-in-year','cite-in-degree'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateAutocitation);
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    var user  = getUser();
    var submission = {
      id:          Date.now(),
      title:       document.getElementById('cite-in-title')?.value?.trim()    || 'Untitled',
      author:      document.getElementById('cite-in-author')?.value?.trim()   || (user?.name || 'Anonymous'),
      institution: document.getElementById('cite-in-inst')?.value?.trim()     || (user?.institution || ''),
      year:        document.getElementById('cite-in-year')?.value             || new Date().getFullYear(),
      degree:      document.getElementById('cite-in-degree')?.value?.trim()   || '',
      type:        document.getElementById('cite-in-type')?.value             || 'thesis',
      tags:        document.getElementById('cite-in-tags')?.value?.trim()     || '',
      abstract:    document.getElementById('cite-in-abstract')?.value?.trim() || '',
      body:        editor.value || '',
      status:      'pending',
      submittedAt: new Date().toISOString(),
    };
    var queue = [];
    try { queue = JSON.parse(localStorage.getItem('soxa-pending-submissions')) || []; } catch(_) {}
    queue.unshift(submission);
    try { localStorage.setItem('soxa-pending-submissions', JSON.stringify(queue)); } catch(_) {}

    showToast('✅ Submission sent for peer review!');
    var btn = form.querySelector('[type="submit"]');
    if (btn) { btn.textContent = '✅ Submitted!'; btn.disabled = true; }
    setTimeout(() => {
      form.reset();
      preview.innerHTML = '<p style="color:var(--color-text-tertiary);font-style:italic;">Your rendered preview will appear here\u2026</p>';
      if (citOut) citOut.textContent = '';
      if (btn) { btn.textContent = 'Submit for Review'; btn.disabled = false; }
    }, 3000);
  });

  exportBtn?.addEventListener('click', () => {
    var title  = document.getElementById('cite-in-title')?.value || 'soxa-contribution';
    var header = '---\ntitle: "' + title + '"\nauthor: "' + (document.getElementById('cite-in-author')?.value || '') + '"\nyear: ' + (document.getElementById('cite-in-year')?.value || '') + '\n---\n\n';
    downloadFile(header + (editor.value || ''), title.toLowerCase().replace(/\s+/g, '-') + '.md', 'text/markdown');
  });

  renderPreview();
  updateAutocitation();
}

/* ============================================================
   PHASE 3 — MARKDOWN → HTML (lightweight, zero deps)
   ============================================================ */

function markdownToHtml(md) {
  if (!md) return '';
  var html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  return html.split(/\n{2,}/).map(para => {
    para = para.trim();
    if (!para) return '';
    if (/^<(h[1-6]|hr|blockquote)/.test(para)) return para;
    if (para.startsWith('<li>')) return '<ul>' + para + '</ul>';
    return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');
}

/* ============================================================
   PHASE 3 — PHONETIC LATIN → DEVANĀGARĪ TYPING ASSISTANT
   ============================================================ */

var PHONETIC_MAP = [
  ['ksh','क्ष'],['jn','ज्ञ'],
  ['aa','आ'],['ii','ई'],['uu','ऊ'],['ai','ऐ'],['au','औ'],['ri','ऋ'],
  ['Sh','ष'],['sh','श'],
  ['kh','ख'],['gh','घ'],['ch','च'],['jh','झ'],['Th','ठ'],
  ['Dh','ढ'],['th','थ'],['dh','ध'],['ph','फ'],['bh','भ'],
  ['ee','ए'],['oo','ओ'],
  ['a','अ'],['i','इ'],['u','उ'],['e','ए'],['o','ओ'],
  ['k','क'],['g','ग'],['c','च'],['j','ज'],
  ['T','ट'],['D','ड'],['N','ण'],
  ['t','त'],['d','द'],['n','न'],
  ['p','प'],['b','ब'],['m','म'],
  ['y','य'],['r','र'],['l','ल'],['v','व'],['w','व'],
  ['s','स'],['h','ह'],
  ['M','ं'],['H','ः'],[' ',' ']
];

function latinToDevanagari(text) {
  if (!text) return '';
  var result = '', i = 0;
  while (i < text.length) {
    var matched = false;
    for (var p = 0; p < PHONETIC_MAP.length; p++) {
      var lat = PHONETIC_MAP[p][0], dev = PHONETIC_MAP[p][1];
      if (text.slice(i, i + lat.length) === lat) {
        result += dev; i += lat.length; matched = true; break;
      }
    }
    if (!matched) { result += text[i]; i++; }
  }
  return result;
}

function initPhoneticHelper() {
  var input  = document.getElementById('phonetic-input');
  var output = document.getElementById('phonetic-output');
  if (!input || !output) return;
  input.addEventListener('input', () => {
    var deva = latinToDevanagari(input.value);
    output.textContent = 'Devanāgarī: ' + (deva || '—');
  });
}

/* ============================================================
   PHASE 3 — PORTAL REVIEW QUEUE (portal.html)
   ============================================================ */

function initPortalQueue() {
  var listEl = document.getElementById('portal-review-list');
  if (!listEl) return;

  function renderQueue() {
    var queue = [];
    try { queue = JSON.parse(localStorage.getItem('soxa-pending-submissions')) || []; } catch(_) {}
    var pending = queue.filter(s => s.status === 'pending');

    if (pending.length === 0) {
      listEl.innerHTML = '<div class="portal-queue-empty"><div style="font-size:2rem;margin-bottom:var(--space-3);">&#x2705;</div><p>No pending submissions. The queue is clear!</p><p class="portal-queue-hint">Contributors can submit work via <a href="contribute.html">Contribute</a>.</p></div>';
      return;
    }

    listEl.innerHTML = pending.map(s => `
      <div class="review-item" data-review-id="${s.id}">
        <div class="review-item-title">${s.title || 'Untitled'}</div>
        <div class="review-item-meta">By ${s.author || 'Unknown'} &middot; ${s.institution || ''} &middot; ${s.year || ''}
          <span class="tag" style="margin-left:var(--space-2);">${s.type || 'thesis'}</span>
        </div>
        ${s.abstract ? `<p class="review-item-abstract">${s.abstract.slice(0,180)}${s.abstract.length > 180 ? '\u2026' : ''}</p>` : ''}
        <div class="review-item-actions">
          <button class="btn btn-primary review-approve-btn" data-id="${s.id}">&#x2705; Approve</button>
          <button class="btn btn-outline review-reject-btn" data-id="${s.id}" style="border-color:var(--color-restricted);color:var(--color-restricted);">&#x274C; Reject</button>
        </div>
      </div>`).join('');

    listEl.querySelectorAll('.review-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSubmissionStatus(parseInt(btn.dataset.id, 10), 'approved');
        showToast('✅ Submission approved and published!');
        renderQueue(); updateMetricCounts();
      });
    });
    listEl.querySelectorAll('.review-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSubmissionStatus(parseInt(btn.dataset.id, 10), 'rejected');
        showToast('🗑️ Submission rejected.');
        renderQueue();
      });
    });
  }

  renderQueue();
  updateMetricCounts();
}

function updateSubmissionStatus(id, status) {
  var queue = [];
  try { queue = JSON.parse(localStorage.getItem('soxa-pending-submissions')) || []; } catch(_) {}
  var item = queue.find(s => s.id === id);
  if (item) item.status = status;
  try { localStorage.setItem('soxa-pending-submissions', JSON.stringify(queue)); } catch(_) {}
}

function updateMetricCounts() {
  var queue = [];
  try { queue = JSON.parse(localStorage.getItem('soxa-pending-submissions')) || []; } catch(_) {}
  var approved = queue.filter(s => s.status === 'approved').length;
  var reviewsEl = document.getElementById('metric-reviews-conducted');
  var pagesEl   = document.getElementById('metric-pages-contributed');
  if (reviewsEl) reviewsEl.textContent = 42 + approved;
  if (pagesEl)   pagesEl.textContent   = 8  + approved;
}

/* ============================================================
   PHASE 3 — DYNAMIC THESIS DATA & GRID/LIST SWITCHER
   ============================================================ */

function parseCSV(text) {
  var lines = [];
  var row = [""];
  var inQuotes = false;
  
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    var next = text[i+1];
    
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

function initThesisDataAndListSwitcher() {
  const container = document.getElementById('thesis-grid');
  if (!container) return;

  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');

  if (gridBtn && listBtn) {
    gridBtn.addEventListener('click', () => {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      container.classList.remove('list-view');
      if (typeof initPagination === 'function') initPagination();
    });

    listBtn.addEventListener('click', () => {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      container.classList.add('list-view');
      if (typeof initPagination === 'function') initPagination();
    });
  }

  loadThesisData(container);
}

async function loadThesisData(container) {
  try {
    const response = await fetch('demo_data_repo - Sheet1.csv');
    if (!response.ok) throw new Error('Failed to fetch CSV file');
    const text = await response.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return;
    
    const headers = rows[0].map(h => h.trim());
    const csvTheses = rows.slice(1).map(row => {
      const t = {};
      headers.forEach((h, index) => {
        t[h] = row[index] ? row[index].trim() : '';
      });
      return t;
    }).filter(t => t.thesis_id);

    // Get any approved items from localStorage reviewed queue
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem('soxa-pending-submissions')) || []; } catch(_) {}
    const approved = queue.filter(s => s.status === 'approved' && s.type === 'thesis');
    
    const userTheses = approved.map(s => ({
      thesis_id: 'SKT-USER-' + s.id,
      university_thesis_id: 'USER-' + s.id,
      title: s.title,
      researcher: s.author,
      guide: s.guide || 'Peer Reviewed',
      co-guide: s.co_guide || '',
      university: s.institution,
      department: '',
      type_of_university: 'User Contribution',
      state: '',
      district: '',
      subject: s.tags || 'General',
      'sub-subject': '',
      languge: 'Sanskrit/English',
      script: 'Roman/Devanagari',
      degree: s.degree || 'Ph.D.',
      submition_year: s.year || new Date().getFullYear(),
      abstract: s.abstract || s.body,
      url: '#',
      remark: 'Published via review queue',
      keywords: s.tags
    }));

    const allTheses = [...userTheses, ...csvTheses];
    container.innerHTML = '';

    allTheses.forEach(t => {
      const article = document.createElement('article');
      article.className = 'repo-card animate-on-scroll';
      article.dataset.year = t.submition_year || '2000';
      const citations = Math.floor(Math.random() * 90) + 10;
      article.dataset.citations = String(citations);
      
      article.setAttribute('data-cite-title', t.title);
      article.setAttribute('data-cite-author', t.researcher);
      article.setAttribute('data-cite-institution', t.university);
      article.setAttribute('data-cite-year', t.submition_year);
      article.setAttribute('data-cite-degree', t.degree);

      const isDeva = /[\u0900-\u097F]/.test(t.title);

      article.innerHTML = `
        <div class="repo-card-header">
          <div>
            <h2 class="repo-card-title">${t.title}</h2>
            ${isDeva ? `<span class="repo-card-deva">${t.title}</span>` : ''}
          </div>
          <span class="access-badge badge-open">Open</span>
        </div>
        <div class="repo-card-body">
          <div class="repo-card-meta">
            <span class="repo-meta-item"><strong>Author:</strong> ${t.researcher}</span>
            <span class="repo-meta-item"><strong>Institution:</strong> ${t.university}</span>
            <span class="repo-meta-item"><strong>Year:</strong> ${t.submition_year}</span>
            <span class="repo-meta-item"><strong>Degree:</strong> ${t.degree}</span>
            <span class="repo-meta-item"><strong>Subject:</strong> ${t.subject} ${t['sub-subject'] ? `(${t['sub-subject']})` : ''}</span>
            <span class="repo-meta-item"><strong>Guide:</strong> ${t.guide}</span>
          </div>
          <p class="repo-card-abstract">${t.abstract || 'No abstract available for this entry.'}</p>
        </div>
        <div class="repo-card-footer">
          <div class="tags" style="margin:0;">
            <span class="tag">${t.subject}</span>
            ${t.degree ? `<span class="tag">${t.degree}</span>` : ''}
            ${t.languge ? `<span class="tag">${t.languge}</span>` : ''}
          </div>
          <div style="display:flex; gap:var(--space-2); align-items:center;">
            <button class="nav-icon-btn bookmark-btn" data-bookmark-id="${t.thesis_id}" data-bookmark-title="${t.title}" data-bookmark-url="record.html?type=thesis&id=${t.thesis_id}" title="Save to reading list" type="button" style="padding:4px; font-size:1rem; background:none; border:none; cursor:pointer;">🔖</button>
            <a href="record.html?type=thesis&id=${t.thesis_id}" class="cite-btn" style="text-decoration:none;">View record →</a>
            <button class="cite-btn cite-modal-btn" type="button">Cite</button>
          </div>
        </div>
      `;
      container.appendChild(article);
    });

    if (typeof initFilterSidebar === 'function') initFilterSidebar();
    if (typeof initSortBar === 'function') initSortBar();
    if (typeof initPagination === 'function') initPagination();
    if (typeof initBookmarks === 'function') initBookmarks();
    
    document.querySelector('.sort-btn.active')?.click();
  } catch (err) {
    console.error('Error parsing and rendering thesis CSV data:', err);
  }
}

/* ============================================================
   PHASE 3 — INJECTED STYLES
   ============================================================ */

function injectPhase3Styles() {
  if (document.getElementById('phase3-styles')) return;
  var style = document.createElement('style');
  style.id = 'phase3-styles';
  style.textContent = `
    /* ── Auth Modal ── */
    .auth-modal-overlay {
      display:none; position:fixed; inset:0; z-index:1200;
      background:rgba(0,0,0,0.6); backdrop-filter:blur(5px);
      align-items:center; justify-content:center; padding:var(--space-4);
    }
    .auth-modal-overlay.open { display:flex; animation:p3FadeIn 220ms ease; }
    .auth-modal {
      background:var(--color-surface); border-radius:var(--radius-lg);
      padding:var(--space-8) var(--space-8) var(--space-6);
      width:100%; max-width:430px; position:relative;
      box-shadow:0 32px 80px rgba(0,0,0,0.22);
    }
    .auth-modal-close {
      position:absolute; top:var(--space-4); right:var(--space-4);
      background:none; border:none; cursor:pointer; font-size:1.1rem;
      color:var(--color-text-tertiary); padding:4px 8px; border-radius:4px;
      transition:color 150ms,background 150ms;
    }
    .auth-modal-close:hover { color:var(--color-text-primary); background:var(--color-bg); }
    .auth-modal-logo { text-align:center; margin-bottom:var(--space-6); }
    .auth-brand-name { display:block; font-family:var(--font-display); font-size:var(--text-2xl); color:var(--color-primary); font-weight:700; }
    .auth-brand-sub  { display:block; font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px; }
    .auth-tabs { display:flex; border-bottom:2px solid var(--color-border); margin-bottom:var(--space-5); }
    .auth-tab {
      flex:1; padding:var(--space-2) 0; font-family:var(--font-ui); font-size:var(--text-sm);
      font-weight:600; color:var(--color-text-tertiary); background:none; border:none;
      border-bottom:3px solid transparent; margin-bottom:-2px; cursor:pointer; transition:all 200ms;
    }
    .auth-tab.active { color:var(--color-primary); border-bottom-color:var(--color-primary); }
    .auth-panel { display:none; }
    .auth-panel.active { display:block; animation:p3FadeIn 200ms ease; }
    .auth-modal-form { display:flex; flex-direction:column; gap:var(--space-3); }
    .auth-modal-form label {
      font-family:var(--font-ui); font-size:var(--text-xs); font-weight:600;
      color:var(--color-text-secondary); letter-spacing:0.03em;
    }
    .auth-modal-form input {
      padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border);
      border-radius:var(--radius-base); background:var(--color-bg);
      color:var(--color-text-primary); font-family:var(--font-ui); font-size:var(--text-sm);
      transition:border-color 150ms, box-shadow 150ms; width:100%;
    }
    .auth-modal-form input:focus {
      outline:none; border-color:var(--color-primary);
      box-shadow:0 0 0 3px rgba(15,110,86,0.15);
    }
    .auth-submit-btn { width:100%; margin-top:var(--space-1); }
    .auth-error {
      color:var(--color-restricted,#c62828); font-family:var(--font-ui);
      font-size:var(--text-xs); margin:0; padding:var(--space-2) var(--space-3);
      background:rgba(198,40,40,0.08); border-radius:var(--radius-sm);
    }
    .auth-switch-row { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); text-align:center; margin-top:var(--space-4); }
    .auth-switch-btn { background:none; border:none; cursor:pointer; color:var(--color-primary); font-size:inherit; font-family:inherit; padding:0; text-decoration:underline; }

    /* ── User menu items ── */
    .user-menu-header { padding:var(--space-3) var(--space-4); border-bottom:1px solid var(--color-border); list-style:none; }
    .user-menu-name { display:block; font-family:var(--font-ui); font-size:var(--text-sm); font-weight:600; color:var(--color-text-primary); }
    .user-menu-inst { display:block; font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); }
    .user-menu-link {
      display:block; padding:var(--space-2) var(--space-4);
      font-family:var(--font-ui); font-size:var(--text-sm); color:var(--color-text-primary);
      text-decoration:none; background:none; border:none; width:100%;
      text-align:left; cursor:pointer; transition:background 150ms;
    }
    .user-menu-link:hover { background:var(--color-primary-light); color:var(--color-primary); }
    .user-signout { color:var(--color-restricted,#c62828) !important; }
    .user-signin-cta { color:var(--color-primary) !important; font-weight:600 !important; }
    .user-menu-trigger .user-initials:not(:empty) {
      display:inline-flex; align-items:center; justify-content:center;
      width:20px; height:20px; border-radius:50%;
      background:var(--color-primary); color:#fff;
      font-size:9px; font-weight:700; margin-left:3px;
    }

    /* ── Toast ── */
    #soxa-toast {
      position:fixed; bottom:calc(60px + var(--space-4)); left:50%; transform:translateX(-50%) translateY(10px);
      background:var(--color-text-primary,#1a1a1a); color:#fff;
      font-family:var(--font-ui); font-size:var(--text-sm);
      padding:var(--space-2) var(--space-6); border-radius:var(--radius-pill);
      z-index:9999; opacity:0; pointer-events:none; white-space:nowrap;
      box-shadow:0 6px 28px rgba(0,0,0,0.22);
      transition:opacity 250ms ease, transform 250ms ease;
    }
    #soxa-toast.visible { opacity:1; transform:translateX(-50%) translateY(0); }

    /* ── Spotlight Carousel ── */
    .spotlight-carousel {
      background:var(--color-primary-light,#e6f4ef); border-radius:var(--radius-lg);
      padding:var(--space-8); margin-bottom:var(--space-10); overflow:hidden;
    }
    .spotlight-slides { position:relative; min-height:180px; }
    .spotlight-slide { display:none; align-items:center; gap:var(--space-8); }
    .spotlight-slide.active { display:flex; animation:p3FadeIn 400ms ease; }
    .spotlight-img { width:96px; height:96px; border-radius:50%; object-fit:cover; border:3px solid var(--color-primary); box-shadow:0 8px 24px rgba(0,0,0,0.15); flex-shrink:0; }
    .spotlight-tag { display:block; font-family:var(--font-ui); font-size:var(--text-xs); font-weight:700; color:var(--color-primary); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:var(--space-1); }
    .spotlight-name { font-family:var(--font-display); font-size:var(--text-xl); color:var(--color-text-primary); margin:var(--space-1) 0; }
    .spotlight-quote { font-family:var(--font-serif); font-size:var(--text-sm); color:var(--color-text-secondary); font-style:italic; line-height:1.65; margin:var(--space-2) 0; }
    .spotlight-role { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); }
    .spotlight-nav { display:flex; gap:var(--space-2); justify-content:flex-end; margin-top:var(--space-5); }
    .spotlight-btn {
      background:var(--color-primary); color:#fff; border:none; border-radius:50%;
      width:36px; height:36px; font-size:1.1rem; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:background 150ms, transform 150ms; flex-shrink:0;
    }
    .spotlight-btn:hover { background:var(--color-primary-dark,#0a4f3d); transform:scale(1.1); }

    /* ── Scholar Directory ── */
    .scholar-directory-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:var(--space-4); }
    .scholar-card {
      display:flex; align-items:center; gap:var(--space-3);
      padding:var(--space-4); background:var(--color-surface);
      border-radius:var(--radius-base); border:1px solid var(--color-border);
      transition:box-shadow 200ms, border-color 200ms, transform 200ms;
    }
    .scholar-card:hover { box-shadow:var(--shadow-md,0 4px 16px rgba(0,0,0,0.1)); border-color:var(--color-primary-light); transform:translateY(-2px); }
    .scholar-card-avatar {
      width:44px; height:44px; border-radius:50%; flex-shrink:0;
      background:var(--color-primary-light); color:var(--color-primary);
      font-family:var(--font-display); font-size:var(--text-sm); font-weight:700;
      display:flex; align-items:center; justify-content:center;
    }
    .scholar-card-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
    .scholar-card-name { font-family:var(--font-ui); font-size:var(--text-sm); font-weight:600; color:var(--color-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .scholar-card-title { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-secondary); }
    .scholar-card-inst { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); }

    /* ── Community Feed ── */
    .community-feed { display:flex; flex-direction:column; }
    .feed-item { padding:var(--space-3) 0; border-bottom:1px solid var(--color-border); }
    .feed-item:last-child { border-bottom:none; }
    .feed-date { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); margin-bottom:4px; }
    .feed-text { font-family:var(--font-ui); font-size:var(--text-sm); color:var(--color-text-secondary); line-height:1.55; }

    /* ── Portal ── */
    .portal-grid { display:grid; grid-template-columns:280px 1fr; gap:var(--space-8); }
    @media (max-width:768px) { .portal-grid { grid-template-columns:1fr; } }
    .portal-sidebar { background:var(--color-surface); border-radius:var(--radius-lg); padding:var(--space-6); border:1px solid var(--color-border); height:fit-content; }
    .portal-main { display:flex; flex-direction:column; gap:var(--space-6); }
    .portal-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-4); }
    @media (max-width:480px) { .portal-metrics { grid-template-columns:1fr; } }
    .metric-card { background:var(--color-surface); border-radius:var(--radius-base); padding:var(--space-5); border:1px solid var(--color-border); text-align:center; transition:box-shadow 200ms; }
    .metric-card:hover { box-shadow:var(--shadow-md,0 4px 16px rgba(0,0,0,0.1)); }
    .metric-value { font-family:var(--font-display); font-size:var(--text-3xl); font-weight:700; color:var(--color-primary); }
    .metric-label { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:var(--space-1); }
    .review-queue-card { background:var(--color-surface); border-radius:var(--radius-lg); padding:var(--space-6); border:1px solid var(--color-border); }
    .review-queue-title { font-family:var(--font-display); font-size:var(--text-lg); color:var(--color-text-primary); margin-bottom:var(--space-4); }
    .review-item { padding:var(--space-4); border:1px solid var(--color-border); border-radius:var(--radius-base); margin-bottom:var(--space-3); background:var(--color-surface); transition:border-color 200ms; }
    .review-item:hover { border-color:var(--color-primary-light); }
    .review-item-title { font-family:var(--font-display); font-size:var(--text-md,1rem); font-weight:600; color:var(--color-text-primary); margin-bottom:var(--space-1); }
    .review-item-meta { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-tertiary); }
    .review-item-abstract { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-secondary); margin:var(--space-2) 0; line-height:1.55; }
    .review-item-actions { display:flex; gap:var(--space-2); margin-top:var(--space-3); flex-wrap:wrap; }
    .review-item-actions .btn { font-size:var(--text-xs); padding:var(--space-1) var(--space-3); }
    .portal-queue-empty { text-align:center; padding:var(--space-10) var(--space-4); font-family:var(--font-ui); color:var(--color-text-tertiary); }
    .portal-queue-hint { font-size:var(--text-xs); margin-top:var(--space-2); }
    .portal-queue-hint a { color:var(--color-primary); }
    .achievement-list { display:flex; flex-direction:column; gap:var(--space-2); }
    .achievement-badge { display:flex; align-items:center; gap:var(--space-2); padding:var(--space-2) var(--space-3); border-radius:var(--radius-sm); background:var(--color-bg); }
    .achievement-icon { font-size:1.1rem; flex-shrink:0; }
    .achievement-name { font-family:var(--font-ui); font-size:var(--text-xs); font-weight:600; color:var(--color-text-primary); flex:1; }
    .achievement-status { font-family:var(--font-ui); font-size:10px; color:var(--color-text-tertiary); }

    /* ── Contribute / Authoring ── */
    .authoring-layout { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-6); align-items:start; }
    @media (max-width:768px) { .authoring-layout { grid-template-columns:1fr; } }
    .editor-pane { background:var(--color-surface); border-radius:var(--radius-lg); padding:var(--space-6); border:1px solid var(--color-border); }
    .editor-pane .auth-modal-form { gap:var(--space-3); }
    .editor-textarea {
      width:100%; min-height:220px; padding:var(--space-3);
      border-radius:var(--radius-base); border:1.5px solid var(--color-border);
      background:var(--color-bg); color:var(--color-text-primary);
      font-family:var(--font-ui); font-size:var(--text-sm);
      resize:vertical; line-height:1.65; box-sizing:border-box;
    }
    .editor-textarea:focus { outline:none; border-color:var(--color-primary); box-shadow:0 0 0 3px rgba(15,110,86,0.1); }
    .preview-pane { background:var(--color-surface); border-radius:var(--radius-lg); border:1px solid var(--color-border); display:flex; flex-direction:column; overflow:hidden; }
    .preview-pane-header { background:var(--color-primary-light); color:var(--color-primary); font-family:var(--font-ui); font-size:var(--text-xs); font-weight:700; padding:var(--space-3) var(--space-5); border-bottom:1px solid var(--color-border); letter-spacing:0.04em; }
    .markdown-preview { padding:var(--space-6); font-family:var(--font-serif); font-size:var(--text-base); color:var(--color-text-primary); line-height:1.78; overflow-y:auto; flex:1; min-height:300px; }
    .markdown-preview h1,.markdown-preview h2,.markdown-preview h3 { font-family:var(--font-display); color:var(--color-primary); }
    .markdown-preview code { background:var(--color-primary-light); padding:1px 5px; border-radius:3px; font-size:0.88em; }
    .markdown-preview blockquote { border-left:3px solid var(--color-primary); padding-left:var(--space-4); color:var(--color-text-secondary); font-style:italic; margin:0; }
    .transliteration-helper { background:var(--color-primary-light); border-radius:var(--radius-base); padding:var(--space-4); }
    .transliteration-helper label { font-family:var(--font-ui); font-size:var(--text-xs); font-weight:700; color:var(--color-primary); display:block; margin-bottom:var(--space-2); text-transform:uppercase; letter-spacing:0.05em; }
    .transliteration-inputs { display:flex; gap:var(--space-3); align-items:center; flex-wrap:wrap; }
    .trans-input { flex:1; min-width:130px; padding:var(--space-2) var(--space-3); border-radius:var(--radius-base); border:1px solid var(--color-border); background:var(--color-surface); font-family:var(--font-ui); font-size:var(--text-sm); }
    .trans-output { font-size:var(--text-lg); color:var(--color-primary); font-weight:600; min-width:120px; }
    .citation-builder { background:var(--color-bg); border-radius:var(--radius-base); padding:var(--space-4); border:1px solid var(--color-border); }
    .citation-tab-btns { display:flex; gap:var(--space-2); margin-bottom:var(--space-3); flex-wrap:wrap; }
    .citation-tab-btn { padding:var(--space-1) var(--space-3); font-family:var(--font-ui); font-size:var(--text-xs); border-radius:var(--radius-pill); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-secondary); cursor:pointer; transition:all 150ms; }
    .citation-tab-btn.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); }
    .citation-output-text { font-family:var(--font-ui); font-size:var(--text-xs); color:var(--color-text-secondary); white-space:pre-wrap; line-height:1.6; min-height:48px; }

    /* ── Bookmark state ── */
    [data-bookmark-id].bookmarked { color:var(--color-primary); }

    /* ── Animation ── */
    @keyframes p3FadeIn {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
