import os
from bisect import bisect_left
import json

# from https://github.com/cicirello/jacoco-badge-generator/blob/main/JacocoBadgeGenerator.py
colors = ["4c1", "97ca00", "a4a61d", "dfb317", "fe7d37", "e05d44"]
steps = [100, 90, 80, 70, 60]
colors = ["e05d44", "fe7d37", "dfb317", "a4a61d", "97ca00", "4c1"]
steps = [60, 70, 80, 90, 100]

path = "target/cypress-coverage/coverage-summary.json"
with open(path) as f:
    j = json.load(f)
coverage = j["total"]["lines"]["pct"]

idx = bisect_left(steps, coverage)
color = colors[idx]

url = f"https://img.shields.io/badge/frontend_coverage-{coverage:.1f}%25-{color}"

os.system(f"wget -O frontend_coverage.svg {url}")
