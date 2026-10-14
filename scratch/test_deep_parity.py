import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH_DIR = os.path.join(BASE_DIR, "chapters")

print("Checking deep parity and link integrity across all 21 chapters...")

errors = []

for i in range(1, 22):
    prefix = f"ch{i:02d}"
    md_path = os.path.join(CH_DIR, f"{prefix}.md")
    html_path = os.path.join(CH_DIR, f"{prefix}.html")
    
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # 1. Quotes count and YouTube links in MD vs HTML
    md_yt_links = re.findall(r'\[([^\]]+)\]\((https?://(?:www\.)?youtube\.com/watch\?[^\)]+)\)', md_content)
    html_yt_links = re.findall(r'href=["\'](https?://(?:www\.)?youtube\.com/watch\?[^"\']+)["\']', html_content)
    
    # Check quotes
    md_quotes = re.findall(r'>\s*💬\s*\*\*Η Ματιά της Μαρίας', md_content)
    html_quotes = re.findall(r'class="box-maria"', html_content)
    
    if len(md_quotes) != len(html_quotes):
        errors.append(f"Chapter {i}: Quote count mismatch! MD has {len(md_quotes)}, HTML has {len(html_quotes)}")
        
    # Check YouTube links count
    if len(md_yt_links) != len(html_yt_links):
        errors.append(f"Chapter {i}: YT links count mismatch! MD has {len(md_yt_links)}, HTML has {len(html_yt_links)}")
        
    # 2. Check Prev / Next navigation
    if i > 1:
        prev_target = f"ch{i-1:02d}.html"
        if prev_target not in html_content:
            errors.append(f"Chapter {i}: Missing or incorrect prev link to {prev_target}")
    if i < 21:
        next_target = f"ch{i+1:02d}.html"
        if next_target not in html_content:
            errors.append(f"Chapter {i}: Missing or incorrect next link to {next_target}")
            
    # 3. Check sidebar links
    for j in range(1, 22):
        if j == 1:
            # ch01 link could be ch01.html or ../index.html
            expected_ch01 = ["ch01.html", "index.html"]
            if not any(e in html_content for e in expected_ch01):
                errors.append(f"Chapter {i}: Sidebar missing link to Chapter 01")
        else:
            expected_target = f"ch{j:02d}.html"
            if expected_target not in html_content:
                errors.append(f"Chapter {i}: Sidebar missing link to {expected_target}")
                
    # 4. Check css and js links
    if "../assets/css/style.css" not in html_content:
        errors.append(f"Chapter {i}: Missing style.css link")
    if "../assets/js/reader.js" not in html_content:
        errors.append(f"Chapter {i}: Missing reader.js link")

    # 5. Check timeline parity in MD and HTML
    tl_md = "Χρονολογικ" in md_content
    tl_html = "timeline-card" in html_content
    if tl_md != tl_html or not tl_md:
        errors.append(f"Chapter {i}: Timeline parity mismatch (MD: {tl_md}, HTML: {tl_html})")

    # 6. Check that all images in HTML are strictly local and exist
    img_tags = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html_content)
    for src in img_tags:
        if src.startswith("http"):
            errors.append(f"Chapter {i}: Disallowed external web image '{src}'")
        elif src.startswith("../assets/images/"):
            img_fname = src.replace("../assets/images/", "")
            img_path = os.path.join(BASE_DIR, "assets", "images", img_fname)
            if not os.path.exists(img_path):
                errors.append(f"Chapter {i}: Missing local image file '{img_fname}'")
            elif os.path.getsize(img_path) == 0:
                errors.append(f"Chapter {i}: Zero-byte image file '{img_fname}'")
    # 7. Check numbered section count and verbatim titles parity
    heading_regex = r'^###\s+\d+\.' if i <= 4 else r'^##\s+\d+\.'
    md_sections = [re.sub(r'^#{2,3}\s+', '', line).strip() for line in md_content.splitlines() if re.match(heading_regex, line.strip())]
    raw_html_secs = re.findall(r'<h2[^>]*>(.*?)</h2>', html_content)
    html_sections = [re.sub(r'<[^>]+>', '', s).strip().replace('&amp;', '&') for s in raw_html_secs if re.match(r'^\d+\.', re.sub(r'<[^>]+>', '', s).strip())]

    if len(md_sections) != len(html_sections):
        errors.append(f"Chapter {i}: Section count mismatch! MD has {len(md_sections)}, HTML has {len(html_sections)}")
    elif md_sections != html_sections:
        for s_idx, (m_sec, h_sec) in enumerate(zip(md_sections, html_sections)):
            if m_sec != h_sec:
                errors.append(f"Chapter {i} Section {s_idx+1} title mismatch: MD='{m_sec}' vs HTML='{h_sec}'")

    # 8. Check synthesis section presence in both MD and HTML
    has_html_synth = ('class="synthesis-section"' in html_content or "class='synthesis-section'" in html_content)
    has_md_synth = bool(re.search(r'##\s+.*(Αναστοχασμός|Τέλος Κύκλου)', md_content) or re.search(r'###\s+.*(Αναστοχασμός|Τέλος Κύκλου)', md_content))
    if not has_html_synth:
        errors.append(f"Chapter {i}: Missing synthesis footer in HTML")
    if not has_md_synth:
        errors.append(f"Chapter {i}: Missing synthesis section in MD")

    # 9. Check that HTML has zero unrendered markdown syntax leaks (**bold**, broken strong tags)
    md_bolds_in_html = re.findall(r'\*\*[^\*\n]+\*\*', html_content)
    broken_tags = re.findall(r'(\*\*</?strong>|<strong>\*\*|\*\*</?em>|<em>\*\*)', html_content)
    if md_bolds_in_html:
        errors.append(f"Chapter {i}: Found {len(md_bolds_in_html)} unrendered markdown bold token(s) in HTML")
    if broken_tags:
        errors.append(f"Chapter {i}: Found {len(broken_tags)} broken markdown/HTML tag(s) in HTML")

if not errors:
    print("✅ All 21 chapters passed deep parity, verbatim titles, synthesis, quote sync, navigation, timeline, and image integrity checks!")
    sys.exit(0)
else:
    print(f"❌ Found {len(errors)} issues:")
    for err in errors:
        print(" - ", err)
    sys.exit(1)
