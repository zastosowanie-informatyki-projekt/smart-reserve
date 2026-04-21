# Design: Floor-plan toilet, accessibility flag, invitation re-send bug

Date: 2026-04-21

Three independent changes bundled into one design doc because they are small, share no architectural boundaries, and the user requested them together.

## Task 1 — Toilet decoration + editable door/window/toilet labels

### Problem

The floor-plan editor supports placing `door`, `window`, and `wall` decorations with hardcoded labels (`"DOOR"`, `"WINDOW"`, `"WALL"`). There is no toilet preset and no way to rename a specific door/window (e.g., "Emergency exit" or "Kitchen door"). The floor-plan JSON schema already persists a `label` field per decoration, so adding an edit UI requires no schema change.

### Scope

- Add `toilet` preset (behaves like `door`: a single rectangular tile).
- Add a small inline "Label" input in the selected-decoration panel for `door`, `window`, and `toilet` (walls stay label-less).
- Public viewer renders the new toilet style.

### Changes

1. `app/(auth)/dashboard/[id]/floor-plan/_components/types.ts`
   - Extend `DecorationPreset` to `"door" | "window" | "wall" | "toilet"`.

2. `app/(auth)/dashboard/[id]/floor-plan/_components/floor-plan-editor.tsx`
   - `handleAddDecoration`: add toilet branch. Default tile: `60×40` rect, fill `#e0f2fe`, stroke `#0369a1`, label `"TOILET"`.
   - Selected-decoration panel: for labels `DOOR | WINDOW | TOILET`, render a small `Input` bound to `el.label` that calls `handleElementChange(id, { label: newValue })`.
   - Display name mapping: add `"TOILET" → "Toilet"` alongside existing Door/Window/Wall mapping.

3. `app/(auth)/dashboard/[id]/floor-plan/_components/room-selector.tsx`
   - Add `+ Toilet` button in the Decorations section, wired to `onAddDecoration("toilet")`.

4. `app/(public)/restaurants/[id]/_components/floor-plan-viewer.tsx`
   - `DecorationNode`: detect toilet by either (a) the current label string starting with "TOILET"/"Toilet" style check, or (b) render by fill/stroke fallback. We'll switch to: detect toilet via a case-insensitive label check (`el.label?.toUpperCase() === "TOILET"`) and apply toilet color palette. For editable labels this must be tolerant, so we fall back to `el.fill` / `el.stroke` (already stored per-element) if the label was customized. Simpler: **rely on the stored `fill`/`stroke` on the element**, and only use the hardcoded door/window palette when fill/stroke are absent. This naturally handles renamed decorations.

   Refactor note: right now the viewer overrides `fill`/`stroke` based on label for door/window. That means renaming a door to "Main Entrance" would lose its color. Fix: trust `el.fill` / `el.stroke` first, then fall back to label-based defaults only when absent. Keeps existing behavior for pre-existing data (those rows have fill/stroke set by `handleAddDecoration`).

### Edge cases

- Existing saved decorations already have `fill`/`stroke` stored per-element in the floor-plan JSON — so the viewer refactor keeps them looking the same.
- Empty label after edit: allowed; the viewer just doesn't render the text.
- Max label length: keep loose (no hard limit) — user-facing constraint is the rectangle width.

## Task 2 — `hasDisabledFacilities` boolean on Restaurant

### Scope

Display-only field (YAGNI: no search filter yet). Add to schema, create/edit forms, and public overview card.

### Changes

1. `prisma/schema.prisma`
   - Add `hasDisabledFacilities Boolean @default(false)` to `Restaurant`.

2. New migration `prisma/migrations/<timestamp>_add_restaurant_disabled_facilities/migration.sql`
   - `ALTER TABLE "restaurant" ADD COLUMN "hasDisabledFacilities" BOOLEAN NOT NULL DEFAULT false;`

3. `server/restaurants/schemas/restaurant.schema.ts`
   - Add `hasDisabledFacilities: z.boolean().optional().default(false)` to `createRestaurantSchema`. (`updateRestaurantSchema` already extends as partial.)

4. `server/restaurants/actions/create-restaurant.ts` + `update-restaurant.ts`
   - Parse `hasDisabledFacilities` from `formData.get("hasDisabledFacilities") === "on"` (standard HTML checkbox convention).

