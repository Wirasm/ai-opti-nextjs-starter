# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Start development server
bun run build        # Production build (includes type checking)
bun run lint         # Check for lint/format errors (Biome)
bun run lint:fix     # Auto-fix lint/format issues
bun run format       # Format all files
npx tsc --noEmit     # Type check only (fast, no build)
bun test             # Run tests with coverage
bun test --watch     # Watch mode for TDD
```

## Self-Correction Workflow

This project uses strict TypeScript and Biome to create a feedback loop for AI-generated code:

1. **Write code** → 2. **Run checks** → 3. **Read errors** → 4. **Fix issues** → 5. **Repeat until clean**

### After writing or modifying code, always run:
```bash
bun run lint && npx tsc --noEmit
```

### Why this matters for AI development:
- **Type errors are precise**: `Type 'string | undefined' is not assignable to type 'string'` tells you exactly what's wrong
- **Catches bugs before runtime**: No need to run the app to find issues
- **Strict settings catch real bugs**:
  - `noUncheckedIndexedAccess`: Array access returns `T | undefined`, forcing null checks
  - `exactOptionalPropertyTypes`: Stricter optional property handling
  - `verbatimModuleSyntax`: Explicit type imports required

### Reading error output:
Errors include file path, line, and column: `src/app/page.tsx:15:3`
- Navigate directly to the problem
- The error message describes what's wrong
- Fix and re-run until all checks pass

## Testing

Tests are executable specifications and provide precise feedback for AI-generated code.

**Run tests after implementing features:**
```bash
bun test
```

**Why tests matter for AI development:**
- Test failures tell you exactly what's broken: test name, file:line, expected vs actual
- Tests define "done"—write them first when possible
- Fast execution (~10x faster than Jest) enables frequent runs
- Coverage reports (80% threshold) show gaps

**Test file conventions:**
- Place tests next to source: `format.ts` → `format.test.ts`
- Use `describe` and `it` blocks from `bun:test`
- React components: use `@testing-library/react` with `render`, `screen`, `userEvent`

**Self-correction with tests:**
1. Write test defining expected behavior
2. Implement the feature
3. Run `bun test`
4. If test fails, read the diff (expected vs actual)
5. Fix and re-run until green

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Biome for linting and formatting
- shadcn/ui for components
- Bun test runner with React Testing Library
- Supabase (auth + postgres)
- Drizzle ORM (type-safe database access)

## Database Commands

```bash
bun run db:generate  # Generate migrations from schema changes
bun run db:migrate   # Run pending migrations
bun run db:push      # Push schema directly (dev only)
bun run db:studio    # Open Drizzle Studio GUI
```

## Supabase + Drizzle Setup

**Key files:**
- `src/core/config/env.ts` - Validated environment variables
- `src/core/database/schema.ts` - Drizzle schema definitions
- `src/core/database/client.ts` - Database client
- `src/core/supabase/server.ts` - Server-side Supabase client
- `src/core/supabase/client.ts` - Browser-side Supabase client
- `src/core/supabase/proxy.ts` - Session refresh logic
- `src/proxy.ts` - Next.js 16 proxy entry point (replaces middleware.ts)
- `src/features/auth/` - Shared auth actions and hooks

**Important patterns (learned from setup):**

1. **Key naming transition**: Supabase is migrating from `ANON_KEY` to `PUBLISHABLE_KEY`. Our setup supports both - use whichever your project provides.

2. **Server client cookies**: The `setAll` must be wrapped in try/catch because it can be called from Server Components where cookies cannot be set:
   ```typescript
   setAll(cookiesToSet) {
     try {
       // set cookies
     } catch {
       // Ignore: called from Server Component
     }
   }
   ```

3. **Middleware response pattern**: Must create new response inside `setAll` callback:
   ```typescript
   setAll(cookiesToSet) {
     supabaseResponse = NextResponse.next({ request });
     // then set cookies on supabaseResponse
   }
   ```

4. **Connection pooler for serverless**: Use port 6543 (transaction pooler) with `prepare: false`:
   ```typescript
   postgres(url, { prepare: false })
   ```

5. **Server Actions with `useActionState`** (React 19): Actions must take `(prevState, formData)`:
   ```typescript
   // Wrong - will cause type errors
   async function login(formData: FormData) { ... }

   // Correct
   async function login(_prevState: LoginState, formData: FormData) { ... }
   ```

6. **Auth route groups**: `(auth)` and `(dashboard)` layouts handle redirects. Check auth in layout, not each page.

7. **Users table trigger**: Run SQL in Supabase dashboard to sync `auth.users` → `public.users`. See `src/core/database/schema.ts` for the trigger code.

## shadcn/ui Components

Components are copied into `src/components/ui/` - you can read and modify them directly.

**Add new components:**
```bash
bunx shadcn@canary add <component-name>
```

**Examples:**
```bash
bunx shadcn@canary add button
bunx shadcn@canary add dialog alert-dialog
```

**After adding components, run `bun run lint:fix`** to format them to match our style.

**Component locations:**
- `src/components/ui/` - shadcn primitives (button, dialog, etc.)
- `src/components/` - app-level components (theme-provider, theme-toggle)
- `src/shared/components/` - custom shared components
- `src/lib/utils.ts` - `cn()` utility for merging Tailwind classes

## Code Style

- 2-space indentation, 100 char line width, double quotes
- Use named exports (default exports only for Next.js pages/layouts/config files)
- Use `type` imports/exports for type-only references
- Use `const` over `let` when possible
- Path aliases: `@/*`, `@/core/*`, `@/features/*`, `@/shared/*` map to `./src/*`

## Rules That Will Fail Checks

**Errors (must fix):**
- Unused imports, variables, or parameters
- Using `==` instead of `===`
- Using `let` when value never changes (use `const`)
- Missing `type` keyword on type-only imports/exports
- Using `dangerouslySetInnerHTML` or `eval()`
- Missing braces on if/else statements

**Warnings (should fix):**
- Using `console.log` (remove or use structured logger)
- Using `any` type (add proper types)
- Default exports in non-Next.js files (use named exports)
- Using `.forEach()` (use `for...of` loop instead)
- Overly complex functions

## Logging

Use `getLogger("domain.component")` and the `action_state` message pattern:
```typescript
const logger = getLogger("communities.service");
logger.info({ communityId }, "community.create_started");
logger.info({ communityId }, "community.create_completed");
logger.error({ communityId, error }, "community.create_failed");
```
States: `_started`, `_completed`, `_failed`. This makes logs grep-able and traceable.

## Zod v4

Import from `zod/v4`, not `zod`:
```typescript
import { z } from "zod/v4";
```
`z.record` requires two args: `z.record(z.string(), z.unknown())` not `z.record(z.unknown())`.
