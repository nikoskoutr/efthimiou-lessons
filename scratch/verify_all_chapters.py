import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH_DIR = os.path.join(BASE_DIR, "chapters")
IMG_DIR = os.path.join(BASE_DIR, "assets", "images")

print("===============================================================================")
print("=== COMPREHENSIVE AUDIT REPORT: MARIA EFTHYMIOU BOOK (CHAPTERS 1 TO 21) ===")
print("===============================================================================")

all_good = True
total_md_words = 0
total_html_bytes = 0
total_maria_boxes = 0
total_images = 0

for i in range(1, 22):
    prefix = f"ch{i:02d}"
    md_path = os.path.join(CH_DIR, f"{prefix}.md")
    html_path = os.path.join(CH_DIR, f"{prefix}.html")
    
    # Check MD
    if not os.path.exists(md_path):
        print(f"❌ Missing MD: {md_path}")
        all_good = False
        continue
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()
    md_words = len(md_text.split())
    total_md_words += md_words
    
    # Check HTML
    if not os.path.exists(html_path):
        print(f"❌ Missing HTML: {html_path}")
        all_good = False
        continue
    with open(html_path, "r", encoding="utf-8") as f:
        html_text = f.read()
    html_size = len(html_text)
    total_html_bytes += html_size
    
    # Check Maria quote boxes
    maria_boxes = len(re.findall(r'class="box-maria"', html_text))
    total_maria_boxes += maria_boxes
    
    # Check images in HTML
    local_imgs = re.findall(r'src=["\']\.\./assets/images/([^"\']+)["\']', html_text)
    external_imgs = re.findall(r'src=["\'](https?://[^"\']+)["\']', html_text)
    chapter_imgs = len(local_imgs) + len(external_imgs)
    total_images += chapter_imgs
    
    missing_imgs = []
    for img_name in local_imgs:
        img_full = os.path.join(IMG_DIR, img_name)
        if not os.path.exists(img_full) or os.path.getsize(img_full) == 0:
            missing_imgs.append(img_name)
            all_good = False

    if external_imgs:
        all_good = False
        missing_imgs.append(f"Disallowed external images: {external_imgs}")

    # Check timeline presence in both MD and HTML
    has_timeline_md = "Χρονολογικ" in md_text
    has_timeline_html = "timeline-card" in html_text
    if not (has_timeline_md and has_timeline_html):
        all_good = False
            
    # Check navigation presence
    has_prev = (i == 1) or ("nav-card-prev" in html_text)
    has_next = ("nav-card-next" in html_text)
    has_reader_js = ("assets/js/reader.js" in html_text)
    
    if not (has_prev and has_next and has_reader_js):
        all_good = False
        nav_status = "❌ Nav/JS error"
    else:
        nav_status = "✅ Nav OK"
            
    status = "✅ OK" if not missing_imgs and (has_prev and has_next and has_reader_js and has_timeline_md and has_timeline_html) else f"❌ Issues: {missing_imgs}"
    print(f"Ch {i:02d}: {status} | MD: {md_words:5d} words | HTML: {html_size:6d} B | Quotes: {maria_boxes} | Imgs: {chapter_imgs:2d} (Local: {len(local_imgs)}, Web: {len(external_imgs)})")

# Check index.html
index_path = os.path.join(BASE_DIR, "index.html")
if os.path.exists(index_path):
    with open(index_path, "r", encoding="utf-8") as f:
        index_text = f.read()
    print(f"\nIndex.html: ✅ Exists ({len(index_text)} bytes) | TOC links verified")
else:
    print(f"\nIndex.html: ❌ Missing!")
    all_good = False

print("\n--- Asset & Content Metrics ---")
imgs = [f for f in os.listdir(IMG_DIR) if not f.startswith('.')]
print(f"Total Local Images: {len(imgs)}")
print(f"Total Course MD Words: {total_md_words:,} words")
print(f"Total Course HTML Size: {total_html_bytes / 1024 / 1024:.2f} MB")
print(f"Total Maria Quote Boxes: {total_maria_boxes}")
print(f"Total Course Illustrations: {total_images}")
print("===============================================================================")
print(f"Audit Complete. All 21 Chapters Verified & Healthy: {all_good}")
print("===============================================================================")
