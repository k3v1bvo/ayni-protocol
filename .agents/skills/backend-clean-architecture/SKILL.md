---
name: backend-clean-architecture
description: Clean Architecture and SOLID engineering principles for Next.js, TypeScript and Supabase, enforcing boundary separation, input sanitization, and defensive data access.
---

# Backend Clean Architecture Guidelines

## Core Principles
1. **Separation of Concerns (SoC)**: Domain logic, data access (Supabase queries), and UI presentation must maintain distinct boundaries.
2. **Input Sanitization & Validation**:
   - All form inputs and query parameters must be trimmed, normalized, and validated for type/length before database operations.
   - Guard against XSS, injection vectors, and malformed payload types.
3. **Graceful Degraded States**:
   - Never throw uncaught exceptions in user interfaces.
   - Provide clean error boundaries, meaningful user feedback, and resilient fallbacks when network/RPC calls fail.
4. **Defensive Mutation**:
   - Verify user authorization and session claims before performing writes.
   - Utilize idempotent operations (`upsert`, `IF EXISTS`) to avoid concurrency race conditions.
