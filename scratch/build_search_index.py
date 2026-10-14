#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_search_index.py
Compiles all 21 chapters of Maria Efthymiou's lecture series into a lightweight,
static assets/search_index.json for fast client-side full-text search.

Outputs:
- assets/search_index.json: containing chapter numbers, titles, section anchors,
  and searchable text blocks across all ~75,000 words.
"""

import os
import re
import json
import html

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAPTERS_DIR = os.path.join(BASE_DIR, "chapters")
OUTPUT_FILE = os.path.join(BASE_DIR, "assets", "search_index.json")


def clean_text(raw_html: str) -> str:
    """Removes HTML tags and unescapes entities, normalizing whitespace."""
    if not raw_html:
        return ""
    text = re.sub(r"<[^>]+>", " ", raw_html)
    text = html.unescape(text)
    return " ".join(text.split())


def build_index():
    print("=" * 70)
    print("Building Global Search Index for Maria Efthymiou Book Reader...")
    print("=" * 70)

    chapters_meta = []
    items = []
    total_words = 0

    for ch_num in range(1, 22):
        html_file = os.path.join(CHAPTERS_DIR, f"ch{ch_num:02d}.html")
        if not os.path.exists(html_file):
            print(f"⚠️ Chapter {ch_num:02d} file not found: {html_file}")
            continue

        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Chapter Title
        t_m = re.search(r"<h1 class=\"chapter-title\">(.*?)</h1>", content)
        ch_title = clean_text(t_m.group(1)) if t_m else f"Κεφάλαιο {ch_num}"

        # Chapter Subtitle
        sub_m = re.search(r"<p class=\"chapter-subtitle\">(.*?)</p>", content)
        ch_subtitle = clean_text(sub_m.group(1)) if sub_m else ""

        chapters_meta.append({
            "id": ch_num,
            "num": f"{ch_num:02d}",
            "title": ch_title,
            "subtitle": ch_subtitle,
            "file": f"ch{ch_num:02d}.html"
        })

        if ch_subtitle:
            items.append({
                "ch": ch_num,
                "ch_title": ch_title,
                "sec_title": "Εισαγωγή & Υπότιτλος",
                "anchor": "top",
                "text": ch_subtitle
            })
            total_words += len(ch_subtitle.split())

        # 1. Timeline Nodes
        tl_m = re.search(r"<section class=\"timeline-card\">([\s\S]*?)</section>", content)
        if tl_m:
            tl_html = tl_m.group(1)
            # Find each timeline node
            nodes = re.findall(r"<div class=\"timeline-node\">([\s\S]*?)</div>\s*</div>", tl_html)
            if not nodes:
                nodes = re.findall(r"<div class=\"timeline-node\">([\s\S]*?)</div>", tl_html)
            for n in nodes:
                node_text = clean_text(n)
                if len(node_text) > 10:
                    items.append({
                        "ch": ch_num,
                        "ch_title": ch_title,
                        "sec_title": "Χρονολογικό Ανάπτυγμα",
                        "anchor": "timeline",
                        "text": node_text
                    })
                    total_words += len(node_text.split())

        # 2. Main Content Sections
        main_m = re.search(r"<main[^>]*>([\s\S]*?)</main>", content)
        main_html = main_m.group(1) if main_m else content

        # Exclude timeline card and chapter nav from section parsing
        main_html = re.sub(r"<section class=\"timeline-card\">[\s\S]*?</section>", "", main_html)
        main_html = re.sub(r"<nav class=\"chapter-navigation\">[\s\S]*?</nav>", "", main_html)

        # Split into sections by <h2> tags
        sections = re.split(r"(<h2[^>]*>[\s\S]*?</h2>)", main_html)

        for s_idx in range(1, len(sections), 2):
            h2_tag = sections[s_idx]
            sec_body = sections[s_idx + 1] if s_idx + 1 < len(sections) else ""

            sec_title = clean_text(h2_tag)
            num_match = re.match(r"^(\d+)\.", sec_title)
            if num_match:
                sec_num = int(num_match.group(1))
                anchor = f"sec-{sec_num}"
            else:
                anchor = f"sec-{(s_idx // 2) + 1}"

            # Strip synthesis if embedded in last section body
            if "synthesis-section" in sec_body:
                sec_body = re.sub(r"<(?:footer|section) class=\"synthesis-section\"[\s\S]*?</(?:footer|section)>", "", sec_body)

            # Extract callout blocks and content elements in natural sequential reading order
            boxes = {}
            box_counter = 0

            def store_box(prefix, text):
                nonlocal box_counter
                box_counter += 1
                key = f"__BLOCK_{prefix}_{box_counter}__"
                boxes[key] = text
                return key

            # Replace structured multi-element containers with tokens
            temp_sec_body = sec_body
            temp_sec_body = re.sub(r'<div class="box-history"[\s\S]*?</div>\s*</div>', lambda m: store_box("HIST", clean_text(m.group(0))), temp_sec_body)
            temp_sec_body = re.sub(r'<div class="box-etymology"[\s\S]*?</div>\s*</div>', lambda m: store_box("ETYM", clean_text(m.group(0))), temp_sec_body)
            temp_sec_body = re.sub(r'<div class="did-you-know"[\s\S]*?</div>(?:\s*</div>)?', lambda m: store_box("DYK", clean_text(m.group(0))), temp_sec_body)

            def repl_maria(m):
                q_m = re.search(r'<div class="box-maria-quote"[\s\S]*?</div>', m.group(0))
                t = clean_text(q_m.group(0)) if q_m else clean_text(m.group(0))
                return store_box("MARIA", t)
            temp_sec_body = re.sub(r'<div class="box-maria"[\s\S]*?</div>\s*</div>', repl_maria, temp_sec_body)

            def repl_fig(m):
                c_m = re.search(r'<div class="figure-caption"[\s\S]*?</div>', m.group(0))
                t = clean_text(c_m.group(0)) if c_m else ""
                return store_box("FIG", t) if t else ""
            temp_sec_body = re.sub(r'<div class="figure-container"[\s\S]*?</div>\s*</div>', repl_fig, temp_sec_body)

            # Match tokens and core text blocks sequentially
            block_pattern = r'(__BLOCK_[A-Z]+_\d+__|<(?:p|li|tr)[^>]*>[\s\S]*?</(?:p|li|tr)>)'
            raw_blocks = re.findall(block_pattern, temp_sec_body)

            if not raw_blocks:
                cleaned = clean_text(sec_body)
                if len(cleaned) > 20:
                    items.append({
                        "ch": ch_num,
                        "ch_title": ch_title,
                        "sec_title": sec_title,
                        "anchor": anchor,
                        "text": cleaned
                    })
                    total_words += len(cleaned.split())
            else:
                for b in raw_blocks:
                    cleaned = boxes.get(b, "") if b.startswith("__BLOCK_") else clean_text(b)
                    if len(cleaned) > 15:
                        items.append({
                            "ch": ch_num,
                            "ch_title": ch_title,
                            "sec_title": sec_title,
                            "anchor": anchor,
                            "text": cleaned
                        })
                        total_words += len(cleaned.split())

        # 3. Synthesis / Closing Reflection
        syn_m = re.search(r"class=[\"']synthesis-section[\"'][\s\S]*?</(?:section|footer)>", content)
        if syn_m:
            syn_html = syn_m.group(0)
            st_m = re.search(r"<h[23][^>]*>(.*?)</h[23]>", syn_html)
            syn_title = clean_text(st_m.group(1)) if st_m else "Αναστοχασμός"
            syn_paragraphs = re.findall(r"<p[^>]*>([\s\S]*?)</p>", syn_html)
            for p in syn_paragraphs:
                p_text = clean_text(p)
                if len(p_text) > 15:
                    items.append({
                        "ch": ch_num,
                        "ch_title": ch_title,
                        "sec_title": syn_title,
                        "anchor": "synthesis",
                        "text": p_text
                    })
                    total_words += len(p_text.split())

    output_data = {
        "chapters": chapters_meta,
        "items": items
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=None, separators=(',', ':'))

    file_size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"✅ Generated {OUTPUT_FILE}")
    print(f"📊 Total Chapters Indexed: {len(chapters_meta)}")
    print(f"📚 Total Searchable Blocks: {len(items)}")
    print(f"📝 Total Words in Index: {total_words:,}")
    print(f"💾 File Size: {file_size_kb:.1f} KB")
    print("=" * 70)


if __name__ == "__main__":
    build_index()
