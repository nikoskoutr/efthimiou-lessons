# Antigravity Workspace Guidelines: efthimiou-lessons

## Project Overview
This repository contains the complete digital book and interactive reading interface for Professor Maria Efthymiou's 21-part world history lecture series (*19 Μικρά Μαθήματα για έναν Μεγάλο Κόσμο* / Megaron Plus & BLOD).

## Core Invariants for Agents
1. **100% Parity between Markdown and HTML**:
   - Every chapter exists as both `chapters/chXX.md` and `chapters/chXX.html`.
   - Section numbers, titles, and synthesis footers (`## 🕊️ Αναστοχασμός...`) must match verbatim.
2. **Authentic Oral Classroom Voice**:
   - Preserve Maria Efthymiou's distinctive Greek rhetorical style, humor, pedagogical pacing, and authentic audience dialogues.
3. **Interactive Quotes (`box-maria`)**:
   - Each quote box must contain a verified, clickable YouTube timestamp link pointing to the exact point in the corresponding lecture.
4. **Historical Visual Assets**:
   - Only authentic museum artifacts, archaeological photography, period miniatures, and verified historical maps. Never use AI-generated images.
5. **Quality Verification**:
   - Always run `python3 tests/verify_chapters.py` and `python3 tests/verify_ui.py` (or `python3 tests/run_all.py`) after editing content or layout.
