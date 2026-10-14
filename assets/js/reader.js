/**
 * ΜΙΚΡΑ ΜΑΘΗΜΑΤΑ ΓΙΑ ΕΝΑΝ ΜΕΓΑΛΟ ΚΟΣΜΟ
 * Modern Book Reader Engine
 * Handles themes, responsive drawer, font controls, TOC search,
 * reading progress, keyboard shortcuts, and floating navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDOMEnrichment();
  initProgressBar();
  initThemeSwitcher();
  initFontSizeControls();
  initSidebarDrawer();
  initTOCSearch();
  initReadingTimeEstimate();
  initFloatingActions();
  initKeyboardShortcuts();
  initSectionAnchors();
  initYouTubeQuotePlayer();
  initGlobalSearch();
});

/**
 * Ensures required UI helper elements exist in the DOM for full backward & cross-page compatibility.
 */
function initDOMEnrichment() {
  // 1. Ensure Drawer Backdrop exists
  if (!document.getElementById('drawer-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'drawer-backdrop';
    backdrop.className = 'drawer-backdrop';
    document.body.appendChild(backdrop);
  }

  // 2. Ensure Sidebar Close Button exists in sidebar header
  const sidebarHeader = document.querySelector('.sidebar-header');
  if (sidebarHeader && !document.getElementById('sidebar-close')) {
    let topRow = sidebarHeader.querySelector('.sidebar-header-top');
    if (!topRow) {
      topRow = document.createElement('div');
      topRow.className = 'sidebar-header-top';
      const brand = sidebarHeader.querySelector('.sidebar-brand');
      if (brand) {
        brand.parentNode.insertBefore(topRow, brand);
        topRow.appendChild(brand);
      } else {
        sidebarHeader.insertBefore(topRow, sidebarHeader.firstChild);
      }
    }
    const closeBtn = document.createElement('button');
    closeBtn.id = 'sidebar-close';
    closeBtn.className = 'sidebar-close-btn';
    closeBtn.setAttribute('aria-label', 'Κλείσιμο μενού περιεχομένων');
    closeBtn.setAttribute('title', 'Κλείσιμο');
    closeBtn.innerHTML = '✕';
    topRow.appendChild(closeBtn);
  }

  // 3. Ensure Sidebar Toggle Button exists in top-bar
  const topBar = document.querySelector('.top-bar');
  if (topBar && !document.getElementById('sidebar-toggle')) {
    const topBarLeft = topBar.querySelector('.top-bar-left') || topBar;
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'sidebar-toggle';
    toggleBtn.className = 'sidebar-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Πίνακας Περιεχομένων');
    toggleBtn.setAttribute('title', 'Πίνακας Περιεχομένων');
    toggleBtn.innerHTML = `
      <svg class="toggle-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      <span class="toggle-label">Περιεχόμενα</span>
    `;
    topBarLeft.insertBefore(toggleBtn, topBarLeft.firstChild);
  }

  // 4. Ensure Top-bar Global Search Button exists in top-bar
  if (topBar && !document.getElementById('top-search-btn')) {
    const controlsGroup = topBar.querySelector('.controls-group') || topBar;
    const searchBtn = document.createElement('button');
    searchBtn.id = 'top-search-btn';
    searchBtn.className = 'top-search-btn';
    searchBtn.setAttribute('aria-label', 'Ολική Αναζήτηση σε όλα τα μαθήματα');
    searchBtn.setAttribute('title', 'Αναζήτηση σε όλο το βιβλίο (Ctrl+K ή /)');
    searchBtn.innerHTML = `
      <svg class="top-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span class="top-search-label">Αναζήτηση</span>
      <kbd class="top-search-kbd">⌘K</kbd>
    `;
    controlsGroup.insertBefore(searchBtn, controlsGroup.firstChild);
  }

  // 5. Ensure Sidebar Global Search Button exists in sidebar search box
  const sidebarSearchBox = document.querySelector('.sidebar-search-box');
  if (sidebarSearchBox && !document.getElementById('sidebar-global-search-btn')) {
    const sbSearchBtn = document.createElement('button');
    sbSearchBtn.id = 'sidebar-global-search-btn';
    sbSearchBtn.className = 'sidebar-global-search-btn';
    sbSearchBtn.type = 'button';
    sbSearchBtn.setAttribute('aria-label', 'Ολική αναζήτηση στα 21 μαθήματα');
    sbSearchBtn.setAttribute('title', 'Αναζήτηση σε όλο το κείμενο (Ctrl+K)');
    sbSearchBtn.innerHTML = `
      <span class="sb-search-btn-inner">
        <svg class="search-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>Αναζήτηση σε όλο το κείμενο</span>
      </span>
      <kbd>⌘K</kbd>
    `;
    sidebarSearchBox.appendChild(sbSearchBtn);
  }

  // 6. Ensure Chapter Header has id="top" for intro/subtitle jump anchors
  const mainHeader = document.querySelector('.chapter-header');
  if (mainHeader && !mainHeader.id && !document.getElementById('top')) {
    mainHeader.id = 'top';
  }
}

