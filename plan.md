# Plan — Studio Rauda Website Issue Fixes

## Context
User uploaded `index (2).html` (549 KB single-file site for Studio Rauda, crimson/black editorial design).
Previous session identified issue categories: design, visuals, motions, sentences/copy, graphics.
Mission now: **generate the fixed code** for those issues.

## Stage 1 — Audit (done by Orchestrator, read-only)
Read full file (1,768 lines, incl. 3 base64 images). Confirmed issue list:

**Functional bugs**
1. Join-form success message never displays (form hides itself, success div is a child of the form).
2. Overlay close has no exit animation (500 ms dead pause then abrupt disappearance).
3. Anchor navigation hides section tops under the fixed nav (no `scroll-margin-top`).
4. Hero uses `100vh` — breaks on mobile Safari (needs `svh/dvh` fallback).
5. No `prefers-reduced-motion` support (marquee, reveals, pulse run for motion-sensitive users).
6. Overlay doesn't reset scroll position on reopen; focus not managed.
7. Missing favicon (browser 404), missing `theme-color`, no `og:image`.

**Design / visual**
8. `.hero-tagline` CSS defined but element missing in hero (dead spec / hero feels empty under logo).
9. `.hero-grid-lines` draws only ONE line despite plural name (add 2nd line at 66%).
10. No `:focus-visible` styles (keyboard users get no visible focus).
11. No hero entrance motion (page pops in fully static).
12. Founder photo is a 372 KB base64 placeholder — heaviest asset, compress.

**Copy**
13. Section label "Join Event" is awkward → "Events & Updates".
14. Nav has no link to Contact / Events sections.

## Stage 2 — Design guidance
Load `musepool` skill (design/anti-slop guidance) — apply only principles relevant to fixing, keep existing brand system (crimson #A82020, Barlow Condensed/Anton, editorial grid). No redesign.

## Stage 3 — Implement fixes
Copy file to `/mnt/agents/output/index.html`, apply all Stage-1 fixes via targeted edits; compress founder JPEG with PIL (max 1200 px, q≈82) and re-embed.
Validate: HTML parse check, JS syntax check, duplicate-id check, browser screenshot review.

## Stage 4 — Deliver
- Save website version via `website_version_manager` (type: html) → preview URL.
- Deliver `/mnt/agents/output/index.html` + summary of every fix.

---

# Round 2 — Case Studies, Reviews, Less Text

## Stage 1 — New sections (matching existing crimson editorial system)
- **Case Studies** (`#case-studies`) after Services: 3 stat-led cards, 1px-divider grid,
  hover-invert like service items. Route labels (China→USA etc.), one-line outcome, one big metric.
  Content = clearly marked placeholders (HTML `<!-- REPLACE -->` comments) — no fabricated client claims.
- **Reviews** (`#reviews`) after Founder: 3 short testimonial cards on warm-white,
  role-based attribution placeholders (no invented names).
- Nav: add "Work" link to case studies.

## Stage 2 — Copy reduction
- Founder story: 2 paragraphs → ~40% shorter, punchier.
- Problem list items: trim each to ≤7 words.
- Problem pull-quote: shorten.
- Join subtitle: shorten.

## Stage 3 — Validate & deliver
Tag balance + JS check, desktop/mobile screenshots of new sections,
sync to `/mnt/agents/output/site/`, rebuild version, deliver.

---

# Round 3 — Real client data
Replace placeholder reviews + case studies with the 3 real clients:
1. Elena Vogt — Nordic Flow AG — water purification — Germany → Shanghai & SEA
2. Marcus Tan — Lumos Education Group — EdTech — Singapore → China K-12
3. Priya Sharma — Amaranth Beauty Co. — clean beauty — India/UK → Tmall Global + Douyin
Stats grounded in given info (regions/sectors/platforms), no invented performance numbers.
Quotes drafted per client — user must verify with clients before publishing.
Validate → screenshot → sync → build version.
