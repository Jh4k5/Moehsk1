#!/usr/bin/env python3
"""Apply Dark Navy Theme to globals.css"""

import re

CSS_PATH = "/home/z/my-project/src/app/globals.css"

with open(CSS_PATH, "r") as f:
    content = f.read()

# Track replacements
replacements_made = []

def replace(old, new, label=None):
    global content
    if old in content:
        content = content.replace(old, new)
        replacements_made.append(label or f"{old} → {new}")

# ─────────────────────────────────────────
# 1. CSS Variable Replacements in :root
# ─────────────────────────────────────────

# Background & foreground
replace("--background: oklch(0.985 0.002 60)", "--background: oklch(0.13 0.02 250)", "background → dark navy")
replace("--foreground: oklch(0.145 0 0)", "--foreground: oklch(0.95 0 0)", "foreground → light")

# Card
replace("--card: oklch(1 0 0)", "--card: oklch(0.17 0.025 250)", "card → dark navy")
replace("--card-foreground: oklch(0.145 0 0)", "--card-foreground: oklch(0.95 0 0)", "card-foreground → light")

# Popover
replace("--popover: oklch(1 0 0)", "--popover: oklch(0.17 0.025 250)", "popover → dark navy")
replace("--popover-foreground: oklch(0.145 0 0)", "--popover-foreground: oklch(0.95 0 0)", "popover-foreground → light")

# Primary
replace("--primary: #1A5FA8", "--primary: #3B82F6", "primary → bright blue")
# --primary-foreground stays #FFFFFF

# Secondary
replace("--secondary: oklch(0.97 0.005 60)", "--secondary: oklch(0.20 0.03 250)", "secondary → dark navy")
replace("--secondary-foreground: oklch(0.205 0 0)", "--secondary-foreground: oklch(0.90 0 0)", "secondary-foreground → light")

# Muted
replace("--muted: oklch(0.97 0.005 60)", "--muted: oklch(0.18 0.02 250)", "muted → dark navy")
replace("--muted-foreground: oklch(0.5 0.01 60)", "--muted-foreground: oklch(0.60 0.02 250)", "muted-foreground → muted light")

# Accent
replace("--accent: #E8F0FA", "--accent: oklch(0.22 0.04 250)", "accent → dark navy")
replace("--accent-foreground: oklch(0.205 0 0)", "--accent-foreground: oklch(0.90 0 0)", "accent-foreground → light")

# Border & Input
replace("--border: oklch(0.92 0.005 60)", "--border: oklch(0.25 0.03 250)", "border → dark navy")
replace("--input: oklch(0.92 0.005 60)", "--input: oklch(0.22 0.03 250)", "input → dark navy")

# Ring
replace("--ring: #1A5FA8", "--ring: #3B82F6", "ring → bright blue")

# Surface tokens
replace("--surface-page: #F7F7F7", "--surface-page: #0D1B3E", "surface-page → dark navy")
replace("--surface-card: #FFFFFF", "--surface-card: #1A2C5B", "surface-card → dark navy")
replace("--surface-hover: #E5E5E5", "--surface-hover: #1E3368", "surface-hover → dark navy")
replace("--surface-active: #1A5FA8", "--surface-active: #2563EB", "surface-active → blue")

# Sidebar tokens
replace("--sidebar: oklch(0.985 0.002 60)", "--sidebar: oklch(0.15 0.025 250)", "sidebar → dark navy")
replace("--sidebar-foreground: oklch(0.145 0 0)", "--sidebar-foreground: oklch(0.95 0 0)", "sidebar-foreground → light")
replace("--sidebar-primary: #1A5FA8", "--sidebar-primary: #3B82F6", "sidebar-primary → bright blue")
replace("--sidebar-accent: #E8F0FA", "--sidebar-accent: oklch(0.22 0.04 250)", "sidebar-accent → dark navy")
replace("--sidebar-accent-foreground: oklch(0.205 0 0)", "--sidebar-accent-foreground: oklch(0.90 0 0)", "sidebar-accent-foreground → light")
replace("--sidebar-border: oklch(0.92 0.005 60)", "--sidebar-border: oklch(0.25 0.03 250)", "sidebar-border → dark navy")
replace("--sidebar-ring: #1A5FA8", "--sidebar-ring: #3B82F6", "sidebar-ring → bright blue")