/**
 * Reading Progress Bar & Floating Indicator
 */
function initProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  const progressBadge = document.getElementById('floating-progress-badge');
  let ticking = false;

  function updateProgress() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0) {
      const percent = Math.min(100, Math.max(0, Math.round((winScroll / height) * 100)));
      if (progressBar) {
        progressBar.style.width = percent + '%';
      }
      if (progressBadge) {
        progressBadge.textContent = percent + '%';
      }
    }
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  updateProgress();
}

/**
 * Theme Switcher (Parchment, Sepia, Dark)
 */
function initThemeSwitcher() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  const savedTheme = localStorage.getItem('maria-book-theme') || 'parchment';
  setTheme(savedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const theme = btn.dataset.theme;
      setTheme(theme);
    });
  });

  function setTheme(theme) {
    if (theme === 'parchment' || !theme) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('maria-book-theme', theme);
    
    // Update active class on all theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme || (theme === 'parchment' && btn.dataset.theme === 'parchment'));
    });
  }

  // Expose helper globally for shortcut cycling
  window.cycleBookTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'parchment';
    const themes = ['parchment', 'sepia', 'dark'];
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    setTheme(next);
  };
}

/**
 * Font Size Adjustment Controls
 */
function initFontSizeControls() {
  const scaleSteps = [0.85, 0.92, 1.0, 1.08, 1.16, 1.25];
  let currentStep = 2; // Index 2 corresponds to 1.0 (default base)
  
  const saved = localStorage.getItem('maria-book-font-size');
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (parsed >= 15 && parsed <= 25) {
      currentStep = Math.max(0, Math.min(scaleSteps.length - 1, parsed - 17));
    } else if (parsed >= 0 && parsed < scaleSteps.length) {
      currentStep = parsed;
    }
    applyFontScale(scaleSteps[currentStep]);
  }

  const btnDec = document.getElementById('btn-font-dec') || document.getElementById('font-dec');
  const btnInc = document.getElementById('btn-font-inc') || document.getElementById('font-inc');

  if (btnDec) {
    btnDec.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep -= 1;
        applyFontScale(scaleSteps[currentStep]);
        localStorage.setItem('maria-book-font-size', (17 + currentStep).toString());
      }
    });
  }

  if (btnInc) {
    btnInc.addEventListener('click', () => {
      if (currentStep < scaleSteps.length - 1) {
        currentStep += 1;
        applyFontScale(scaleSteps[currentStep]);
        localStorage.setItem('maria-book-font-size', (17 + currentStep).toString());
      }
    });
  }

  function applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', scale);
  }
}

/**
 * Mobile Drawer & Desktop Collapse Toggle
 */
