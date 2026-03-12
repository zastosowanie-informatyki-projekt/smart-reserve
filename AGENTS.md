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

## Domain-Specific Instructions

Detailed rules are split by domain — see files referenced in `opencode.json`:

- **Architecture** (all files): `.github/instructions/architecture.instructions.md`
- **Backend** (`server/`, `lib/`): `.github/instructions/backend.instructions.md`
- **Frontend** (`app/`, `components/`, `hooks/`): `.github/instructions/frontend.instructions.md`
