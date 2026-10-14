#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_all.py - Complete Test Runner for efthimiou-lessons

Executes:
1. tests/verify_chapters.py (Content parity, link integrity, images, quotes)
2. tests/verify_ui.py (UI controls, CSS themes, mobile responsiveness, regressions)
"""

import subprocess
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

scripts = [
    os.path.join(BASE_DIR, "tests", "verify_chapters.py"),
    os.path.join(BASE_DIR, "tests", "verify_ui.py")
]

all_passed = True
for s in scripts:
    res = subprocess.run([sys.executable, s])
    if res.returncode != 0:
        all_passed = False
        break

if not all_passed:
    print("\n❌ Verification suite failed.")
    sys.exit(1)
else:
    print("\n" + "=" * 79)
    print("🚀 ALL TEST SUITES PASSED! REPOSITORY IS 100% PRODUCTION READY!")
    print("=" * 79)
    sys.exit(0)
