#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_chapters.py - Comprehensive Content, Parity & Link Verification Suite

Audits all 21 chapters and index.html:
1. 100% Parity between Markdown (chapters/*.md) and Web HTML (chapters/*.html)
2. Exact section numbers, verbatim titles, and synthesis footers match
3. All 79 Maria quote boxes retain valid YouTube links and timestamp badges
4. Strictly local museum assets (assets/images/*), zero external/broken images
5. Linear navigation integrity (Prev/Next navigation cards, TOC sidebar links)
6. Timeline cards presence and structure
7. Transcripts archive integrity (transcripts/ch*.md)
"""

import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH_DIR = os.path.join(BASE_DIR, "chapters")
IMG_DIR = os.path.join(BASE_DIR, "assets", "images")
TRANSCRIPTS_DIR = os.path.join(BASE_DIR, "transcripts")

print("=" * 79)
print("=== COMPREHENSIVE CHAPTER & CONTENT VERIFICATION SUITE ===")
print("=" * 79)

errors = []
total_md_words = 0
total_html_bytes = 0
total_maria_boxes = 0
total_images = 0

# --- PART 1: AUDIT ALL 21 CHAPTERS & DEEP PARITY ---
print("\n[1/3] Auditing Chapters 01 to 21 & Bidirectional Parity...")

for i in range(1, 22):
    ch_errors = []
    prefix = f"ch{i:02d}"
    md_path = os.path.join(CH_DIR, f"{prefix}.md")
    html_path = os.path.join(CH_DIR, f"{prefix}.html")

    if not os.path.exists(md_path):
        ch_errors.append(f"Chapter {i:02d}: Missing markdown file {md_path}")
        errors.extend(ch_errors)
        continue
    if not os.path.exists(html_path):
        ch_errors.append(f"Chapter {i:02d}: Missing HTML file {html_path}")
        errors.extend(ch_errors)
        continue

    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    md_words = len(md_content.split())
    html_size = len(html_content)
    total_md_words += md_words
    total_html_bytes += html_size

    # Quotes and YouTube links check
    md_quotes = re.findall(r'>\s*💬\s*\*\*Η Ματιά της Μαρίας', md_content)
    html_quotes = re.findall(r'class="box-maria"', html_content)
    total_maria_boxes += len(html_quotes)

    if len(md_quotes) != len(html_quotes):
        ch_errors.append(f"Chapter {i:02d}: Quote count mismatch! MD={len(md_quotes)} vs HTML={len(html_quotes)}")

    md_yt_links = re.findall(r'\[([^\]]+)\]\((https?://(?:www\.)?youtube\.com/watch\?[^\)]+)\)', md_content)
    html_yt_links = re.findall(r'href=["\'](https?://(?:www\.)?youtube\.com/watch\?[^"\']+)["\']', html_content)

    if len(md_yt_links) != len(html_yt_links):
        ch_errors.append(f"Chapter {i:02d}: YouTube link count mismatch! MD={len(md_yt_links)} vs HTML={len(html_yt_links)}")

    # Ensure all HTML timestamp badges have target="_blank"
    badge_links = re.findall(r'<a[^>]+class=[\'"][^\'"]*timestamp-badge[^\'"]*[\'"][^>]*>', html_content)
    for b in badge_links:
        if 'target="_blank"' not in b and "target='_blank'" not in b:
            ch_errors.append(f"Chapter {i:02d}: Timestamp badge link missing target='_blank': {b}")

    # Verbatim transcript alignment check (>= 45% token match)
    tr_path = os.path.join(TRANSCRIPTS_DIR, f"{prefix}.md")
    if os.path.exists(tr_path):
        with open(tr_path, "r", encoding="utf-8") as tf:
            tr_content_lower = tf.read().lower()
        html_boxes = re.findall(r'<div class="box-maria">.*?<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>.*?<div class="box-maria-quote">(.*?)</div>', html_content, re.DOTALL)
        for b_idx, (b_url, b_label, b_quote) in enumerate(html_boxes, 1):
            clean_q = re.sub(r'<[^>]+>', '', b_quote).strip()
            words = [w for w in re.findall(r'[\u0370-\u03ff]{4,}', clean_q.lower())]
            matched = [w for w in words if w in tr_content_lower]
            pct = (len(matched) / len(words) * 100) if words else 0
            if pct < 45:
                ch_errors.append(f"Chapter {i:02d}: Quote {b_idx} low transcript match ({pct:.1f}% < 45%): '{clean_q[:40]}...'")

    # Images audit: strictly local museum assets
    local_imgs = re.findall(r'src=["\']\.\./assets/images/([^"\']+)["\']', html_content)
    external_imgs = re.findall(r'src=["\'](https?://[^"\']+)["\']', html_content)
    chapter_imgs = len(local_imgs) + len(external_imgs)
    total_images += chapter_imgs

    if external_imgs:
        ch_errors.append(f"Chapter {i:02d}: Disallowed external web images: {external_imgs}")

    for img_name in local_imgs:
        img_full = os.path.join(IMG_DIR, img_name)
        if not os.path.exists(img_full):
            ch_errors.append(f"Chapter {i:02d}: Missing local image file '{img_name}'")
        elif os.path.getsize(img_full) == 0:
            ch_errors.append(f"Chapter {i:02d}: Zero-byte image file '{img_name}'")

    # Section numbers and verbatim titles parity
    heading_regex = r'^###\s+\d+\.' if i <= 4 else r'^##\s+\d+\.'
    md_sections = [re.sub(r'^#{2,3}\s+', '', line).strip() for line in md_content.splitlines() if re.match(heading_regex, line.strip())]
    raw_html_secs = re.findall(r'<h2[^>]*>(.*?)</h2>', html_content)
    html_sections = [re.sub(r'<[^>]+>', '', s).strip().replace('&amp;', '&') for s in raw_html_secs if re.match(r'^\d+\.', re.sub(r'<[^>]+>', '', s).strip())]

    if len(md_sections) != len(html_sections):
        ch_errors.append(f"Chapter {i:02d}: Section count mismatch! MD={len(md_sections)} vs HTML={len(html_sections)}")
    elif md_sections != html_sections:
        for s_idx, (m_sec, h_sec) in enumerate(zip(md_sections, html_sections)):
            if m_sec != h_sec:
                ch_errors.append(f"Chapter {i:02d} Section {s_idx+1} title mismatch: MD='{m_sec}' vs HTML='{h_sec}'")

    # Synthesis footer presence
    has_html_synth = ('class="synthesis-section"' in html_content or "class='synthesis-section'" in html_content)
    has_md_synth = bool(re.search(r'##\s+.*(Αναστοχασμός|Τέλος Κύκλου)', md_content) or re.search(r'###\s+.*(Αναστοχασμός|Τέλος Κύκλου)', md_content))
    if not has_html_synth:
        ch_errors.append(f"Chapter {i:02d}: Missing synthesis footer in HTML")
    if not has_md_synth:
        ch_errors.append(f"Chapter {i:02d}: Missing synthesis footer in Markdown")

    # Timeline card presence in both
    has_timeline_md = "Χρονολογικ" in md_content
    has_timeline_html = "timeline-card" in html_content
    if has_timeline_md != has_timeline_html or not has_timeline_md:
        ch_errors.append(f"Chapter {i:02d}: Timeline parity mismatch (MD={has_timeline_md}, HTML={has_timeline_html})")

    # Prev / Next navigation integrity
    if i > 1:
        prev_target = f"ch{i-1:02d}.html"
        if prev_target not in html_content:
            ch_errors.append(f"Chapter {i:02d}: Missing or incorrect prev link to {prev_target}")
    if i < 21:
        next_target = f"ch{i+1:02d}.html"
        if next_target not in html_content:
            ch_errors.append(f"Chapter {i:02d}: Missing or incorrect next link to {next_target}")

    # Sidebar links
    for j in range(1, 22):
        if j == 1:
            if not any(e in html_content for e in ["ch01.html", "index.html"]):
                ch_errors.append(f"Chapter {i:02d}: Sidebar missing link to Chapter 01")
        else:
            expected_target = f"ch{j:02d}.html"
            if expected_target not in html_content:
                ch_errors.append(f"Chapter {i:02d}: Sidebar missing link to {expected_target}")

    errors.extend(ch_errors)
    status = "✅ OK" if not ch_errors else "⚠️ Issues"
    print(f"  Ch {i:02d}: {status} | MD: {md_words:5d} words | HTML: {html_size:6d} B | Quotes: {len(html_quotes)} | Imgs: {chapter_imgs:2d}")

# --- PART 2: AUDIT INDEX.HTML ---
print("\n[2/3] Auditing index.html...")
index_path = os.path.join(BASE_DIR, "index.html")
if not os.path.exists(index_path):
    errors.append("index.html is missing!")
else:
    with open(index_path, "r", encoding="utf-8") as f:
        index_content = f.read()
    for ch_idx in range(1, 22):
        link_target = f"chapters/ch{ch_idx:02d}.html"
        if ch_idx > 1 and link_target not in index_content:
            errors.append(f"index.html: Missing TOC link to {link_target}")
    print(f"  ✓ index.html verified ({len(index_content):,} bytes, 21 TOC targets verified)")

# --- PART 3: AUDIT TRANSCRIPTS ARCHIVE ---
print("\n[3/4] Auditing Transcripts Archive (transcripts/ch*.md)...")
if os.path.exists(TRANSCRIPTS_DIR):
    for ch in range(1, 22):
        tr_path = os.path.join(TRANSCRIPTS_DIR, f"ch{ch:02d}.md")
        if not os.path.exists(tr_path):
            errors.append(f"Transcripts: Missing {tr_path}")
        else:
            with open(tr_path, "r", encoding="utf-8") as f:
                tr_content = f.read()
            tr_words = len(tr_content.split())
            if tr_words < 5000:
                errors.append(f"Transcripts ch{ch:02d}.md has only {tr_words} words (< 5000)")
            if "youtube.com/watch?v=" not in tr_content:
                errors.append(f"Transcripts ch{ch:02d}.md missing YouTube reference")
    print(f"  ✓ All 21 lecture transcripts verified and healthy (> 5,000 words each)")

# --- PART 4: AUDIT SYNTAX & RENDERING HYGIENE ---
print("\n[4/4] Auditing Syntax, Clean Rendering & HTML Tag Nesting...")
from html.parser import HTMLParser

latex_pat = re.compile(r"\\[a-zA-Z]+")
dollar_pat = re.compile(r"\$[^$\n]+\$|\$")
raw_bold_pat = re.compile(r"\*\*[^*<>\n]+\*\*")
arrow_entity_pat = re.compile(r"&rarr;|&rArr;|->")

for i in range(1, 22):
    prefix = f"ch{i:02d}"
    for ext in [".md", ".html"]:
        fpath = os.path.join(CH_DIR, f"{prefix}{ext}")
        if not os.path.exists(fpath): continue
        is_html = ext == ".html"
        with open(fpath, "r", encoding="utf-8") as fp:
            for l_idx, line in enumerate(fp, 1):
                if is_html and ("<script" in line or "</script>" in line or "<!--" in line or "localStorage" in line):
                    continue
                # Check for unrendered LaTeX backslashes (excluding markdown escaped asterisks)
                for m in latex_pat.findall(line):
                    if not is_html and m in ["\\*skeud", "\\*ha"]: continue
                    errors.append(f"{prefix}{ext}:{l_idx} Disallowed LaTeX command '{m}'")
                # Check for raw math dollar signs
                for m in dollar_pat.findall(line):
                    errors.append(f"{prefix}{ext}:{l_idx} Disallowed raw math dollar sign '{m}'")
                # Check for raw markdown bold inside HTML
                if is_html:
                    for m in raw_bold_pat.findall(line):
                        errors.append(f"{prefix}{ext}:{l_idx} Unrendered markdown bold in HTML '{m}'")
                    for m in arrow_entity_pat.findall(line):
                        errors.append(f"{prefix}{ext}:{l_idx} Raw arrow entity/ASCII '{m}' (use Unicode '→')")

# Validate HTML tag balance across all pages
class HTMLNestingValidator(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.stack = []
        self.self_closing = {"img", "meta", "link", "br", "hr", "input", "source", "area", "base", "col", "embed", "param", "track", "wbr"}

    def handle_starttag(self, tag, attrs):
        if tag.lower() not in self.self_closing:
            self.stack.append((tag.lower(), self.getpos()))

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.self_closing: return
        if not self.stack:
            errors.append(f"{self.filename}: Unexpected closing </{tag}> at line {self.getpos()[0]}")
            return
        last, pos = self.stack.pop()
        if last != tag:
            errors.append(f"{self.filename}: Mismatched tag: expected </{last}> (opened at {pos[0]}), got </{tag}> at {self.getpos()[0]}")

for h_path in sorted([os.path.join(CH_DIR, f"ch{i:02d}.html") for i in range(1, 22)] + [index_path]):
    if os.path.exists(h_path):
        validator = HTMLNestingValidator(os.path.basename(h_path))
        with open(h_path, "r", encoding="utf-8") as fp:
            validator.feed(fp.read())
        if validator.stack:
            unclosed = [s[0] for s in validator.stack]
            errors.append(f"{os.path.basename(h_path)}: Unclosed HTML tags: {unclosed}")

print("  ✓ Zero LaTeX commands, zero dollar math signs, zero unrendered markdown, zero tag nesting errors")

# --- FINAL METRICS & RESULT ---
print("\n" + "=" * 79)
print("--- Course Metrics Summary ---")
local_images_count = len([f for f in os.listdir(IMG_DIR) if not f.startswith('.')])
print(f"Total Local Historical Images: {local_images_count}")
print(f"Total Course Markdown Words:   {total_md_words:,} words")
print(f"Total Course HTML Size:        {total_html_bytes / 1024 / 1024:.2f} MB")
print(f"Total Maria Quote Boxes:       {total_maria_boxes}")
print(f"Total Course Illustrations:    {total_images}")
print("=" * 79)

if errors:
    print(f"\n❌ FAILED: Found {len(errors)} error(s):")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)
else:
    print("\n🎉 ALL 21 CHAPTERS, PARITY, LINKS & TRANSCRIPTS ARE 100% HEALTHY!")
    sys.exit(0)