function initSidebarDrawer() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const backdrop = document.getElementById('drawer-backdrop');

  function openDrawer() {
    document.body.classList.add('drawer-open');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'false');

    // Auto-scroll active chapter into view inside drawer smoothly without moving the window
    const activeItem = sidebar ? sidebar.querySelector('.toc-item.active') : null;
    if (activeItem && sidebar) {
      setTimeout(() => {
        const targetScroll = activeItem.offsetTop - (sidebar.clientHeight / 2) + (activeItem.clientHeight / 2);
        sidebar.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      }, 150);
    }
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
    if (sidebar && window.innerWidth < 1024) sidebar.setAttribute('aria-hidden', 'true');
  }

  function toggleSidebar() {
    // If mobile/tablet (drawer mode)
    if (window.innerWidth < 1024) {
      if (document.body.classList.contains('drawer-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    } else {
      // Desktop: collapse / expand sidebar for wide reading
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('maria-book-sidebar-collapsed', document.body.classList.contains('sidebar-collapsed') ? 'true' : 'false');
    }
  }

  // Restore desktop collapsed state
  if (window.innerWidth >= 1024 && localStorage.getItem('maria-book-sidebar-collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  // Auto-close on clicking a chapter link on mobile
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('.toc-link') && window.innerWidth < 1024) {
        closeDrawer();
      }
    });
  }

  // Touch Swipe Gesture on mobile to close drawer: strictly check horizontal dominance
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  if (sidebar) {
    sidebar.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    sidebar.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartX - touchEndX;
      const deltaY = Math.abs(touchStartY - touchEndY);
      const deltaTime = Date.now() - touchStartTime;

      // Swiped left to close: must be predominantly horizontal (not diagonal or vertical scrolling)
      if (deltaX > 50 && (deltaX > deltaY * 1.5 || (deltaTime < 300 && deltaX > 35))) {
        closeDrawer();
      }
    }, { passive: true });
  }

  // Edge-swipe right to open drawer on mobile (<1024px)
  let edgeStartX = 0;
  let edgeStartY = 0;
  document.addEventListener('touchstart', (e) => {
    if (window.innerWidth < 1024 && !document.body.classList.contains('drawer-open')) {
      const t = e.touches[0];
      if (t.clientX <= 25) {
        edgeStartX = t.clientX;
        edgeStartY = t.clientY;
      } else {
        edgeStartX = 0;
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (edgeStartX > 0 && window.innerWidth < 1024 && !document.body.classList.contains('drawer-open')) {
      const t = e.changedTouches[0];
      const deltaX = t.clientX - edgeStartX;
      const deltaY = Math.abs(t.clientY - edgeStartY);
      if (deltaX > 50 && deltaX > deltaY * 1.5) {
        openDrawer();
      }
      edgeStartX = 0;
    }
  }, { passive: true });

  // Expose global drawer toggle
  window.toggleBookDrawer = toggleSidebar;
}

/**
 * Real-time TOC Search / Filter
 */
function initTOCSearch() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  if (!sidebarHeader) return;

  // Insert search box below header
  let searchBox = sidebar.querySelector('.sidebar-search-box');
  if (!searchBox) {
    searchBox = document.createElement('div');
    searchBox.className = 'sidebar-search-box';
    searchBox.innerHTML = `
      <svg class="sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="search" class="sidebar-search-input" placeholder="Αναζήτηση κεφαλαίου..." aria-label="Αναζήτηση στα 21 μαθήματα">
    `;
    sidebarHeader.parentNode.insertBefore(searchBox, sidebarHeader.nextSibling);
  }

  const searchInput = searchBox.querySelector('.sidebar-search-input');
  const tocList = sidebar.querySelector('.toc-list');
  const tocItems = sidebar.querySelectorAll('.toc-item');
  const countBadge = sidebar.querySelector('.sidebar-count-badge');

  // Insert no results feedback element inside TOC list if not present
  let noResultsEl = sidebar.querySelector('.toc-no-results');
  if (!noResultsEl && tocList) {
    noResultsEl = document.createElement('li');
    noResultsEl.className = 'toc-no-results';
    tocList.appendChild(noResultsEl);
  }

  if (searchInput) {
    // Greek accent and final-sigma normalization helper
    const normalizeGreek = (str) => {
      if (!str) return '';
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove combining diacritics
        .toLowerCase()
        .replace(/ς/g, 'σ'); // normalize Greek final sigma to standard sigma
    };

    const performFilter = () => {
      const rawQuery = searchInput.value.trim();
      const normQuery = normalizeGreek(rawQuery);
      let visibleCount = 0;

      tocItems.forEach(item => {
        const text = normalizeGreek(item.textContent || '');
        if (!normQuery || text.includes(normQuery)) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });

      if (noResultsEl) {
        if (normQuery && visibleCount === 0) {
          noResultsEl.textContent = `Δεν βρέθηκαν κεφάλαια για «${rawQuery}»`;
          noResultsEl.classList.add('visible');
        } else {
          noResultsEl.classList.remove('visible');
        }
      }

      if (countBadge) {
        countBadge.textContent = normQuery ? visibleCount.toString() : '21';
      }
    };

    searchInput.addEventListener('input', performFilter);

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        performFilter();
        searchInput.blur();
      }
    });
  }
}

/**
 * Automatic Reading Time & Word Count Estimate
 */
function initReadingTimeEstimate() {
  const article = document.querySelector('.prose') || document.querySelector('.chapter-body') || document.querySelector('.content-container');
  const chapterHeader = document.querySelector('.chapter-header');
  if (!article || !chapterHeader) return;

  // Check if estimate badge already exists
  if (chapterHeader.querySelector('.reading-estimate-badge')) return;

  const text = article.innerText || article.textContent || '';
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (words < 100) return;

  // Average reading speed ~190 words/min for university lecture prose
  const minutes = Math.max(1, Math.round(words / 190));
  
  const badge = document.createElement('div');
  badge.className = 'reading-estimate-badge';
  badge.innerHTML = `
    <span>⏱ ~${minutes} λεπτά ανάγνωση</span>
    <span style="opacity: 0.6;">(${words.toLocaleString('el-GR')} λέξεις)</span>
  `;

  let metaRow = chapterHeader.querySelector('.chapter-meta-row');
  if (!metaRow) {
    metaRow = document.createElement('div');
    metaRow.className = 'chapter-meta-row';
    const videoBadge = chapterHeader.querySelector('.video-reference-badge');
    if (videoBadge) {
      videoBadge.parentNode.insertBefore(metaRow, videoBadge);
      metaRow.appendChild(badge);
      metaRow.appendChild(videoBadge);
    } else {
      chapterHeader.appendChild(metaRow);
      metaRow.appendChild(badge);
    }
  } else {
    metaRow.insertBefore(badge, metaRow.firstChild);
  }
}

