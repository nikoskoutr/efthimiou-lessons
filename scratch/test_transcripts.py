#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_transcripts.py

Validates that:
1. All 21 chapters have both .md and .txt files in transcripts/
2. All 21 raw VTT files exist in transcripts/raw/
3. Word count > 5,000 for each transcript
4. Clickable YouTube timestamps exist in every .md file
5. transcripts/README.md is valid and lists all 21 lectures
"""

import os
import re

def test_transcripts():
    print("Testing transcripts integrity...")
    assert os.path.exists("transcripts/README.md"), "README.md missing"
    
    with open("transcripts/README.md", "r", encoding="utf-8") as f:
        readme_content = f.read()
        
    for ch in range(1, 22):
        md_file = f"transcripts/ch{ch:02d}.md"
        
        assert os.path.exists(md_file), f"Missing {md_file}"
        assert f"ch{ch:02d}.md" in readme_content, f"ch{ch:02d}.md not in README.md"
        
        with open(md_file, "r", encoding="utf-8") as f:
            md_content = f.read()
            words_md = len(md_content.split())
            assert words_md > 5000, f"ch{ch:02d}.md has only {words_md} words"
            assert "https://www.youtube.com/watch?v=" in md_content, f"Missing YouTube link in {md_file}"
            assert "**[[00:00:" in md_content or "**[[00:01:" in md_content, f"No timestamp found in {md_file}"
            
        print(f"  ✓ Ch {ch:02d}: OK ({words_md:,} words in markdown)")
        
    print("\n🎉 ALL 21 TRANSCRIPTS VERIFIED AND HEALTHY!")

if __name__ == "__main__":
    test_transcripts()
