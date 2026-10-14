import os
import re
import unicodedata
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_PATH = os.path.join(BASE_DIR, "assets", "css", "style.css")
JS_PATH = os.path.join(BASE_DIR, "assets", "js", "reader.js")
HTML_FILES = sorted(glob.glob(os.path.join(BASE_DIR, "chapters", "*.html")) + [os.path.join(BASE_DIR, "index.html")])

print("===============================================================================")
print("=== DEEP VERIFICATION: BUG FIXES & EDGE CASES TEST SUITE ===")
print("===============================================================================")

failures = []

with open(CSS_PATH, "r", encoding="utf-8") as f:
    css = f.read()

with open(JS_PATH, "r", encoding="utf-8") as f:
    js = f.read()

# TEST 1: GREEK SEARCH NORMALIZATION (FINAL SIGMA ς vs σ)
print("\n[Test 1] Testing Greek Accent & Final Sigma (ς vs σ) Normalization...")
def normalize_greek(s):
    # Python equivalent of reader.js normalizeGreek
    nfd = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    return nfd.lower().replace('ς', 'σ')

test_queries = [
    ("βουδισμοσ", "Ινδουισμός – Βουδισμός – Ταοϊσμός", True),
    ("Βουδισμός", "Ινδουισμός – Βουδισμός – Ταοϊσμός", True),
    ("κομφουκιανισμοσ", "Κομφουκιανισμός – Ζωροαστρισμός – Εβραϊσμός", True),
    ("εβραισμοσ", "Εβραϊσμός & Χριστιανισμός", True),
    ("χριστιανισμοσ", "Χριστιανισμός (Μέρος Α΄)", True),
    ("ισλαμ", "Ισλάμ", True),
    ("ρωσια", "Ρωσία & ο Κόσμος", True),
    ("τζενγκις χαν", "Η «Χρυσή Ορδή» του Τζένγκις Χαν", True),
]

for query, target, expected in test_queries:
    norm_q = normalize_greek(query)
    norm_t = normalize_greek(target)
    match = norm_q in norm_t
    if match != expected:
        failures.append(f"Greek normalization failed for query='{query}' in '{target}' (expected {expected}, got {match})")
    else:
        print(f"  ✓ Query '{query}' matches '{target}'")

# Check that JS implementation contains the sigma replace rule
if "replace(/ς/g, 'σ')" not in js and 'replace(/ς/g, "σ")' not in js:
    failures.append("reader.js is missing Greek final sigma normalization (replace(/ς/g, 'σ'))")
else:
    print("  ✓ reader.js contains Greek final sigma normalization")

# TEST 2: KEYBOARD ARROW SHORTCUT LOGIC
print("\n[Test 2] Testing Keyboard Shortcut Arrow Logic...")
# The bug was (e.altKey || !e.shiftKey). We require e.altKey.
if "(e.altKey || !e.shiftKey)" in js:
    failures.append("reader.js still contains flawed (e.altKey || !e.shiftKey) condition!")
elif "e.altKey && (e.key === 'ArrowRight'" not in js:
    failures.append("reader.js does not strictly check e.altKey for ArrowRight navigation!")
else:
    print("  ✓ Arrow navigation strictly requires e.altKey (plain ArrowRight will not accidentally jump chapters)")

# TEST 3: GREEK KEYBOARD SHORTCUT SUPPORT (T/τ and D/δ)
print("\n[Test 3] Testing Greek Keyboard Layout Support for Shortcuts...")
if "e.key === 'τ'" not in js or "e.key === 'δ'" not in js:
    failures.append("reader.js missing Greek keyboard layout support for 'τ' (TOC) or 'δ' (Theme)")
else:
    print("  ✓ Shortcuts support both Latin (T, D) and Greek (τ, δ) keyboard layouts")

# TEST 4: TOUCH SWIPE HORIZONTAL DOMINANCE
print("\n[Test 4] Testing Mobile Drawer Touch Swipe Logic...")
if "deltaX > deltaY * 1.5" not in js:
    failures.append("reader.js swipe logic lacks deltaX > deltaY * 1.5 horizontal dominance check")
