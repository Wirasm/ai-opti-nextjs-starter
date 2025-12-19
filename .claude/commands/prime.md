---
allowed-tools: Read, Glob
description: Prime agent with codebase context
---

Read these files to understand the codebase before starting work:

1. `CLAUDE.md` - Commands, patterns, and conventions
2. `package.json` - Scripts and dependencies
3. `tsconfig.json` - TypeScript strict settings
4. `biome.json` - Linting rules
5. `src/core/database/schema.ts` - Database schema
6. `src/core/supabase/server.ts` - Server-side Supabase client
7. `src/core/supabase/client.ts` - Browser-side Supabase client
8. `src/core/supabase/proxy.ts` - Middleware for session refresh

Then run:
```bash
bun run lint && npx tsc --noEmit
```

Confirm all checks pass before proceeding.