# ─────────────────────────────────────────
# 2. Gamification Button/Component Styles
# ─────────────────────────────────────────

# Progress bar
replace(".progress-duo {\n  height: 20px;\n  background: #E5E5E5;",
        ".progress-duo {\n  height: 20px;\n  background: #1E293B;",
        "progress-duo bg → dark slate")
replace("background: #58CC02;\n  border-radius: 10px;\n  border-bottom: 4px solid #46A302;",
        "background: #10B981;\n  border-radius: 10px;\n  border-bottom: 4px solid #059669;",
        "progress-duo-fill → green")

# btn-primary-game
replace(".btn-primary-game {\n  background: #1A5FA8;",
        ".btn-primary-game {\n  background: #3B82F6;",
        "btn-primary-game bg → bright blue")
replace("border-bottom: 4px solid #0D4E82;",
        "border-bottom: 4px solid #2563EB;",
        "btn-primary-game border → blue")
replace(".btn-primary-game:hover {\n  background: #1A5FA8;",
        ".btn-primary-game:hover {\n  background: #3B82F6;",
        "btn-primary-game:hover → bright blue")

# btn-secondary-game
replace(".btn-secondary-game {\n  background: white;\n  color: #1A5FA8;\n  border: 2px solid #1A5FA8;\n  border-bottom: 4px solid #1A5FA8;",
        ".btn-secondary-game {\n  background: #1A2C5B;\n  color: #60A5FA;\n  border: 2px solid #3B82F6;\n  border-bottom: 4px solid #3B82F6;",
        "btn-secondary-game → dark")
replace(".btn-secondary-game:hover {\n  background: #E8F0FA;",
        ".btn-secondary-game:hover {\n  background: #1E3368;",
        "btn-secondary-game:hover → dark")

# btn-success-game
replace(".btn-success-game {\n  background: #58CC02;",
        ".btn-success-game {\n  background: #10B981;",
        "btn-success-game bg → green")
replace("border-bottom: 4px solid #46A302;",
        "border-bottom: 4px solid #059669;",
        "btn-success-game border → green")

# Custom scrollbar
replace("background: oklch(0.8 0.01 60);\n  border-radius: 3px;",
        "background: oklch(0.35 0.02 250);\n  border-radius: 3px;",
        "scrollbar-thumb → dark")
replace("background: oklch(0.65 0.02 60);",
        "background: oklch(0.50 0.03 250);",
        "scrollbar-thumb:hover → dark")

# Shimmer
replace("background: linear-gradient(90deg, transparent, rgba(26, 95, 168, 0.08), transparent);",
        "background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.12), transparent);",
        "shimmer → dark compatible")

# Card hover
replace("box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);",
        "box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);",
        "card-hover shadow → dark")

# ─────────────────────────────────────────
# 3. Append JISR Custom Theme at end
# ─────────────────────────────────────────

jizr_section = """
/* ═══ JISR CUSTOM DARK THEME ═══ */
:root {
  --jisr-navy: #0D1B3E;
  --jisr-navy-light: #152347;
  --jisr-navy-card: #1A2C5B;
  --jisr-blue: #3B82F6;
  --jisr-blue-bright: #60A5FA;
  --jisr-blue-light: #93C5FD;
  --jisr-accent: #60A5FA;
  --jisr-gold: #F59E0B;
  --jisr-success: #10B981;
  --jisr-danger: #EF4444;
  --jisr-text: #E2E8F0;
  --jisr-text-muted: #94A3B8;
}

body {
  background: linear-gradient(135deg, #0D1B3E 0%, #0F2347 50%, #0D1B3E 100%) !important;
  min-height: 100vh;
  color: #E2E8F0;
}
"""

# Remove trailing whitespace/newlines then append
content = content.rstrip("\n") + jizr_section
replacements_made.append("Appended JISR custom dark theme section")

# Write back
with open(CSS_PATH, "w") as f:
    f.write(content)

# ─────────────────────────────────────────
# Summary
# ─────────────────────────────────────────
print(f"✅ Applied {len(replacements_made)} changes to {CSS_PATH}\n")
for i, r in enumerate(replacements_made, 1):
    print(f"  {i:2d}. {r}")
