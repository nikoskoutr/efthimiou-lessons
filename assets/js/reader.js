/**
 * ΜΙΚΡΑ ΜΑΘΗΜΑΤΑ ΓΙΑ ΕΝΑΝ ΜΕΓΑΛΟ ΚΟΣΜΟ
 * Modern Book Reader Engine
 * Handles themes, responsive drawer, font controls, TOC search,
 * reading progress, section scrollspy, image lightbox, and keyboard shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDOMEnrichment();
  initFloatingActions();
  initProgressBar();
  initThemeSwitcher();
  initFontSizeControls();
  initSidebarDrawer();
  initTOCSearch();
  initReadingTimeEstimate();
  initKeyboardShortcuts();
  initSectionScrollSpy();
  initSectionAnchors();
  initImageLightbox();
});

/**
 * Helper to show a brief toast notification in Greek
 */
function showReaderToast(message) {
  let toast = document.getElementById('reader-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'reader-toast';
    toast.className = 'reader-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2000);
}

/**
 * Ensures required UI helper elements exist in the DOM for full backward & cross-page compatibility.
 */
function initDOMEnrichment() {
  // 1. Remove any legacy author avatar image if present in DOM
  document.querySelectorAll('.author-avatar').forEach(img => img.remove());

  // 2. Ensure Drawer Backdrop exists
  if (!document.getElementById('drawer-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'drawer-backdrop';
    backdrop.className = 'drawer-backdrop';
    document.body.appendChild(backdrop);
  }

  // 3. Ensure Sidebar Close Button exists in sidebar header
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

  // 4. Ensure Sidebar Toggle Button exists in top-bar
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
 * Top Reading Progress Bar
 */
function initProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;
  let ticking = false;

  function updateProgress() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0) {
      const percent = Math.min(100, Math.max(0, (winScroll / height) * 100));
      progressBar.style.width = percent.toFixed(1) + '%';
    } else {
      progressBar.style.width = '0%';
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

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme || (theme === 'parchment' && btn.dataset.theme === 'parchment'));
    });
  }

  window.cycleBookTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'parchment';
    const themes = ['parchment', 'sepia', 'dark'];
    const labels = { parchment: 'Θέμα: Πάπυρος', sepia: 'Θέμα: Σέπια', dark: 'Θέμα: Νύχτα' };
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    setTheme(next);
    showReaderToast(labels[next]);
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
        showReaderToast(`Μέγεθος κειμένου: ${Math.round(scaleSteps[currentStep] * 100)}%`);
      }
    });
  }

  if (btnInc) {
    btnInc.addEventListener('click', () => {
      if (currentStep < scaleSteps.length - 1) {
        currentStep += 1;
        applyFontScale(scaleSteps[currentStep]);
        localStorage.setItem('maria-book-font-size', (17 + currentStep).toString());
        showReaderToast(`Μέγεθος κειμένου: ${Math.round(scaleSteps[currentStep] * 100)}%`);
      }
    });
  }

  function applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', scale);
  }

  window.adjustBookFontSize = function(delta) {
    if (delta > 0 && currentStep < scaleSteps.length - 1) {
      currentStep += 1;
      applyFontScale(scaleSteps[currentStep]);
      localStorage.setItem('maria-book-font-size', (17 + currentStep).toString());
      showReaderToast(`Μέγεθος κειμένου: ${Math.round(scaleSteps[currentStep] * 100)}%`);
    } else if (delta < 0 && currentStep > 0) {
      currentStep -= 1;
      applyFontScale(scaleSteps[currentStep]);
      localStorage.setItem('maria-book-font-size', (17 + currentStep).toString());
      showReaderToast(`Μέγεθος κειμένου: ${Math.round(scaleSteps[currentStep] * 100)}%`);
    }
  };
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

    const activeItem = sidebar ? sidebar.querySelector('.toc-item.active') : null;
    if (activeItem && sidebar) {
      setTimeout(() => {
        const targetScroll = activeItem.offsetTop - (sidebar.clientHeight / 3);
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
    if (window.innerWidth < 1024) {
      if (document.body.classList.contains('drawer-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    } else {
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('maria-book-sidebar-collapsed', document.body.classList.contains('sidebar-collapsed') ? 'true' : 'false');
    }
  }

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

  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      if ((e.target.closest('.toc-link') || e.target.closest('.toc-sublink')) && window.innerWidth < 1024) {
        closeDrawer();
      }
    });
  }

  // Touch Swipe Gesture on mobile to close drawer
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

  let noResultsEl = sidebar.querySelector('.toc-no-results');
  if (!noResultsEl && tocList) {
    noResultsEl = document.createElement('li');
    noResultsEl.className = 'toc-no-results';
    tocList.appendChild(noResultsEl);
  }

  if (searchInput) {
    const normalizeGreek = (str) => {
      if (!str) return '';
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ς/g, 'σ');
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

  if (chapterHeader.querySelector('.reading-estimate-badge')) return;

  const text = article.innerText || article.textContent || '';
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (words < 100) return;

  const minutes = Math.max(1, Math.round(words / 190));

  const badge = document.createElement('div');
  badge.className = 'reading-estimate-badge';
  badge.innerHTML = `
    <span>⏱ ~${minutes} λεπτά ανάγνωση</span>
    <span style="opacity: 0.65;">(${words.toLocaleString('el-GR')} λέξεις)</span>
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
 * Minimalist Floating Scroll-to-Top Action
 * (Removed redundant 0% badge and duplicate TOC button)
 */
function initFloatingActions() {
  let container = document.getElementById('floating-actions');
  if (!container) {
    container = document.createElement('div');
    container.id = 'floating-actions';
    container.className = 'floating-actions';
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <button id="floating-top-btn" class="floating-btn" aria-label="Επιστροφή στην κορυφή" title="Επιστροφή στην κορυφή">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  `;

  const topBtn = document.getElementById('floating-top-btn');
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const toggleVisibility = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      topBtn.classList.toggle('visible', scrolled > 400);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
  }
}