/**
 * Floating Action Controls (Back to Top, Quick TOC, Progress Indicator)
 */
function initFloatingActions() {
  if (document.getElementById('floating-actions')) return;

  const container = document.createElement('div');
  container.id = 'floating-actions';
  container.className = 'floating-actions';
  container.innerHTML = `
    <div id="floating-progress-badge" class="floating-progress-badge" title="Πρόοδος ανάγνωσης">0%</div>
    <button id="floating-toc-btn" class="floating-btn" aria-label="Πίνακας Περιεχομένων" title="Πίνακας Περιεχομένων (T)">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    </button>
    <button id="floating-top-btn" class="floating-btn" aria-label="Επιστροφή στην κορυφή" title="Επιστροφή στην Κορυφή" style="opacity: 0; pointer-events: none;">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  `;
  document.body.appendChild(container);

  const topBtn = document.getElementById('floating-top-btn');
  const tocBtn = document.getElementById('floating-toc-btn');

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      if (scrolled > 350) {
        topBtn.style.opacity = '1';
        topBtn.style.pointerEvents = 'auto';
      } else {
        topBtn.style.opacity = '0';
        topBtn.style.pointerEvents = 'none';
      }
    }, { passive: true });
  }

  if (tocBtn) {
    tocBtn.addEventListener('click', () => {
      if (window.toggleBookDrawer) {
        window.toggleBookDrawer();
      }
    });
  }
}

/**
 * Intuitive Keyboard Shortcuts
 */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const searchModal = document.getElementById('global-search-modal');
    const isSearchModalOpen = searchModal && searchModal.classList.contains('is-open');

    // Global Search shortcuts: Ctrl+K or Cmd+K works from anywhere (supports Latin & Greek keyboard layouts)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'κ' || e.key === 'Κ' || e.code === 'KeyK')) {
      e.preventDefault();
      if (window.openGlobalSearch) {
        window.openGlobalSearch();
      }
      return;
    }

    // Ignore single keystrokes when typing inside an input or textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      if (e.key === 'Escape') {
        if (isSearchModalOpen && window.closeGlobalSearch) {
          window.closeGlobalSearch();
        } else {
          document.activeElement.blur();
        }
      }
      return;
    }

    // Single '/' shortcut for global search when not typing
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (window.openGlobalSearch) {
        window.openGlobalSearch();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isSearchModalOpen && window.closeGlobalSearch) {
        window.closeGlobalSearch();
      } else if (document.body.classList.contains('has-active-player') && window.closeQuotePlayer) {
        window.closeQuotePlayer();
      } else {
        document.body.classList.remove('drawer-open');
      }
    } else if ((e.key === 't' || e.key === 'T' || e.key === 'τ' || e.key === 'Τ' || e.code === 'KeyT') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (window.toggleBookDrawer) {
        window.toggleBookDrawer();
      }
    } else if ((e.key === 'd' || e.key === 'D' || e.key === 'δ' || e.key === 'Δ' || e.code === 'KeyD') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (window.cycleBookTheme) {
        window.cycleBookTheme();
      }
    } else if (e.altKey && (e.key === 'ArrowRight' || e.code === 'ArrowRight')) {
      const nextCard = document.querySelector('.nav-card-next');
      if (nextCard && nextCard.href) {
        window.location.href = nextCard.href;
      }
    } else if (e.altKey && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft')) {
      const prevCard = document.querySelector('.nav-card-prev');
      if (prevCard && prevCard.href) {
        window.location.href = prevCard.href;
      }
    }
  });
}

/**
 * Section Anchors & Hash Navigation Handler
 * Ensures all h2 section headers have reliable id="sec-N" anchors and handles in-page jumps.
 */
function initSectionAnchors() {
  const container = document.querySelector('.content-container') || document.querySelector('.prose');
  if (container) {
    const headings = container.querySelectorAll('h2');
    headings.forEach((h2, idx) => {
      const text = h2.textContent || '';
      const match = text.match(/^(\d+)\./);
      const secId = match ? `sec-${match[1]}` : `sec-${idx + 1}`;
      if (!h2.id || h2.id === 'sec-') {
        h2.id = secId;
      }
    });

    const timeline = document.querySelector('.timeline-card');
    if (timeline && !timeline.id) {
      timeline.id = 'timeline';
    }

    const synthesis = document.querySelector('.synthesis-section');
    if (synthesis && !synthesis.id) {
      synthesis.id = 'synthesis';
    }
  }

  // Smooth scroll and flash target if page was loaded with a hash
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    let target = document.getElementById(hash);
    if (!target && hash === 'top') {
      target = document.querySelector('.chapter-header') || document.body;
    } else if (!target && hash === 'timeline') {
      target = document.querySelector('.timeline-card');
    } else if (!target && hash === 'synthesis') {
      target = document.querySelector('.synthesis-section');
    }
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('highlight-target');
        setTimeout(() => target.classList.remove('highlight-target'), 2600);
      }, 250);
    }
  }
}

