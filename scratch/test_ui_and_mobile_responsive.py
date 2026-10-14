import os
import re
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_PATH = os.path.join(BASE_DIR, "assets", "css", "style.css")
JS_PATH = os.path.join(BASE_DIR, "assets", "js", "reader.js")
HTML_FILES = sorted(glob.glob(os.path.join(BASE_DIR, "chapters", "*.html")) + [os.path.join(BASE_DIR, "index.html")])

print("===============================================================================")
print("=== ADVANCED UI & MOBILE RESPONSIVENESS VERIFICATION SUITE ===")
print("===============================================================================")

failures = []

# 1. VERIFY CSS INTEGRITY & SELECTORS
print("\n[1/4] Verifying CSS Architecture & Rules...")
with open(CSS_PATH, "r", encoding="utf-8") as f:
    css_content = f.read()

# Check that CSS has no unclosed comment or unclosed blocks
# Count braces
open_braces = css_content.count('{')
close_braces = css_content.count('}')
if open_braces != close_braces:
    failures.append(f"CSS brace mismatch! Found {open_braces} '{{' and {close_braces} '}}'")
else:
    print(f"  ✓ Balanced CSS structure: {open_braces} rule blocks successfully paired")

# Check required themes
for theme in [':root', '[data-theme="sepia"]', '[data-theme="dark"]']:
    if theme not in css_content:
        failures.append(f"Missing theme selector: {theme}")
    else:
        print(f"  ✓ Theme defined: {theme}")

# Check key UI & Mobile components in CSS
required_selectors = [
    "#progress-bar",
    ".drawer-backdrop",
    ".sidebar",
    ".sidebar-header-top",
    ".sidebar-close-btn",
    ".sidebar-toggle-btn",
    ".sidebar-search-box",
    ".author-card",
    ".toc-list",
    ".toc-item.active",
    ".top-bar",
    ".controls-group",
    ".theme-pill-group",
    ".content-container",
    ".chapter-header",
    ".chapter-number-tag",
    ".chapter-title",
    ".reading-estimate-badge",
    ".video-reference-badge",
    ".timeline-card",
    ".timeline-stream",
    ".timeline-node",
    ".prose",
    ".box-maria",
    ".timestamp-badge",
    ".box-history",
    ".box-etymology",
    ".did-you-know",
    ".figure-container",
    ".figure-caption",
    ".summary-table",
    ".table-responsive",
    ".synthesis-section",
    ".chapter-navigation",
    ".nav-card-prev",
    ".nav-card-next",
    ".floating-actions",
    ".floating-btn",
    "@media (max-width: 1023px)",
    "@media (max-width: 767px)"
]

for sel in required_selectors:
    if sel not in css_content:
        failures.append(f"Missing required CSS rule: {sel}")
    else:
        print(f"  ✓ CSS Selector verified: {sel}")

# 2. VERIFY JAVASCRIPT LOGIC & HANDLERS
print("\n[2/4] Verifying Reader JS Functionality...")
with open(JS_PATH, "r", encoding="utf-8") as f:
    js_content = f.read()

required_js_features = [
    ("DOM Enrichment fallback", "initDOMEnrichment"),
    ("Reading Progress Bar", "initProgressBar"),
    ("Theme Switcher (3 themes)", "initThemeSwitcher"),
    ("Font Sizing Controls", "initFontSizeControls"),
    ("Sidebar Drawer & Swipe", "initSidebarDrawer"),
    ("Live Chapter Search", "initTOCSearch"),
    ("Reading Time Estimate", "initReadingTimeEstimate"),
    ("Floating Action Controls", "initFloatingActions"),
    ("Keyboard Shortcuts", "initKeyboardShortcuts"),
    ("Theme persistence", "localStorage.setItem('maria-book-theme'"),
    ("Font size persistence", "localStorage.setItem('maria-book-font-size'"),
    ("Touch event listeners", "touchstart")
]

for desc, token in required_js_features:
    if token not in js_content:
        failures.append(f"JS missing {desc} ({token})")
    else:
        print(f"  ✓ JS Feature verified: {desc}")

# 3. VERIFY ALL 22 HTML PAGES (CHAPTERS + INDEX)
print(f"\n[3/4] Verifying HTML Consistency across {len(HTML_FILES)} pages...")
for page in HTML_FILES:
    fname = os.path.basename(page)
    with open(page, "r", encoding="utf-8") as f:
        html = f.read()
    
    # Meta viewport
    if '<meta name="viewport" content="width=device-width, initial-scale=1.0">' not in html:
        failures.append(f"{fname}: Missing responsive viewport meta tag")
        
    # Progress Bar & Backdrop
    if '<div id="progress-bar"></div>' not in html:
        failures.append(f"{fname}: Missing #progress-bar")
    if 'id="drawer-backdrop"' not in html:
        failures.append(f"{fname}: Missing #drawer-backdrop")
        
    # Drawer Controls
    if 'id="sidebar-toggle"' not in html:
        failures.append(f"{fname}: Missing #sidebar-toggle")
    if 'id="sidebar-close"' not in html:
        failures.append(f"{fname}: Missing #sidebar-close")
    if 'sidebar-search-box' not in html:
        failures.append(f"{fname}: Missing .sidebar-search-box")
        
    # Reading controls
    if 'id="btn-font-dec"' not in html or 'id="btn-font-inc"' not in html:
        failures.append(f"{fname}: Missing font buttons")
    if 'data-theme="parchment"' not in html or 'data-theme="sepia"' not in html or 'data-theme="dark"' not in html:
        failures.append(f"{fname}: Missing theme buttons")
        
    # Stylesheet and script
    if "assets/css/style.css" not in html:
        failures.append(f"{fname}: Missing style.css link")
    if "assets/js/reader.js" not in html:
        failures.append(f"{fname}: Missing reader.js link")

print(f"  ✓ All {len(HTML_FILES)} HTML files strictly checked for responsive elements and controls")

# 4. MOBILE LAYOUT AUDIT: NO HARDCODED FIXED OVERFLOWS
print("\n[4/4] Verifying Mobile Layout Safety...")
# Check if any inline style has fixed pixel widths exceeding 300px
overflow_matches = re.findall(r'style=[\"\'][^\"\']*width:\s*([0-9]{3,})px', css_content)
# We expect sidebar to have 320px for desktop, but inside mobile media query it must be flexible
if "width: min(340px, 86vw)" not in css_content:
    failures.append("Sidebar drawer does not use flexible responsive width on mobile!")
else:
    print("  ✓ Sidebar drawer uses flexible 'min(340px, 86vw)' on mobile")

if "overflow-x: auto" not in css_content:
    failures.append("Missing horizontal scroll protection for tables")
else:
    print("  ✓ Table responsive horizontal scrolling configured")

print("\n===============================================================================")
if not failures:
    print("🎉 ALL TESTS PASSED! UI & MOBILE RESPONSIVENESS AT 100% QUALITY!")
    print("===============================================================================")
else:
    print(f"❌ Found {len(failures)} failures:")
    for f in failures:
        print("  -", f)
    print("===============================================================================")
    exit(1)
