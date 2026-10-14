---
trigger: always_on
description: Core invariants and quality standards for the Maria Efthymiou history course repository
---

# Repository Rules: efthimiou-lessons

- Maintain 100% bidirectional parity between `chapters/*.md` and `chapters/*.html`.
- Preserve Professor Maria Efthymiou's lecture storytelling style and tone.
- Ensure all Maria quote boxes (`box-maria`) retain exact YouTube timestamp links.
- Strictly authentic historical and museum assets only; no AI-generated images.
- Verify changes with `python3 scratch/verify_all_chapters.py` and `python3 scratch/test_deep_parity.py`.
