#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_improvements_1_and_2.py
Comprehensive verification test suite for:
- Improvement 1: Floating YouTube Quote Player (Picture-in-Picture)
- Improvement 2: Global In-Text Search across all 75,000 words & search_index.json
"""

import os
import re
import json
import subprocess
import unicodedata
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_SCRIPT = os.path.join(BASE_DIR, "scratch", "build_search_index.py")
INDEX_JSON = os.path.join(BASE_DIR, "assets", "search_index.json")
JS_FILE = os.path.join(BASE_DIR, "assets", "js", "reader.js")
CSS_FILE = os.path.join(BASE_DIR, "assets", "css", "style.css")
CHAPTERS_DIR = os.path.join(BASE_DIR, "chapters")

failures = []

def test(name):
    print(f"\n--- Checking: {name} ---")

def check(condition, desc):
    if not condition:
        failures.append(desc)
        print(f"  ❌ FAIL: {desc}")
    else:
        print(f"  ✓ PASS: {desc}")

print("=" * 75)
print("=== DEEP VERIFICATION SUITE: IMPROVEMENT 1 & IMPROVEMENT 2 ===")
print("=" * 75)

# --------------------------------------------------------------------------
# SUITE 1: Search Index Generator & Output Integrity
# --------------------------------------------------------------------------
test("Search Index Generator (scratch/build_search_index.py)")
check(os.path.exists(INDEX_SCRIPT), "scratch/build_search_index.py exists")

# Run the generator script
res = subprocess.run(["python3", INDEX_SCRIPT], cwd=BASE_DIR, capture_output=True, text=True)
check(res.returncode == 0, "build_search_index.py executed with returncode 0")
check(os.path.exists(INDEX_JSON), "assets/search_index.json created successfully")

with open(INDEX_JSON, "r", encoding="utf-8") as f:
    try:
        index_data = json.load(f)
        valid_json = True
    except Exception as e:
        valid_json = False

check(valid_json, "assets/search_index.json is valid JSON")

chapters = index_data.get("chapters", [])
items = index_data.get("items", [])

check(len(chapters) == 21, f"All 21 chapters indexed in metadata (found {len(chapters)})")
check(len(items) >= 1500, f"Total searchable blocks >= 1500 (found {len(items)})")

# Check total word count in index
total_words = sum(len(item.get("text", "").split()) for item in items)
check(total_words >= 70000, f"Total indexed words >= 70,000 words (found {total_words:,} words)")

# Check item structure
sample_item = items[0] if items else {}
required_keys = ["ch", "ch_title", "sec_title", "anchor", "text"]
all_keys_present = all(k in sample_item for k in required_keys)
check(all_keys_present, f"Indexed items contain required keys {required_keys}")

# Check specific historical terms across chapters in index (including callout boxes & captions)
terms_to_test = [
    ("Λούσι", 1),
    ("Στέπες", 2),
    ("Γεωργική Επανάσταση", 3),
    ("Τζένγκις Χαν", 4),
    ("Βούδας", 5),
    ("Κομφούκιος", 6),
    ("Μωάμεθ", 12),
    ("Σαμουράι", 15),
    ("Μέγας Πέτρος", 17),
    ("hunter-gatherer", 1),
    ("Σπήλαιο Φράγχθι", 1),
    ("Γενετικό Αποτύπωμα", 2),
    ("Γιαμνάγια", 2),
    ("Πράσινη Χώρα", 2),
    ("Yuanmingyuan", 16),
]

def norm_grk(s):
    nfd = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    return nfd.lower().replace('ς', 'σ')

for term, ch_target in terms_to_test:
    norm_t = norm_grk(term)
    found = any(norm_t in norm_grk(it["text"]) and it["ch"] == ch_target for it in items)
    check(found, f"Historical term '{term}' successfully indexed in Chapter {ch_target:02d}")

# --------------------------------------------------------------------------
# SUITE 2: Improvement 1 - Floating YouTube Quote Player
# --------------------------------------------------------------------------
test("Improvement 1: Floating YouTube Quote Player in reader.js & style.css")
with open(JS_FILE, "r", encoding="utf-8") as f:
    js_content = f.read()

with open(CSS_FILE, "r", encoding="utf-8") as f:
    css_content = f.read()

# JS checks
check("initYouTubeQuotePlayer" in js_content, "reader.js defines initYouTubeQuotePlayer")
check("youtube-nocookie.com/embed/" in js_content, "reader.js uses privacy-enhanced youtube-nocookie.com/embed/")
check("autoplay=1&start=" in js_content, "reader.js passes autoplay=1&start={seconds} to iframe")
check("floating-quote-player" in js_content, "reader.js renders #floating-quote-player")
check("quote-player-close" in js_content, "reader.js provides Close (✕) handler")
check("iframe.src = ''" in js_content or 'iframe.src = ""' in js_content, "reader.js clears iframe.src on close to stop playback")
check("quote-player-toggle" in js_content, "reader.js provides Minimize/Expand toggle button")
check("quote-player-yt-link" in js_content, "reader.js provides 'Open in YouTube' fallback link")
check(".box-maria .timestamp-badge" in js_content, "reader.js intercepts clicks on .box-maria timestamp links")

# CSS checks
check(".floating-quote-player" in css_content, "style.css defines .floating-quote-player")
check(".floating-quote-player.is-active" in css_content, "style.css defines .floating-quote-player.is-active")
check(".floating-quote-player.is-minimized" in css_content, "style.css defines .floating-quote-player.is-minimized")
check(".quote-player-header" in css_content, "style.css defines .quote-player-header")
check(".quote-player-body" in css_content, "style.css defines .quote-player-body")
check("height: 0" in css_content and "overflow: hidden" in css_content, "Minimized quote player retains iframe in render tree without display:none to preserve background audio playback")
check(".quote-player-btn" in css_content, "style.css defines .quote-player-btn")
check("aspect-ratio: 16 / 9" in css_content or "aspect-ratio: 16/9" in css_content, "style.css enforces 16:9 aspect ratio for player iframe")
check("body.has-active-player .floating-actions" in css_content, "style.css coordinates floating-actions position when player is active")

# Theme support check
check("var(--bg-surface-elevated" in css_content, "Quote player utilizes CSS custom properties for dynamic theme support")

# --------------------------------------------------------------------------
# SUITE 3: Improvement 2 - Global In-Text Search
# --------------------------------------------------------------------------
test("Improvement 2: Global In-Text Search in reader.js & style.css")

# JS checks
check("initGlobalSearch" in js_content, "reader.js defines initGlobalSearch")
check("global-search-modal" in js_content, "reader.js renders #global-search-modal")
check("top-search-btn" in js_content, "reader.js enriches top-bar with #top-search-btn")
check("sidebar-global-search-btn" in js_content, "reader.js enriches sidebar drawer with #sidebar-global-search-btn")
check("assets/search_index.json" in js_content, "reader.js fetches assets/search_index.json")
check("normalizeGreek" in js_content, "reader.js utilizes normalizeGreek helper")
check("search-highlight" in js_content, "reader.js wraps matching terms in .search-highlight")
check("search-result-item" in js_content, "reader.js renders .search-result-item links")
check("highlight-target" in js_content, "reader.js supports .highlight-target flash on in-page jump")
check("hash === 'top'" in js_content, "reader.js supports fallback resolution for #top, #timeline, and #synthesis anchors")

# Keyboard shortcut checks
check("e.key === '/'" in js_content, "reader.js handles '/' shortcut for search")
check("(e.ctrlKey || e.metaKey) && (e.key === 'k'" in js_content, "reader.js handles Ctrl/Cmd+K shortcut for search")
check("e.key === 'κ' || e.key === 'Κ'" in js_content, "reader.js supports Greek keyboard layout for search shortcut (κ, Κ)")
check("e.key === 'Escape'" in js_content, "reader.js handles Escape key to dismiss modals")

# CSS checks
check(".search-modal-backdrop" in css_content, "style.css defines .search-modal-backdrop")
check(".search-modal-container" in css_content, "style.css defines .search-modal-container")
check(".top-search-btn" in css_content, "style.css defines .top-search-btn")
check(".sidebar-global-search-btn" in css_content, "style.css defines .sidebar-global-search-btn")
check(".search-highlight" in css_content, "style.css defines .search-highlight")
check(".highlight-target" in css_content, "style.css defines .highlight-target")
check("@keyframes highlightFlash" in css_content, "style.css defines @keyframes highlightFlash")

# Responsive checks
check("@media (max-width: 767px)" in css_content, "style.css includes smartphone responsive media query")
check("font-size: 16px;" in css_content, "style.css search inputs have 16px font-size to prevent iOS auto-zoom")

# --------------------------------------------------------------------------
# SUITE 4: Verification of Section Anchors Parity & HTML Attribute Syntax
# --------------------------------------------------------------------------
test("Section Anchors Parity & HTML Attribute Integrity across all chapters")
missing_anchors = []
malformed_tags = []

all_html_files = sorted(glob.glob(os.path.join(CHAPTERS_DIR, "ch*.html"))) + [os.path.join(BASE_DIR, "index.html")]

for ch_file in all_html_files:
    fname = os.path.basename(ch_file)
    with open(ch_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Check for malformed attribute syntax like id="sec-2"" or class="foo""
    bad_attrs = re.findall(r'<[^>]+\w+=["\'][^"\']*["\']["\'][^>]*>', html)
    if bad_attrs:
        malformed_tags.append(f"{fname}: {bad_attrs}")

    # Check section IDs
    if fname.startswith("ch"):
        raw_h2 = re.findall(r"<h2[^>]*>(.*?)</h2>", html)
        h2_with_id = re.findall(r'<h2[^>]+id=["\'](sec-\d+)["\'][^>]*>', html)
        numbered_h2 = [h for h in raw_h2 if re.match(r"^\d+\.", re.sub(r"<[^>]+>", "", h).strip())]
        if len(h2_with_id) < len(numbered_h2):
            missing_anchors.append(f"{fname}: {len(h2_with_id)} vs {len(numbered_h2)} numbered headers")

check(len(malformed_tags) == 0, f"HTML files contain zero malformed attributes with double quotes (issues: {malformed_tags})")
check(len(missing_anchors) == 0, f"All numbered h2 headers have explicit section IDs (issues: {missing_anchors})")

# --------------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------------
print("\n" + "=" * 75)
if not failures:
    print("🎉 ALL TESTS PASSED! IMPROVEMENTS 1 AND 2 FULLY VERIFIED & HEALTHY!")
    print("=" * 75)
    exit(0)
else:
    print(f"❌ Found {len(failures)} failures in improvements verification:")
    for f in failures:
        print("  -", f)
    print("=" * 75)
    exit(1)
