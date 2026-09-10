---
name: vercel-react-best-practices
description: Next.js and React architecture guidelines for optimal Vercel deployment, zero re-render waste, and proper App Router layout nesting.
---

# Vercel & React Architecture Best Practices

## Guidelines
1. **Layout Integrity**: Always encapsulate sub-routes with dedicated `layout.tsx` or shared shells. Never leave child pages orphaned without their parent shell.
2. **Client Component Boundaries**: Isolate interactive state in `'use client'` leaves. Keep wrappers and layout scaffolding clean.
3. **Environment Variables**: Always prefix public client variables with `NEXT_PUBLIC_`. Keep server secrets out of client bundles.
4. **Clean Route Guards**: Check authentication states reactively. Prevent race conditions and layout flashing using loading spinners while verifying sessions.
