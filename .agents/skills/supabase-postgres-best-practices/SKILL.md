---
name: supabase-postgres-best-practices
description: Schema and migration guidelines for PostgreSQL/Supabase: snake_case naming, primary keys, idempotent IF EXISTS guards, and RLS policies.
---

# Supabase & PostgreSQL Best Practices

## Guidelines
1. **Idempotency**: All SQL patches must use `IF NOT EXISTS` or `CREATE OR REPLACE` to avoid runtime collisions on re-runs.
2. **Naming Standard**: Always use `snake_case` for tables, columns, and enums.
3. **Primary Keys**: Every table must have a primary key named `id`, preferably UUID `DEFAULT gen_random_uuid()` or `uuid_generate_v4()`.
4. **Safety Guards**: Never issue destructive `DROP TABLE` commands in production migrations without backup verification.
5. **RLS & Triggers**: Enable Row Level Security and use idempotent trigger definitions with `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`.
