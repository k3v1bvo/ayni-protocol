---
name: web-security-academy-rules
description: Defensive web security rules against XSS, SQL injection, unauthorized data access, and unsafe redirects.
---

# Web Security Standards

## Guidelines
1. **Input Sanitization**: Strip and escape untrusted user inputs before displaying them in innerHTML or executing queries.
2. **Safe Redirects**: When processing query param redirects (e.g., `?redirect=/dashboard`), ensure the destination starts with `/` and does not lead to malicious external domains.
3. **Session Integrity**: Store sensitive tokens strictly in httpOnly cookies or secure Supabase Auth session managers; never store raw passwords or private keys in unencrypted localStorage.
4. **Escrow & Verification**: Validate OTP hashes and timestamps cryptographically on-chain or via secure backend functions before releasing funds.
