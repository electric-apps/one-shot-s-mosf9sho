# Plan: Todo App

A real-time todo list app built on TanStack Start + Electric SQL. Users can create, complete, and delete todos; all changes sync instantly across browser tabs via Electric shapes.

## User Flows

1. On load, the user sees a list of all todos, synced in real-time from Postgres via Electric.
2. The user types a title in the input field and presses Enter (or clicks Add) to create a new todo.
3. The user clicks a checkbox next to a todo to toggle it complete/incomplete.
4. The user clicks a delete button on a todo to remove it permanently.
5. Completed todos are visually distinguished (strikethrough text, muted color).

## Data Model

```ts
// src/db/schema.ts
export const todos = pgTable("todos", {
  id:          text("id").primaryKey(),
  title:       text("title").notNull(),
  completed:   boolean("completed").notNull().default(false),
  created_at:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at:  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## Key Technical Decisions

- **Sync**: An Electric shape proxy at `src/routes/api/todos.ts` (GET) forwards shape requests from `ShapeStream` to Electric Cloud, injecting the server-side secret. The client `todosCollection` subscribes to this shape.
- **Collection**: `src/db/collections/todos.ts` defines a TanStack DB collection over the Electric shape. Components use `useLiveQuery` with `eq()` from `@tanstack/db` for reactive reads.
- **Mutations**: Create / toggle / delete are sent via `POST/PUT/DELETE` to `src/routes/api/todos.ts` server handlers which write to Postgres; Electric syncs the change back to all clients.
- **IDs**: Client-generated UUIDs (`crypto.randomUUID()`) so optimistic inserts can be applied immediately.
- **SSR**: The main page route sets `ssr: false` (uses `useLiveQuery`). The root layout stays SSR-enabled.
- **Styling**: Tailwind 4 + shadcn/ui `Input`, `Button`, `Checkbox`, and `Card` components for a clean, minimal UI.

## Implementation Phases

### Phase 1 — Schema & Migrations
- Add `todos` table to `src/db/schema.ts`.
- Add Zod validators for todo insert/update in `src/db/zod-schemas.ts`.
- Run `drizzle-kit generate && drizzle-kit migrate` to create the table.

### Phase 2 — API Routes
- `src/routes/api/todos.ts`:
  - `GET` — Electric shape proxy (forwards to Electric Cloud with secret).
  - `POST` — Insert a new todo (validate with Zod, write to Postgres).
  - `PUT` — Toggle `completed` and update `updated_at` for a todo by `id`.
  - `DELETE` — Delete a todo by `id`.

### Phase 3 — Collection
- `src/db/collections/todos.ts` — TanStack DB collection backed by the Electric shape at `/api/todos`.

### Phase 4 — UI
- `src/routes/index.tsx` — Main page (`ssr: false`):
  - `AddTodoForm` component: controlled input + submit button; calls `POST /api/todos` then `collection.insert(...)`.
  - `TodoList` component: `useLiveQuery` over `todosCollection`; renders `TodoItem` for each todo.
  - `TodoItem` component: checkbox (calls `PUT /api/todos`), title with strikethrough when completed, delete button (calls `DELETE /api/todos`).
  - Use `useToast()` for error feedback.

### Phase 5 — Build & Verify
- Run `pnpm build` to confirm no TypeScript or Vite errors.
- Run `node scripts/preflight.mjs` to pass SSR-safety checks.

### Phase 6 — Tests
- `tests/todos.test.ts` using Vitest:
  - `generateValidRow` / `generateRowWithout` helpers for the todos schema.
  - Unit tests: schema shape (required fields, defaults), Zod validator accepts valid rows and rejects missing title.

### Phase 7 — README
- Update `README.md` with: what the app does, how to run locally (`pnpm dev`), and required env vars (`DATABASE_URL`, `ELECTRIC_SOURCE_ID`, `ELECTRIC_SECRET`).
