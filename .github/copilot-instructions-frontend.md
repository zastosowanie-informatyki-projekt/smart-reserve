# Frontend Instructions

## UI Components

- Always use **shadcn/ui** components. Do not create custom components for things shadcn already provides (Button, Dialog, Input, Select, Card, etc.).
- If a required shadcn component is not yet installed, install it before using:
  ```bash
  npx shadcn@latest add <component-name>
  ```
  Example — need a dialog:
  ```bash
  npx shadcn@latest add dialog
  ```

## React Patterns

- **Do NOT use `useCallback` or `useMemo`** unless there is a clearly measured performance problem. Prefer simplicity over premature optimization.
- **Do NOT use `React.memo`**. If a component re-renders too often, fix the architecture instead of wrapping it in memo.
- **Extract parts into separate components.** Keep components small and focused on a single responsibility. If a section of JSX grows beyond ~50 lines or has its own state/logic, extract it into its own component file.

## Styling

- Use Tailwind CSS utility classes. Avoid custom CSS unless absolutely necessary.
