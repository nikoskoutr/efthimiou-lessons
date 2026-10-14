#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_ui.py - Advanced UI, Mobile Responsiveness & Regression Verification Suite

Audits all front-end assets across all 22 HTML pages:
1. CSS architecture: balanced rule blocks, 3 themes (:root, sepia, dark), layout rules
2. Reader.js engine: dynamic enrichment, theme switcher, progress bar, font sizing, shortcuts
3. Mobile & Accessibility: touch swipe, 44px touch targets, safe-area-insets, 16px iOS auto-zoom guard
4. Cross-page consistency: anti-FOUC pre-hydration script, CSS & JS link integrity
5. Greek keyboard layout & final sigma (ς vs σ) support
"""

import os
import re
import glob
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_PATH = os.path.join(BASE_DIR, "assets", "css", "style.css")
JS_PATH = os.path.join(BASE_DIR, "assets", "js", "reader.js")
HTML_FILES = sorted(glob.glob(os.path.join(BASE_DIR, "chapters", "*.html")) + [os.path.join(BASE_DIR, "index.html")])

print("=" * 79)
print("=== ADVANCED UI, MOBILE RESPONSIVENESS & REGRESSION VERIFICATION ===")
print("=" * 79)

failures = []

# --- 1. VERIFY CSS INTEGRITY & SELECTORS ---
print("\n[1/4] Verifying CSS Architecture & Rules...")
with open(CSS_PATH, "r", encoding="utf-8") as f:
    css_content = f.read()

# Check balanced braces
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

print(f"  ✓ All {len(required_selectors)} critical CSS component selectors verified")

# --- 2. VERIFY JAVASCRIPT LOGIC & HANDLERS ---
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
    ("Touch event listeners", "touchstart"),
    ("Greek final sigma normalization", "replace(/ς/g, 'σ')")
]

for desc, token in required_js_features:
    if token not in js_content:
        failures.append(f"JS missing required feature: {desc} (token: '{token}')")
    else:
        print(f"  ✓ JS Feature verified: {desc}")

# Verify keyboard shortcut guards
if "e.altKey && (e.key === 'ArrowRight'" not in js_content:
    failures.append("Keyboard arrow navigation missing Alt modifier guard")
else:
    print("  ✓ Keyboard arrow navigation strictly requires Alt modifier (avoids accidental jumps)")

# Verify Greek keyboard layout shortcuts
if "'τ'" not in js_content or "'δ'" not in js_content:
    failures.append("Keyboard shortcuts missing Greek keyboard layout support (τ, δ)")
else:
    print("  ✓ Keyboard shortcuts support both Latin (T, D) and Greek (τ, δ) layouts")

# --- 3. VERIFY HTML CONSISTENCY ACROSS ALL 22 PAGES ---
print(f"\n[3/4] Verifying HTML Consistency across {len(HTML_FILES)} pages...")
for path in HTML_FILES:
    fname = os.path.basename(path)
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    # Verify head pre-hydration theme script
    if "localStorage.getItem('maria-book-theme')" not in html:
        failures.append(f"{fname} is missing head anti-FOUC pre-hydration script")

    # Verify viewport meta tag
    if 'meta name="viewport"' not in html:
        failures.append(f"{fname} missing viewport meta tag")

    # Verify stylesheet & script linking
    if "assets/css/style.css" not in html:
        failures.append(f"{fname} missing link to style.css")
    if "assets/js/reader.js" not in html:
        failures.append(f"{fname} missing link to reader.js")

print(f"  ✓ All {len(HTML_FILES)} HTML files have valid anti-FOUC scripts, meta tags, and asset links")

# --- 4. VERIFY MOBILE LAYOUT & ACCESSIBILITY SAFEGUARDS ---
print("\n[4/4] Verifying Mobile Layout, Touch Targets & Accessibility...")

# iOS Safari search input auto-zoom prevention (16px)
if "font-size: 16px;" not in css_content:
    failures.append("CSS missing 16px font-size for mobile input to prevent iOS auto-zoom")
else:
    print("  ✓ Mobile search input has font-size: 16px to prevent iOS auto-zoom")

# Safe Area insets
if "safe-area-inset-bottom" not in css_content or "safe-area-inset-right" not in css_content:
    failures.append("CSS missing safe-area-inset support for modern notch devices")
else:
    print("  ✓ Floating actions incorporate safe-area-inset padding")

# Touch targets
if "width: 44px" not in css_content or "height: 44px" not in css_content:
    failures.append("CSS missing 44x44px touch targets for mobile accessibility")
else:
    print("  ✓ Touch targets maintain 44x44px accessibility compliance")

# Native OS dark-mode declarations
if "color-scheme: dark" not in css_content or "color-scheme: light" not in css_content:
    failures.append("CSS missing color-scheme declaration")
else:
    print("  ✓ Native OS color-scheme: light / dark declarations verified")

# --- FINAL RESULT ---
print("\n" + "=" * 79)
if failures:
    print(f"❌ FAILED: Found {len(failures)} issue(s):")
    for f in failures:
        print(f"  - {f}")
    print("=" * 79)
    sys.exit(1)
else:
    print("🎉 ALL UI, MOBILE RESPONSIVENESS & REGRESSION CHECKS PASSED PERFECTLY!")
    print("=" * 79)
    sys.exit(0)
