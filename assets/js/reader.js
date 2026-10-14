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
    // Ignore keystrokes when typing inside an input or textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      document.body.classList.remove('drawer-open');
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