/**
 * Improvement 1: Floating YouTube Quote Player (Picture-in-Picture)
 * Intercepts clicks on timestamp links within .box-maria quote boxes.
 * Opens an interactive Picture-in-Picture player modal using youtube-nocookie.com
 * with autoplay=1&start={seconds}.
 * Includes Close (✕), Minimize/Expand toggle, and 'Open in YouTube' fallback.
 */
function initYouTubeQuotePlayer() {
  let playerContainer = document.getElementById('floating-quote-player');
  if (!playerContainer) {
    playerContainer = document.createElement('div');
    playerContainer.id = 'floating-quote-player';
    playerContainer.className = 'floating-quote-player';
    playerContainer.setAttribute('role', 'dialog');
    playerContainer.setAttribute('aria-label', 'Αναπαραγωγή Αποσπάσματος Μαρίας Ευθυμίου');
    playerContainer.setAttribute('aria-hidden', 'true');
    playerContainer.innerHTML = `
      <div class="quote-player-header">
        <div class="quote-player-drag-handle" title="Μαρία Ευθυμίου: Προφορική Διάλεξη">
          <span class="quote-player-icon">💬</span>
          <span id="quote-player-title" class="quote-player-title">Μαρία Ευθυμίου</span>
        </div>
        <div class="quote-player-actions">
          <a id="quote-player-yt-link" class="quote-player-btn quote-player-yt-btn" href="#" target="_blank" rel="noopener noreferrer" title="Άνοιγμα στο YouTube">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span class="sr-only">YouTube</span>
          </a>
          <button id="quote-player-toggle" class="quote-player-btn quote-player-toggle-btn" aria-label="Ελαχιστοποίηση" title="Ελαχιστοποίηση">
            <span class="toggle-icon-minus">−</span>
            <span class="toggle-icon-expand">⤢</span>
          </button>
          <button id="quote-player-close" class="quote-player-btn quote-player-close-btn" aria-label="Κλείσιμο" title="Κλείσιμο (✕)">✕</button>
        </div>
      </div>
      <div class="quote-player-body">
        <iframe id="quote-player-iframe" 
          src="" 
          title="Maria Efthymiou Audio/Video Quote" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
    document.body.appendChild(playerContainer);
  }

  const iframe = playerContainer.querySelector('#quote-player-iframe');
  const titleEl = playerContainer.querySelector('#quote-player-title');
  const ytLink = playerContainer.querySelector('#quote-player-yt-link');
  const toggleBtn = playerContainer.querySelector('#quote-player-toggle');
  const closeBtn = playerContainer.querySelector('#quote-player-close');

  function openPlayer(videoId, startSeconds, rawUrl, label) {
    if (!videoId) return;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${startSeconds}&rel=0`;
    iframe.src = embedUrl;
    titleEl.textContent = label || 'Μαρία Ευθυμίου (Απόσπασμα)';
    titleEl.setAttribute('title', label || 'Μαρία Ευθυμίου');
    ytLink.href = rawUrl || `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`;
    
    playerContainer.classList.add('is-active');
    playerContainer.classList.remove('is-minimized');
    playerContainer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-active-player');
    document.body.classList.remove('player-minimized');
    if (toggleBtn) {
      toggleBtn.setAttribute('title', 'Ελαχιστοποίηση');
      toggleBtn.setAttribute('aria-label', 'Ελαχιστοποίηση');
    }
  }

  function closePlayer() {
    iframe.src = '';
    playerContainer.classList.remove('is-active', 'is-minimized');
    playerContainer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-active-player', 'player-minimized');
  }

  function toggleMinimize() {
    const isMin = playerContainer.classList.toggle('is-minimized');
    document.body.classList.toggle('player-minimized', isMin);
    if (toggleBtn) {
      toggleBtn.setAttribute('title', isMin ? 'Μεγιστοποίηση' : 'Ελαχιστοποίηση');
      toggleBtn.setAttribute('aria-label', isMin ? 'Μεγιστοποίηση' : 'Ελαχιστοποίηση');
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closePlayer);
  if (toggleBtn) toggleBtn.addEventListener('click', toggleMinimize);

  // Parse YouTube URL helper
  function parseYT(urlStr) {
    if (!urlStr) return null;
    let videoId = '';
    let startSeconds = 0;
    
    // Unescape &amp;
    const cleanUrl = urlStr.replace(/&amp;/g, '&');
    
    // Match ID
    const idMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (idMatch) {
      videoId = idMatch[1];
    }
    
    // Match start time
    const tMatch = cleanUrl.match(/[?&]t=([0-9hms]+)/i);
    if (tMatch) {
      const tVal = tMatch[1];
      if (/^\d+s?$/.test(tVal)) {
        startSeconds = parseInt(tVal, 10);
      } else {
        let total = 0;
        const h = tVal.match(/(\d+)h/i);
        const m = tVal.match(/(\d+)m/i);
        const s = tVal.match(/(\d+)s/i);
        if (h) total += parseInt(h[1], 10) * 3600;
        if (m) total += parseInt(m[1], 10) * 60;
        if (s) total += parseInt(s[1], 10);
        if (total > 0) startSeconds = total;
      }
    }
    return videoId ? { videoId, startSeconds } : null;
  }

  // Intercept click on any timestamp badge within .box-maria or any quote timestamp link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.box-maria .timestamp-badge, .box-maria a[href*="youtube.com"], .box-maria a[href*="youtu.be"], a.timestamp-badge');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    const yt = parseYT(href);
    if (yt) {
      e.preventDefault();
      const badgeText = link.textContent.trim().replace(/^[▶►\s]+/, '');
      const box = link.closest('.box-maria');
      let title = 'Μαρία Ευθυμίου';
      if (box) {
        const boxTitle = box.querySelector('.box-maria-title');
        if (boxTitle) {
          title = boxTitle.textContent.trim().replace(/^[💬\s]+/, '');
        }
      }
      openPlayer(yt.videoId, yt.startSeconds, href, `💬 ${title} (${badgeText})`);
    }
  });

  window.openQuotePlayer = openPlayer;
  window.closeQuotePlayer = closePlayer;
}

