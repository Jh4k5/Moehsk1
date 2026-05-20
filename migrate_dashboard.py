#!/usr/bin/env python3
"""Migrate Dashboard + Footer in page.tsx to JISR Design System v3.0 CSS classes."""

import re

FILE = "/home/z/my-project/src/app/page.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

total_replacements = 0
log = []

def replace(line, old, new, line_num):
    global total_replacements
    if old in line:
        new_line = line.replace(old, new)
        if new_line != line:
            lines[line_num] = new_line
            total_replacements += 1
            log.append(f"  L{line_num+1}: '{old}' → '{new}'")
            return True
    return False

# ─────────────────────────────────────────────
# 1. FOOTER (lines 1062-1067, index 1061-1066)
# ─────────────────────────────────────────────
print("=== FOOTER ===")
replace(lines[1062], 'border-gray-200 bg-gray-50', 'border-[var(--line-default)] bg-[var(--surface-card)]', 1062)
replace(lines[1063], 'text-gray-500', 'text-[var(--text-muted)]', 1063)

# ─────────────────────────────────────────────
# 2. DASHBOARD SECTION (lines 1075-1178, index 1074-1177)
# ─────────────────────────────────────────────
print("=== DASHBOARD SECTION ===")

# Line 1083: heading
replace(lines[1082], 'text-gray-900', 'text-[var(--text-primary)]', 1082)

# Line 1087: subtitle
replace(lines[1086], 'text-gray-500', 'text-[var(--text-muted)]', 1086)

# Line 1098: stat cards — add j-card class
replace(lines[1097], 'className="card-hover border-0 shadow-sm"', 'className="j-card card-hover border-0"', 1097)

# Line 1103: stat value
replace(lines[1102], 'text-gray-900', 'text-[var(--text-primary)]', 1102)

# Line 1104: stat total
replace(lines[1103], 'text-gray-500', 'text-[var(--text-muted)]', 1103)

# Line 1105: stat label
replace(lines[1104], 'text-gray-600', 'text-[var(--text-tertiary)]', 1104)

# Line 1119: category label in progress
replace(lines[1118], 'text-gray-600', 'text-[var(--text-secondary)]', 1118)

# Line 1125: category count
replace(lines[1124], 'text-gray-500', 'text-[var(--text-muted)]', 1124)

# Line 1166: daily plan task button
replace(lines[1165], 'bg-gray-50 hover:bg-primary/10', 'bg-[var(--surface-card-h)] hover:bg-[var(--clr-primary)]/10', 1165)

# Line 1169: task label
replace(lines[1168], 'text-gray-700', 'text-[var(--text-secondary)]', 1168)

# Line 1170: arrow
replace(lines[1169], 'text-gray-400', 'text-[var(--text-muted)]', 1169)

# ─────────────────────────────────────────────
# 3. WEAK WORDS SECTION (lines 1180-1232, index 1179-1231)
# ─────────────────────────────────────────────
print("=== WEAK WORDS SECTION ===")

# Line 1195: empty state icon bg
replace(lines[1194], 'bg-amber-50', 'bg-[var(--clr-warning-bg)]', 1194)

# Line 1200: empty state text
replace(lines[1199], 'text-gray-500', 'text-[var(--text-muted)]', 1199)

# Line 1212: weak words icon bg
replace(lines[1211], 'bg-amber-50', 'bg-[var(--clr-warning-bg)]', 1211)

# Line 1222: weak word buttons — amber theme
replace(lines[1221], 'bg-amber-50 border border-amber-200', 'bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30', 1221)
replace(lines[1221], 'hover:bg-amber-100', 'hover:bg-[var(--clr-warning)]/20', 1221)

# Line 1224: weak word chinese text
replace(lines[1223], 'text-gray-900', 'text-[var(--text-primary)]', 1223)

# Line 1225: weak word meaning
replace(lines[1224], 'text-gray-500', 'text-[var(--text-muted)]', 1224)

# ─────────────────────────────────────────────
# Write file
# ─────────────────────────────────────────────
with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(lines)

print(f"\n=== SUMMARY ===")
print(f"Total replacements: {total_replacements}")
print(f"\nDetailed log:")
for entry in log:
    print(entry)
