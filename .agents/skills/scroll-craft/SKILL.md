---
name: scroll-craft
description: Builds cinematic timeline-driven web interfaces where vertical scroll acts as the animation timeline, eliminating generic AI templates.
---

# Scroll-Craft Engine for Antigravity

## Core Philosophy
- Treat vertical scroll as an animation timeline, not a document pager.
- Publish `--sc-p` (0.0 to 1.0 progress) via CSS/JS to coordinate all layered parallax transitions.
- Every viewport transition must feel cinematic, editorial, and deliberately staged.
- Prohibit abrupt visual jumps; maintain minimum 0.3s ease-out transitions and staggered element entrances.

## Visual Grammar: Dark Editorial & Kinetic Web3
- Palette: Deep cosmic obsidian (`#050810`, `#0a101f`), accented by bioluminescent cyan (`#00f0ff`), electric emerald (`#00d68f`), and ancestral gold (`#f5a623`).
- Glassmorphism: Multi-layered backdrop blurs (`backdrop-filter: blur(24px)`), subtle specular borders (`rgba(0, 240, 255, 0.15)`), and dynamic radial ambient glow.
- Staggered entrances: Children elements must stagger with `animation-delay: calc(var(--index, 0) * 0.08s)`.
- Scroll Progress Binding: Use `IntersectionObserver` or scroll progress listener to set `--sc-p: ${scrollProgress}` on `.scroll-craft-root`.

## Technical Invariants
1. No layout shift: fixed dimensions or aspect ratios for all media.
2. Fluid responsiveness: Mobile viewports (<768px) must translate horizontal wide grids into clean touch-friendly stacks or horizontal snapping rails.
3. Contrast & Accessibility: WCAG AA compliant text contrast against dynamic backgrounds.
