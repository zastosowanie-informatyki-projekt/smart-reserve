# Project Instructions

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS

## Code Style

- Use TypeScript strictly — no `any` types.
- Prefer named exports over default exports.
- Use `async`/`await` over `.then()` chains.
- Colocate related files (component, types, utils) in the same directory when possible.
- **Do NOT create `index.ts` barrel files** for re-exporting. Import directly from the source file.
- Prefer `interface` over `type` for manually written types. Use `type` only when required (e.g., `z.infer<>`, union types, mapped types).

## Next.js Server/Client Boundaries

- Do not call client-only utilities/functions from Server Components, server actions, or other server files.
- Before importing from a module, check whether it contains `"use client"`; if it does, treat all exports in that module as client-only.
- If a server file needs styling from a client module (e.g. `buttonVariants`), either:
  - use static class names directly in the server file, or
  - move that UI fragment to a dedicated Client Component and render it from the server.
- After layout/navigation changes, run `npx tsc --noEmit` and verify there are no server/client boundary errors.

## Domain-Specific Instructions

Detailed rules are split by domain — see files referenced in `opencode.json`:

- **Architecture** (all files): `.github/instructions/architecture.instructions.md`
- **Backend** (`server/`, `lib/`): `.github/instructions/backend.instructions.md`
- **Frontend** (`app/`, `components/`, `hooks/`): `.github/instructions/frontend.instructions.md`
