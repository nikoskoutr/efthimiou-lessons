#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_transcripts.py

Processes all 21 lecture subtitle files for Maria Efthymiou's lecture series:
"19 Μικρά Μαθήματα για έναν Μεγάλο Κόσμο" (Megaron Plus & BLOD),
cleans the transcripts (deduplication, tag removal, paragraph formatting),
and writes structured Markdown and Text transcripts to the transcripts/ folder.
"""

import os
import re
import shutil

METADATA = [
    {
        "ch": 1,
        "title": "Κεφάλαιο 1: Τροφοσυλλέκτης και Κυνηγός",
        "subtitle": "Η μακρά πορεία του ανθρώπου προς τη Γεωργική Επανάσταση",
        "playlist_vid": "jrC8aBvqGks",
        "source_vid": "IOS_iT5Hm0c",
        "vtt_file": "transcripts/raw/ch01.el.vtt"
    },
    {
        "ch": 2,
        "title": "Κεφάλαιο 2: Η Πορεία του Ανθρώπου και οι Λαοί των Στεπών",
        "subtitle": "Ο αχανής ωκεανός της χλόης, η επανάσταση της εξημέρωσης του αλόγου, και οι τρομεροί καβαλάρηδες της Ευρασίας",
        "playlist_vid": "A8xJP2BPXgY",
        "source_vid": "vlE-JPQpyB0",
        "vtt_file": "transcripts/raw/ch02.el.vtt"
    },
    {
        "ch": 3,
        "title": "Κεφάλαιο 3: Τα Επιτεύγματα της Γεωργικής Επανάστασης",
        "subtitle": "Οι Ποτάμιοι Πολιτισμοί, η Γέννηση των Πόλεων, η Εφεύρεση της Γραφής και η Απαρχή της Οργανωμένης Διοίκησης",
        "playlist_vid": "9ixp5EO9kfE",
        "source_vid": "lOpgrhRpzsE",
        "vtt_file": "transcripts/raw/ch03.el.vtt"
    },
    {
        "ch": 4,
        "title": "Κεφάλαιο 4: Η «Χρυσή Ορδή» του Τζένγκις Χαν & Εισαγωγή στη Θεωρία των Θρησκειών",
        "subtitle": "Από την Κοσμοκρατορία των Μογγόλων και την Pax Mongolica στην Αξονική Εποχή και τη Μεγάλη Στροφή προς τις Παγκόσμιες Θρησκείες",
        "playlist_vid": "yjWyvQm2Blw",
        "source_vid": "7q974u0_BGM",
        "vtt_file": "transcripts/raw/ch04.el.vtt"
    },
    {
        "ch": 5,
        "title": "Κεφάλαιο 5: Ινδουισμός – Βουδισμός – Ταοϊσμός",
        "subtitle": "Οι μεγάλες φιλοσοφικές και θρησκευτικές παραδόσεις της Ανατολικής και Νότιας Ασίας",
        "playlist_vid": "Y8YdMt4mwek",
        "source_vid": "7ipXbVCpras",
        "vtt_file": "transcripts/raw/ch05.el.vtt"
    },
    {
        "ch": 6,
        "title": "Κεφάλαιο 6: Κομφουκιανισμός – Ζωροαστρισμός – Εβραϊσμός",
        "subtitle": "Ηθική τάξη στην Κίνα, η μάχη Φωτός-Σκότους στην Περσία και η γέννηση του μονοθεϊσμού",
        "playlist_vid": "oXT-GHo8lUs",
        "source_vid": "8PD6TyPhdGY",
        "vtt_file": "transcripts/raw/ch06.el.vtt"
    },
    {
        "ch": 7,
        "title": "Κεφάλαιο 7: Εβραϊσμός & Χριστιανισμός",
        "subtitle": "Η εξέλιξη της βιβλικής σκέψης, οι προφητικές παραδόσεις και η γέννηση του Χριστιανισμού",
        "playlist_vid": "Mj3Vy39pVN0",
        "source_vid": "PGOV8T7gYA0",
        "vtt_file": "transcripts/raw/ch07.el.vtt"
    },
    {
        "ch": 8,
        "title": "Κεφάλαιο 8: Χριστιανισμός (Μέρος Α΄)",
        "subtitle": "Η ρωμαϊκή αυτοκρατορία, οι διωγμοί, η καθιέρωση και η πρώτη θεολογική διαμόρφωση",
        "playlist_vid": "4OhfL05IzUI",
        "source_vid": "UvzWcNZKl_s",
        "vtt_file": "transcripts/raw/ch08.el.vtt"
    },
    {
        "ch": 9,
        "title": "Κεφάλαιο 9: Χριστιανισμός (Μέρος Β΄)",
        "subtitle": "Οικουμενικές Σύνοδοι, αιρέσεις, δογματικές διαμάχες και η διαμόρφωση της Ορθοδοξίας και του Καθολικισμού",
        "playlist_vid": "Xa1EbWDByYo",
        "source_vid": "rxyKeQarj-g",
        "vtt_file": "transcripts/raw/ch09.el.vtt"
    },
    {
        "ch": 10,
        "title": "Κεφάλαιο 10: Χριστιανισμός (Μέρος Γ΄)",
        "subtitle": "Μοναχισμός, παποσύνη, Σχίσμα του 1054 και η Μεσαιωνική Ευρώπη",
        "playlist_vid": "FfwEPzwKOE8",
        "source_vid": "avJ3k5AV3qs",
        "vtt_file": "transcripts/raw/ch10.el.vtt"
    },
    {
        "ch": 11,
        "title": "Κεφάλαιο 11: Χριστιανισμός (Μέρος Δ΄)",
        "subtitle": "Μεταρρύθμιση, Αντιμεταρρύθμιση & η Γέννηση του Νεότερου Κόσμου",
        "playlist_vid": "6Uub-KB_wrA",
        "source_vid": "ACZmyYthkIA",
        "vtt_file": "transcripts/raw/ch11.el.vtt"
    },
    {
        "ch": 12,
        "title": "Κεφάλαιο 12: Ισλάμ",
        "subtitle": "Η Γέννηση μιας Νέας Πίστης & η Αραβική Έκρηξη",
        "playlist_vid": "6akPsuViBhk",
        "source_vid": "f5p5gd0KRSo",
        "vtt_file": "transcripts/raw/ch12.el.vtt"
    },
    {
        "ch": 13,
        "title": "Κεφάλαιο 13: Αραβικός Πολιτισμός & Ινδία",
        "subtitle": "Η Χρυσή Εποχή της Επιστήμης, η Αλ-Ανταλούς & το Σουλτανάτο του Δελχί",
        "playlist_vid": "uAcqnNOeTI8",
        "source_vid": "H-9uIOdYLiQ",
        "vtt_file": "transcripts/raw/ch13.el.vtt"
    },
    {
        "ch": 14,
        "title": "Κεφάλαιο 14: Ινδία & Κίνα",
        "subtitle": "Το Απόγειο των Μουγκάλ & η Αυτοκρατορική Κίνα (Μινγκ & Τσινγκ)",
        "playlist_vid": "I5Ce4KSe5XY",
        "source_vid": "ixPL_xGMrEY",
        "vtt_file": "transcripts/raw/ch14.el.vtt"
    },
    {
        "ch": 15,
        "title": "Κεφάλαιο 15: Κίνα & Ιαπωνία",
        "subtitle": "Σαμουράι, Σογκουνάτο, Sakoku & η Επανάσταση Μεϊτζί",
        "playlist_vid": "mGAcE840yP4",
        "source_vid": "FGtY4k7zbU4",
        "vtt_file": "transcripts/raw/ch15.el.vtt"
    },
    {
        "ch": 16,
        "title": "Κεφάλαιο 16: Κίνα & Νοτιοανατολική Ασία",
        "subtitle": "Οι Πόλεμοι του Οπίου, οι Ταϊπίνγκ, οι Μπόξερ & το Θαύμα του Άνγκορ Βατ",
        "playlist_vid": "yQff75NETS8",
        "source_vid": "FO7vBOurZds",
        "vtt_file": "transcripts/raw/ch16.el.vtt"
    },
    {
        "ch": 17,
        "title": "Κεφάλαιο 17: Ρωσία",
        "subtitle": "Ρως του Κιέβου, ο Μογγολικός Ζυγός, ο Ιβάν ο Τρομερός & το Παράθυρο στην Ευρώπη",
        "playlist_vid": "dRsrX9Zns7Y",
        "source_vid": "9TSS94p9lWI",
        "vtt_file": "transcripts/raw/ch17.el.vtt"
    },
    {
        "ch": 18,
        "title": "Κεφάλαιο 18: Ρωσία & ο Κόσμος",
        "subtitle": "Από τον Ναπολέοντα στο 1917, το Στάλινγκραντ & την Πτώση της ΕΣΣΔ",
        "playlist_vid": "tsrgC8mIVd0",
        "source_vid": "RpjW9B-mVjc",
        "vtt_file": "transcripts/raw/ch18.el.vtt"
    },
    {
        "ch": 19,
        "title": "Κεφάλαιο 19: Ο Σύγχρονος Κόσμος",
        "subtitle": "Η Βιομηχανική Επανάσταση, ο Μαρξισμός & ο Διαμελισμός της Αφρικής",
        "playlist_vid": "jCLI4vE4uKQ",
        "source_vid": "11Uof_d9aLs",
        "vtt_file": "transcripts/raw/ch19.el.vtt"
    },
    {
        "ch": 20,
        "title": "Κεφάλαιο 20: Παγκόσμια Ιστορία: Ο Κόσμος Σήμερα",
        "subtitle": "Χαρακώματα, Ολοκαύτωμα, Χιροσίμα & η Παγκοσμιοποίηση (Μάθημα 20ο - Μέρος 1ο)",
        "playlist_vid": "T_LQ6xJvhy0",
        "source_vid": "UVyiHAUF5fc",
        "vtt_file": "transcripts/raw/ch20.el.vtt"
    },
    {
        "ch": 21,
        "title": "Κεφάλαιο 21: Παγκόσμια Ιστορία: Ανακεφαλαίωση με Μουσικές & Εικόνες",
        "subtitle": "Το Μεγάλο Ταξίδι 300.000 Ετών (Μάθημα 20ο - Μέρος 2ο / Τελευταίο)",
        "playlist_vid": "hOELIFPuha0",
        "source_vid": "EkCpYtrNyew",
        "vtt_file": "transcripts/raw/ch21.el.vtt"
    }
]

PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLlz0pQKPcu894vuwhqnIsuC6xCqdHSDjn"

def clean_vtt(vtt_path, interval_sec=60):
    with open(vtt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    current_sec = 0
    current_ts_str = "00:00:00"
    paragraphs = []
    current_words = []
    para_ts = "00:00:00"
    para_start_sec = 0
    
    for line in lines:
        line_str = line.strip()
        m = re.match(r"(?:(\d+):)?(\d+):(\d+)\.\d+\s*-->", line_str)
        if m:
            h = int(m.group(1)) if m.group(1) else 0
            m_val = int(m.group(2))
            s_val = int(m.group(3))
            current_sec = h * 3600 + m_val * 60 + s_val
            current_ts_str = f"{h:02d}:{m_val:02d}:{s_val:02d}"
            continue
            
        if "<c>" in line_str or "</c>" in line_str:
            clean = re.sub(r"<\d+:\d+:\d+\.\d+>", "", line_str)
            clean = re.sub(r"</?c>", "", clean).strip()
            if not clean:
                continue
            words = clean.split()
            filtered = []
            for w in words:
                if current_words and w == current_words[-1]:
                    continue
                if filtered and w == filtered[-1]:
                    continue
                filtered.append(w)
            if not filtered:
                continue
            if not current_words:
                para_ts = current_ts_str
                para_start_sec = current_sec
            if current_sec - para_start_sec >= interval_sec and current_words:
                text_clean = " ".join(current_words)
                if text_clean:
                    text_clean = text_clean[0].upper() + text_clean[1:]
                paragraphs.append({
                    "ts_str": para_ts,
                    "sec": para_start_sec,
                    "text": text_clean
                })
                current_words = filtered
                para_ts = current_ts_str
                para_start_sec = current_sec
            else:
                current_words.extend(filtered)
                
    if current_words:
        text_clean = " ".join(current_words)
        if text_clean:
            text_clean = text_clean[0].upper() + text_clean[1:]
        paragraphs.append({
            "ts_str": para_ts,
            "sec": para_start_sec,
            "text": text_clean
        })
        
    total_duration_sec = current_sec
    return paragraphs, total_duration_sec

def format_duration(seconds):
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}ω {m:02d}λ {s:02d}δ"
    return f"{m}λ {s:02d}δ"

def generate_all():
    os.makedirs("transcripts", exist_ok=True)
    os.makedirs("transcripts/raw", exist_ok=True)
    
    summary_stats = []
    
    for item in METADATA:
        ch = item["ch"]
        title = item["title"]
        subtitle = item["subtitle"]
        p_vid = item["playlist_vid"]
        s_vid = item["source_vid"]
        vtt_src = item["vtt_file"]
        
        # Copy raw VTT
        raw_target = f"transcripts/raw/ch{ch:02d}.el.vtt"
        if vtt_src != raw_target and os.path.exists(vtt_src):
            shutil.copyfile(vtt_src, raw_target)
            
        paragraphs, total_sec = clean_vtt(vtt_src, interval_sec=60)
        total_words = sum(len(p["text"].split()) for p in paragraphs)
        duration_fmt = format_duration(total_sec)
        
        summary_stats.append({
            "ch": ch,
            "title": title,
            "subtitle": subtitle,
            "playlist_vid": p_vid,
            "words": total_words,
            "paragraphs": len(paragraphs),
            "duration": duration_fmt
        })
        
        # 1. Plain Text Transcript (.txt)
        txt_path = f"transcripts/ch{ch:02d}.txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(f"===============================================================================\n")
            f.write(f"{title.upper()}\n")
            if subtitle:
                f.write(f"{subtitle}\n")
            f.write(f"===============================================================================\n")
            f.write(f"Ομιλήτρια:          Μαρία Ευθυμίου (Καθηγήτρια Ιστορίας ΕΚΠΑ)\n")
            f.write(f"Κύκλος Διαλέξεων:   «19 Μικρά Μαθήματα για έναν Μεγάλο Κόσμο» (Megaron Plus & BLOD)\n")
            f.write(f"Βίντεο Playlist:    https://www.youtube.com/watch?v={p_vid}&list=PLlz0pQKPcu894vuwhqnIsuC6xCqdHSDjn\n")
            f.write(f"Ψηφιακό Βιβλίο:     chapters/ch{ch:02d}.md / chapters/ch{ch:02d}.html\n")
            f.write(f"Εκτιμώμενη Διάρκεια: {duration_fmt} | Σύνολο Λέξεων: {total_words:,} | Παράγραφοι: {len(paragraphs)}\n")
            f.write(f"===============================================================================\n\n")
            
            for p in paragraphs:
                f.write(f"[{p['ts_str']}]\n{p['text']}\n\n")
                
        # 2. Markdown Transcript (.md) with clickable YouTube timestamps
        md_path = f"transcripts/ch{ch:02d}.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"# {title}\n")
            if subtitle:
                f.write(f"### {subtitle}\n\n")
            f.write(f"---\n\n")
            f.write(f"| Στοιχείο | Πληροφορία |\n")
            f.write(f"| :--- | :--- |\n")
            f.write(f"| **Ομιλήτρια** | **Μαρία Ευθυμίου**, Καθηγήτρια Ιστορίας Νέου Ελληνισμού ΕΚΠΑ |\n")
            f.write(f"| **Κύκλος** | *19 Μικρά Μαθήματα για έναν Μεγάλο Κόσμο* (Megaron Plus & BLOD) |\n")
            f.write(f"| **Βίντεο Διάλεξης (YouTube)** | [Παρακολούθηση στο YouTube](https://www.youtube.com/watch?v={p_vid}&list=PLlz0pQKPcu894vuwhqnIsuC6xCqdHSDjn) |\n")
            f.write(f"| **Κεφάλαιο Βιβλίου** | [chapters/ch{ch:02d}.md](../chapters/ch{ch:02d}.md) • [chapters/ch{ch:02d}.html](../chapters/ch{ch:02d}.html) |\n")
            f.write(f"| **Διάρκεια** | {duration_fmt} |\n")
            f.write(f"| **Σύνολο Λέξεων** | {total_words:,} λέξεις ({len(paragraphs)} παράγραφοι) |\n")
            f.write(f"| **Μορφή Αρχείου** | Πλήρες απομαγνητοφωνημένο κείμενο με άμεσους συνδέσμους χρονοσημάνσεων |\n\n")
            f.write(f"---\n\n")
            f.write(f"## 📜 Πλήρες Απομαγνητοφωνημένο Κείμενο Διάλεξης\n\n")
            
            for p in paragraphs:
                ts = p['ts_str']
                sec = p['sec']
                yt_link = f"https://www.youtube.com/watch?v={p_vid}&t={sec}s"
                f.write(f"**[[{ts}]]({yt_link})**  \n{p['text']}\n\n")
                
        print(f"Generated Ch {ch:02d}: {total_words:,} words, {len(paragraphs)} paragraphs, {duration_fmt}")
        
    # 3. Master README.md index in transcripts/
    readme_path = "transcripts/README.md"
    total_all_words = sum(s["words"] for s in summary_stats)
    total_all_paras = sum(s["paragraphs"] for s in summary_stats)
    
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("# 🎙️ Απομαγνητοφωνήσεις Διαλέξεων (Transcripts)\n")
        f.write("### Μαρία Ευθυμίου — «19 Μικρά Μαθήματα για έναν Μεγάλο Κόσμο» (Megaron Plus & BLOD)\n\n")
        f.write("Ο πλήρης κατάλογος των καθαρών, χρονοσημασμένων απομαγνητοφωνήσεων (transcripts) και για τις **21 διαλέξεις** ")
        f.write("του ιστορικού κύκλου μαθημάτων παγκόσμιας ιστορίας στο Μέγαρο Μουσικής Αθηνών.\n\n")
        f.write(f"**Συνολικός Όγκος Απομαγνητοφωνήσεων:** **{total_all_words:,} λέξεις** σε **{total_all_paras:,} παραγράφους** (~55 ώρες διδασκαλίας).\n\n")
        f.write("---\n\n")
        f.write("## 📑 Πίνακας Περιεχομένων Απομαγνητοφωνήσεων\n\n")
        f.write("| Κεφ. | Τίτλος Διάλεξης | Διάρκεια | Λέξεις | Markdown (.md) | Text (.txt) | Βίντεο YouTube |\n")
        f.write("| :---: | :--- | :---: | :---: | :---: | :---: | :---: |\n")
        
        for s in summary_stats:
            c = s["ch"]
            title_clean = s["title"].split(": ", 1)[-1]
            vid = s["playlist_vid"]
            f.write(f"| **{c:02d}** | {title_clean} | {s['duration']} | {s['words']:,} | [ch{c:02d}.md](ch{c:02d}.md) | [ch{c:02d}.txt](ch{c:02d}.txt) | [YouTube 🔗](https://www.youtube.com/watch?v={vid}&list=PLlz0pQKPcu894vuwhqnIsuC6xCqdHSDjn) |\n")
            
        f.write("\n---\n\n")
        f.write("## 💡 Χαρακτηριστικά Απομαγνητοφωνήσεων\n\n")
        f.write("1. **Πλήρης Αποθορυβοποίηση (Deduplication):** Αφαίρεση των κυλιόμενων επαναλήψεων και τεχνικών ετικετών συγχρονισμού του YouTube ASR.\n")
        f.write("2. **Διαδραστικές Χρονοσημάνσεις (Clickable Timestamps):** Κάθε παράγραφος στο αρχείο `.md` περιλαμβάνει απευθείας σύνδεσμο ακριβείας στο αντίστοιχο δευτερόλεπτο της διάλεξης στο YouTube playlist.\n")
        f.write("3. **100% Συγχρονισμός με το Ψηφιακό Βιβλίο:** Άμεση αντιστοίχιση με τα κεφάλαια `chapters/ch01.md` έως `chapters/ch21.md`.\n")
        f.write("4. **Πρωτότυπα Αρχεία VTT:** Όλα τα αρχικά αρχεία υποτίτλων WebVTT φυλάσσονται στον υποφάκελο `transcripts/raw/`.\n")

    print("\nMaster README.md successfully created!")
    print(f"Total Words Processed across all 21 chapters: {total_all_words:,} in {total_all_paras:,} paragraphs")

if __name__ == "__main__":
    generate_all()