/**
 * In-Chapter Section Outline & IntersectionObserver Scrollspy
 */
function initSectionScrollSpy() {
  const headings = Array.from(document.querySelectorAll('.prose h2[id], .chapter-body h2[id]'));
  const activeTocItem = document.querySelector('.toc-item.active');
  const topBarTitle = document.querySelector('.top-bar-title');
  const defaultTopBarText = topBarTitle ? topBarTitle.textContent : '';

  if (!headings.length || !activeTocItem) return;

  let sublist = activeTocItem.querySelector('.toc-sublist');
  if (!sublist) {
    sublist = document.createElement('ul');
    sublist.className = 'toc-sublist';
    headings.forEach(h2 => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'toc-sublink';
      a.href = `#${h2.id}`;
      a.textContent = h2.textContent.replace(/#$/, '').trim();
      li.appendChild(a);
      sublist.appendChild(li);
    });
    activeTocItem.appendChild(sublist);
  }

  const sublinks = Array.from(sublist.querySelectorAll('.toc-sublink'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        sublinks.forEach(link => {
          const isMatch = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active-section', isMatch);
          if (isMatch && topBarTitle && window.scrollY > 280) {
            topBarTitle.textContent = link.textContent;
          }
        });
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

  headings.forEach(h2 => observer.observe(h2));

  window.addEventListener('scroll', () => {
    if (window.scrollY <= 280 && topBarTitle) {
      topBarTitle.textContent = defaultTopBarText;
    }
  }, { passive: true });
}

/**
 * Copyable Section Anchor Links on H2 Headings
 */
function initSectionAnchors() {
  const headings = document.querySelectorAll('.prose h2[id], .chapter-body h2[id]');
  headings.forEach(h2 => {
    if (h2.querySelector('.section-anchor-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-anchor-btn';
    btn.setAttribute('aria-label', 'Αντιγραφή συνδέσμου ενότητας');
    btn.setAttribute('title', 'Αντιγραφή συνδέσμου ενότητας');
    btn.textContent = '#';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}${window.location.pathname}#${h2.id}`;
      history.replaceState(null, '', `#${h2.id}`);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          showReaderToast('Ο σύνδεσμος της ενότητας αντιγράφηκε!');
        }).catch(() => {});
      }
    });
    h2.appendChild(btn);
  });
}

/**
 * Accessible Full-Screen Image Lightbox for Historical Maps & Plates
 */
function initImageLightbox() {
  const images = document.querySelectorAll('.figure-img');
  if (!images.length) return;

  let overlay = document.getElementById('lightbox-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <img class="lightbox-img" src="" alt="">
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(overlay);
  }

  const lightboxImg = overlay.querySelector('.lightbox-img');
  const lightboxCaption = overlay.querySelector('.lightbox-caption');

  images.forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      const fig = img.closest('.figure-container, .chapter-figure');
      const cap = fig ? fig.querySelector('.figure-caption') : null;
      lightboxCaption.textContent = cap ? cap.textContent.trim() : (img.alt || '');
      overlay.classList.add('open');
    });
  });

  overlay.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
}

/**
 * Intuitive Keyboard Shortcuts
 */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      document.body.classList.remove('drawer-open');
      const lightbox = document.getElementById('lightbox-overlay');
      if (lightbox) lightbox.classList.remove('open');
    } else if ((e.key === 't' || e.key === 'T' || e.key === 'τ' || e.key === 'Τ' || e.code === 'KeyT') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (window.toggleBookDrawer) {
        window.toggleBookDrawer();
      }
    } else if ((e.key === 'd' || e.key === 'D' || e.key === 'δ' || e.key === 'Δ' || e.code === 'KeyD') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (window.cycleBookTheme) {
        window.cycleBookTheme();
      }
    } else if ((e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (window.adjustBookFontSize) {
        window.adjustBookFontSize(1);
      }
    } else if ((e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (window.adjustBookFontSize) {
        window.adjustBookFontSize(-1);
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
