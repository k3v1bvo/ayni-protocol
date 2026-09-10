---
name: antigravity-design-expert
description: Strict UI/UX guidelines requiring smooth transitions (min 0.3s ease-out), staggered element entrances, and premium aesthetics.
---

# Antigravity Design Expert Guidelines

## Non-Negotiable Rules
1. **Zero Abrupt State Changes**: No visual component may snap instantly. Hover, focus, expand, and drawer toggles must use transitions of at least `0.3s cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Staggered Animations**: Lists, cards, and tables must enter with staggered delay offsets (`0.06s` per item) rather than appearing in bulk.
3. **Depth and Hierarchy**: Use layered opacity (`rgba`), background blurs, specular edges, and soft glows to convey depth.
4. **Mobile First Ergonomics**: Touch targets must be at least 44x44px. Critical navigation on mobile must be within thumb reach via Bottom Navigation or full-height Drawer.
5. **No Broken Views**: Every modal must have backdrop blur, viewport centering, and tap-outside dismiss handlers.