5. `server/restaurants/repositories/restaurant.repository.ts`
   - Add `hasDisabledFacilities` to the `select` blocks of `create`, `update`, and `findById`.

6. `app/(auth)/dashboard/new/_components/create-restaurant-form.tsx` and `app/(auth)/dashboard/[id]/_components/edit-restaurant-form.tsx`
   - Add a checkbox labeled "Wheelchair accessible / facilities for people with disabilities".
   - In edit form, extend props to include `hasDisabledFacilities: boolean` and set `defaultChecked`.

7. `app/(auth)/dashboard/[id]/page.tsx`
   - Pass `restaurant.hasDisabledFacilities` into `<EditRestaurantForm restaurant={...} />`.

8. `app/(public)/restaurants/[id]/_components/restaurant-overview-card.tsx`
   - Accept `hasDisabledFacilities: boolean` prop. When true, show a badge/row with an `Accessibility` icon (lucide-react has `Accessibility`) and text "Wheelchair accessible".

9. `app/(public)/restaurants/[id]/page.tsx`
   - Pass the new field through.

### Copy

- Form label: "Wheelchair accessible (facilities for people with disabilities)"
- Public badge text: "Wheelchair accessible"

## Task 3 — Prisma unique-constraint error on re-invitation

### Root cause

`EmployeeInvitation` has `@@unique([userId, restaurantId])`. When a user's invitation is accepted, the row stays with `acceptedAt` set. When the user later removes themselves from the restaurant, `RestaurantEmployee` is deleted but the old invitation row remains. `invitationRepository.create()` does a plain `.create()`, so re-inviting throws Prisma `P2002`.

### Fix

Replace `.create()` in `invitationRepository.create` with an upsert keyed on the composite unique index, resetting the timestamps so the re-invitation behaves exactly like a fresh one.

```ts
async create(data: { restaurantId: string; userId: string }) {
  return prisma.employeeInvitation.upsert({
    where: {
      userId_restaurantId: { userId: data.userId, restaurantId: data.restaurantId },
    },
    create: data,
    update: {
      acceptedAt: null,
      declinedAt: null,
      createdAt: new Date(),
    },
    select: { /* same as before */ },
  });
}
```

The service layer's pre-checks (already-employee, already-pending) are preserved, so the only new path this opens is: "re-invite a user whose old invitation was accepted or declined" — which is the exact scenario the user hit.

### Why upsert over delete-then-create

- Atomic in a single SQL statement (no race between delete and create).
- Simpler than introducing a `prisma.$transaction`.
- Preserves the `id` of the old row if still present? No — Prisma upsert does an `UPDATE` when matched, so the `id` stays. That's actually slightly nicer (stable foreign-key target for any future reference), though nothing currently references old invitations.

### Edge cases

- Re-inviting someone who currently has a pending invitation is blocked by the service-level check (line 20–27 of `invitation.service.ts`) — upsert never runs for that path.
- Re-inviting a current employee is blocked by the service-level `alreadyEmployee` check.

## Testing plan

Not writing automated tests (no test harness in repo). Manual verification steps:

1. **Task 1:**
   - Floor plan editor: place a door, window, wall, and toilet; rename door to "Emergency"; save; reload; verify label and color persist. Reopen editor after reload; verify shapes and custom labels still render in the public viewer.

2. **Task 2:**
   - Create a new restaurant with the checkbox ticked; verify `hasDisabledFacilities` in DB.
   - Edit existing restaurant, toggle checkbox on/off, save, refresh; verify persisted.
   - Visit public page; verify badge appears/disappears according to flag.

3. **Task 3:**
   - Owner invites user A; user A accepts; user A removes self (or owner removes them); owner invites user A again. Expect success (old repro: P2002 error).
   - Owner invites user B; user B declines; owner invites user B again. Expect success.
   - Owner tries to invite a currently-employed user — still rejected with "already an employee".
   - Owner tries to invite someone who already has a pending invitation — still rejected with "already has a pending invitation".

## Non-goals

- Search/filter public restaurants by accessibility flag.
- Showing accessibility in restaurant list cards. (Could add in a follow-up.)
- Cleaning up historical accepted/declined invitation rows (they're now effectively ignored thanks to upsert).
