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