/**
 * Improvement 2: Global In-Text Search across all 75,000 words
 * Fast client-side full-text search with Greek accent-agnostic and final-sigma ('ς' <-> 'σ') normalization.
 * Displays result snippets with highlighted keyword matches and direct jump links.
 * Accessible via top-bar search button, keyboard shortcuts ('/' or Ctrl/Cmd+K), and sidebar drawer.
 */
function initGlobalSearch() {
  let modalBackdrop = document.getElementById('global-search-modal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'global-search-modal';
    modalBackdrop.className = 'search-modal-backdrop';
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.innerHTML = `
      <div class="search-modal-container" role="dialog" aria-modal="true" aria-label="Ολική Αναζήτηση Κειμένου στα 21 Μαθήματα">
        <div class="search-modal-header">
          <div class="search-input-wrapper">
            <svg class="search-modal-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="search" 
              id="global-search-input" 
              class="global-search-input" 
              placeholder="Αναζήτηση στα 21 μαθήματα (75.000 λέξεις)..." 
              aria-label="Αναζήτηση στα 21 μαθήματα"
              autocomplete="off" 
              spellcheck="false"
            >
            <div class="search-shortcut-hint"><kbd>ESC</kbd></div>
          </div>
          <button id="search-modal-close" class="search-modal-close-btn" aria-label="Κλείσιμο αναζήτησης" title="Κλείσιμο (Esc)">✕</button>
        </div>
        <div class="search-modal-meta">
          <span id="search-results-count" class="search-results-count">Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες...</span>
          <div class="search-meta-hints">
            <span class="hint-badge"><kbd>↑</kbd><kbd>↓</kbd> Επιλογή</span>
            <span class="hint-badge"><kbd>↵</kbd> Μετάβαση</span>
          </div>
        </div>
        <div id="search-results-list" class="search-results-list"></div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);
  }

  const searchInput = modalBackdrop.querySelector('#global-search-input');
  const resultsList = modalBackdrop.querySelector('#search-results-list');
  const resultsCount = modalBackdrop.querySelector('#search-results-count');
  const closeBtn = modalBackdrop.querySelector('#search-modal-close');

  let searchIndexData = null;
  let isLoadingIndex = false;
  let selectedIndex = -1;

  // Greek normalization function (accent-agnostic & final-sigma ς <-> σ)
  const normalizeGreek = (str) => {
    if (!str) return '';
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ς/g, 'σ');
  };

  // Safe HTML escaper
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Fetch search index asynchronously
  async function loadSearchIndex() {
    if (searchIndexData || isLoadingIndex) return searchIndexData;
    isLoadingIndex = true;
    try {
      const isInChapters = window.location.pathname.includes('/chapters/');
      const indexPath = isInChapters ? '../assets/search_index.json' : 'assets/search_index.json';
      const res = await fetch(indexPath);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      
      const items = Array.isArray(data) ? data : (data.items || []);
      items.forEach(item => {
        item._normText = normalizeGreek(item.text);
        item._normSec = normalizeGreek(item.sec_title);
        item._normCh = normalizeGreek(item.ch_title);
      });
      searchIndexData = { chapters: data.chapters || [], items };
    } catch (err) {
      console.warn("Could not load search_index.json:", err);
    } finally {
      isLoadingIndex = false;
    }
    return searchIndexData;
  }

  function openModal() {
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-modal-open');
    loadSearchIndex().then(() => {
      if (!searchInput.value.trim()) {
        renderSuggestions();
      }
    });
    setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 50);
  }

  function closeModal() {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-modal-open');
    selectedIndex = -1;
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Delegated click listener for all search trigger buttons across pages and viewports
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#top-search-btn, #sidebar-global-search-btn, .top-search-btn, .sidebar-global-search-btn');
    if (btn) {
      e.preventDefault();
      if (window.innerWidth < 1024) {
        document.body.classList.remove('drawer-open');
      }
      openModal();
    }
  });

  // Render initial suggestions
  function renderSuggestions() {
    const chips = ['Νεάντερταλ', 'Γεωργική Επανάσταση', 'Τζένγκις Χαν', 'Κομφούκιος', 'Ισλάμ', 'Βούδας', 'Στέπες', 'Αλεξάνδρεια', 'Ρωσία'];
    resultsCount.textContent = 'Προτεινόμενες θεματικές αναζήτησης στα 21 μαθήματα:';
    resultsList.innerHTML = `
      <div class="search-suggestions-container">
        <div class="search-suggestions-title">Δημοφιλείς όροι αναζήτησης:</div>
        <div class="search-chips-group">
          ${chips.map(c => `<button type="button" class="search-chip" data-query="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
        </div>
        <div class="search-suggestions-hint" style="margin-top: 1.5rem; font-size: 0.82rem; color: var(--text-faint);">
          Πληκτρολογήστε οποιονδήποτε ιστορικό όρο, πρόσωπο, τοποθεσία ή ιδέα.
        </div>
      </div>
    `;
    resultsList.querySelectorAll('.search-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        searchInput.value = btn.dataset.query;
        performSearch();
      });
    });
  }

  // Build snippet with highlighted matching keywords
  function createSnippet(origText, terms) {
    if (!origText) return '';
    const normText = normalizeGreek(origText);
    
    // Find earliest match position
    let firstIdx = -1;
    let matchedLen = 0;
    for (const t of terms) {
      const idx = normText.indexOf(t);
      if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
        firstIdx = idx;
        matchedLen = t.length;
      }
    }

    if (firstIdx === -1) {
      return escapeHtml(origText.slice(0, 150)) + (origText.length > 150 ? '…' : '');
    }

    // Dynamic window centered around match
    let start = Math.max(0, firstIdx - 55);
    let end = Math.min(origText.length, firstIdx + matchedLen + 85);

    // Expand to word boundaries
    if (start > 0) {
      const sp = origText.lastIndexOf(' ', start);
      if (sp !== -1 && sp >= start - 15) start = sp + 1;
    }
    if (end < origText.length) {
      const sp = origText.indexOf(' ', end);
      if (sp !== -1 && sp <= end + 15) end = sp;
    }

    const snippetSlice = origText.slice(start, end);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < origText.length ? '…' : '';

    // Match ranges within snippetSlice
    const normSlice = normalizeGreek(snippetSlice);
    let ranges = [];
    for (const t of terms) {
      if (!t) continue;
      let p = 0;
      while ((p = normSlice.indexOf(t, p)) !== -1) {
        ranges.push({ start: p, end: p + t.length });
        p += t.length;
      }
    }

    // Merge overlapping ranges
    ranges.sort((a, b) => a.start - b.start);
    let merged = [];
    for (const r of ranges) {
      if (merged.length === 0) {
        merged.push(r);
      } else {
        const last = merged[merged.length - 1];
        if (r.start <= last.end) {
          last.end = Math.max(last.end, r.end);
        } else {
          merged.push(r);
        }
      }
    }

    let out = '';
    let cur = 0;
    for (const r of merged) {
      out += escapeHtml(snippetSlice.slice(cur, r.start));
      out += '<mark class="search-highlight">' + escapeHtml(snippetSlice.slice(r.start, r.end)) + '</mark>';
      cur = r.end;
    }
    out += escapeHtml(snippetSlice.slice(cur));

    return prefix + out + suffix;
  }

  // Resolve chapter jump URL
  function resolveTargetUrl(chNum, anchor) {
    const isInChapters = window.location.pathname.includes('/chapters/');
    let file = `ch${String(chNum).padStart(2, '0')}.html`;
    let base = isInChapters ? '' : 'chapters/';
    return `${base}${file}#${anchor}`;
  }

  function performSearch() {
    const rawQuery = searchInput.value.trim();
    if (!rawQuery) {
      renderSuggestions();
      return;
    }

    if (rawQuery.length < 2) {
      resultsCount.textContent = 'Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες...';
      renderSuggestions();
      return;
    }

    const normQuery = normalizeGreek(rawQuery);
    const terms = normQuery.split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      renderSuggestions();
      return;
    }

    if (!searchIndexData) {
      resultsCount.textContent = 'Φόρτωση ευρετηρίου...';
      loadSearchIndex().then(() => performSearch());
      return;
    }

    const matches = [];
    const items = searchIndexData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let score = 0;
      let allMatch = true;

      for (let j = 0; j < terms.length; j++) {
        const term = terms[j];
        const inText = item._normText.includes(term);
        const inSec = item._normSec.includes(term);
        const inCh = item._normCh.includes(term);

        if (!inText && !inSec && !inCh) {
          allMatch = false;
          break;
        }

        if (inSec) score += 15;
        if (inCh) score += 10;
        if (inText) score += 2;
      }

      if (allMatch) {
        matches.push({ item, score });
      }
    }

    selectedIndex = -1;

    if (matches.length === 0) {
      resultsCount.textContent = `0 αποτελέσματα για «${rawQuery}»`;
      resultsList.innerHTML = `
        <div class="search-empty-state">
          <p>Δεν βρέθηκαν αποτελέσματα για «<strong>${escapeHtml(rawQuery)}</strong>».</p>
          <p style="font-size: 0.82rem; margin-top: 0.5rem; opacity: 0.8;">
            Δοκιμάστε απλούστερες λέξεις, λιγότερους όρους ή συνώνυμα.
          </p>
        </div>
      `;
      return;
    }

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 50);

    resultsCount.textContent = `${matches.length} ${matches.length === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'} για «${rawQuery}»`;

    // Render results
    resultsList.innerHTML = topMatches.map((m, idx) => {
      const it = m.item;
      const jumpUrl = resolveTargetUrl(it.ch, it.anchor);
      const snippetHtml = createSnippet(it.text, terms);
      const chNumFormatted = String(it.ch).padStart(2, '0');

      return `
        <a href="${jumpUrl}" class="search-result-item" data-index="${idx}" data-ch="${it.ch}" data-anchor="${it.anchor}">
          <div class="result-header">
            <span class="result-ch-badge">Μάθημα ${chNumFormatted}</span>
            <span class="result-ch-title">${escapeHtml(it.ch_title)}</span>
            <span class="result-sec-arrow">›</span>
            <span class="result-sec-title">${escapeHtml(it.sec_title)}</span>
          </div>
          <div class="result-snippet">${snippetHtml}</div>
        </a>
      `;
    }).join('');

    // Attach click handlers for in-page smooth jumps if same chapter
    resultsList.querySelectorAll('.search-result-item').forEach(card => {
      card.addEventListener('click', (e) => {
        const targetCh = parseInt(card.dataset.ch, 10);
        const anchor = card.dataset.anchor;

        const currentChMatch = window.location.pathname.match(/ch(\d+)\.html/);
        const currentCh = currentChMatch ? parseInt(currentChMatch[1], 10) : (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 1 : null);

        if (currentCh === targetCh && anchor) {
          e.preventDefault();
          closeModal();
          let targetEl = document.getElementById(anchor);
          if (!targetEl && anchor === 'top') {
            targetEl = document.querySelector('.chapter-header') || document.body;
          } else if (!targetEl && anchor === 'timeline') {
            targetEl = document.querySelector('.timeline-card');
          } else if (!targetEl && anchor === 'synthesis') {
            targetEl = document.querySelector('.synthesis-section');
          }
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetEl.classList.add('highlight-target');
            setTimeout(() => targetEl.classList.remove('highlight-target'), 2600);
            try {
              history.pushState(null, '', '#' + anchor);
            } catch (err) {}
          }
        }
      });
    });
  }

  // Debounced input handler
  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 60);
  });

  // Keyboard navigation inside search results
  searchInput.addEventListener('keydown', (e) => {
    const items = resultsList.querySelectorAll('.search-result-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelectedResult(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelectedResult(items);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  function updateSelectedResult(items) {
    items.forEach((it, idx) => {
      it.classList.toggle('is-selected', idx === selectedIndex);
    });
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  window.openGlobalSearch = openModal;
  window.closeGlobalSearch = closeModal;
}