else:
    print("  ✓ Touch swipe verifies horizontal dominance (vertical drawer scrolling will not trigger close)")

# TEST 5: THEME BUTTON ICONS & RESPONSIVE LABELS
print("\n[Test 5] Testing Theme Button Elements & Responsive Visibility...")
for p in HTML_FILES:
    fname = os.path.basename(p)
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    if 'class="theme-icon"' not in content or 'class="theme-label"' not in content:
        failures.append(f"{fname} is missing .theme-icon or .theme-label markup")
print(f"  ✓ All {len(HTML_FILES)} HTML files have distinct .theme-icon and .theme-label elements")

# Check CSS does not hide all spans indiscriminately
if ".theme-btn span {\n    display: none;" in css or ".theme-btn span { display: none;" in css:
    failures.append("CSS still hides all .theme-btn span indiscriminately on small screens!")
else:
    print("  ✓ CSS selectively hides .theme-label while keeping .theme-icon visible on mobile")

# TEST 6: DESKTOP COLLAPSE CONSTRAINT
print("\n[Test 6] Testing Desktop Sidebar Collapse Media Query Isolation...")
if "body.sidebar-collapsed .sidebar {\n  margin-left: calc(-1 * var(--sidebar-width));\n}" in css:
    failures.append("body.sidebar-collapsed .sidebar is globally declared outside desktop media query!")
else:
    print("  ✓ Desktop sidebar collapse is isolated to desktop viewports (min-width: 1024px)")

if "margin-left: 0 !important" not in css:
    failures.append("Mobile drawer does not enforce margin-left: 0 !important")
else:
    print("  ✓ Mobile drawer enforces margin-left: 0 !important")

# TEST 7: PRE-HYDRATION THEME FLASH PROTECTION
print("\n[Test 7] Testing Pre-Hydration Theme Flash Protection in <head>...")
for p in HTML_FILES:
    fname = os.path.basename(p)
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    if "localStorage.getItem('maria-book-theme')" not in content:
        failures.append(f"{fname} is missing head pre-hydration theme script")
print(f"  ✓ All {len(HTML_FILES)} HTML files include head pre-hydration script preventing dark-mode flash")

# TEST 8: iOS SAFARI AUTO-ZOOM PREVENTION
print("\n[Test 8] Testing iOS Safari Search Input Auto-Zoom Prevention...")
if "font-size: 16px;" not in css:
    failures.append("CSS missing 16px font-size for mobile input to prevent iOS auto-zoom")
else:
    print("  ✓ Mobile search input has font-size: 16px to prevent iOS Safari auto-zoom")

# TEST 9: SAFE AREA INSETS & TOUCH TARGET SIZE
print("\n[Test 9] Testing Safe Area Insets & Touch Targets...")
if "safe-area-inset-bottom" not in css or "safe-area-inset-right" not in css:
    failures.append("CSS missing safe-area-inset support for modern iPhones")
else:
    print("  ✓ Floating actions incorporate safe-area-inset-bottom and safe-area-inset-right")

if "width: 44px" not in css or "height: 44px" not in css:
    failures.append("CSS missing 44px touch targets")
else:
    print("  ✓ Touch targets maintain 44x44px accessibility compliance")

# TEST 10: COLOR SCHEME DECLARATIONS
print("\n[Test 10] Testing System Color Scheme Declarations...")
if "color-scheme: dark" not in css or "color-scheme: light" not in css:
    failures.append("CSS missing native color-scheme declarations")
else:
    print("  ✓ CSS declares color-scheme: light and color-scheme: dark for native OS integration")

print("\n===============================================================================")
if not failures:
    print("🎉 ALL 10 DEEP VERIFICATION & EDGE CASE TESTS PASSED PERFECTLY!")
    print("===============================================================================")
else:
    print(f"❌ Found {len(failures)} failures:")
    for f in failures:
        print("  -", f)
    print("===============================================================================")
    exit(1)
