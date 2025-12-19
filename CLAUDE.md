# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev        # Start development server
bun run build      # Production build
bun run lint       # Check for lint/format errors (Biome)
bun run lint:fix   # Auto-fix lint/format issues
bun run format     # Format all files
```

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Biome for linting and formatting

## Code Style

- 2-space indentation, 100 char line width, double quotes
- Use named exports (default exports only for Next.js pages/layouts/config files)
- Use `type` imports/exports for type-only references
- Use `const` over `let` when possible
- Avoid `console.log` (use structured logging)
- Path alias: `@/*` maps to `./src/*`
