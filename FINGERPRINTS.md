# AYNI Protocol — Scroll-Craft & UI Architecture Fingerprints

## Grammar Profile
- **Engine**: Scroll-Craft Engine 2026
- **Grammar**: Dark Editorial & Cinematic Kinetic Web3
- **Primary Timeline**: `--sc-p` reactive viewport binding via `IntersectionObserver` & passive scroll listener
- **Color Temperature**: Deep Obsidian (`#050810`), Bioluminescent Cyan (`#00f0ff`), Ancestral Gold (`#f5a623`), Radiant Emerald (`#00d68f`)
- **Motion Philosophy**: `antigravity-design-expert` 0.45s `cubic-bezier(0.16, 1, 0.3, 1)` with staggered dominó entrances (`animation-delay: calc(var(--stagger, 0) * 0.08s)`)
- **Security & RLS**: `web-security-academy-rules` + `supabase-postgres-best-practices`
- **Deployment Platform**: Vercel (`https://ayni-protocool.vercel.app`)

## Audited Modules
1. **Core Layout**: Unified `DashboardLayout` wrapping all dashboard sub-routes (`/dashboard`, `/remesas`, `/marketplace`, `/orders`, `/trips`, `/heritage`).
2. **Remesas P2P & TimeLock**: Fixed layout alignment, wrapped in `DashboardLayout`, modal overlays centered with backdrop blur, zero horizontal overflow.
3. **Session & Auth Guard**: Reactive `AuthContext` with Supabase Auth state listener, strict route protection redirecting unauthenticated users to `/auth`.
4. **Fast Demo Evaluator**: 1-click test role switchers for Hackathon judges & evaluators (Client, Traveler, Merchant, Admin).
