# Todo App

A real-time todo list app built on TanStack Start + Electric SQL. Create, complete, and delete todos — all changes sync instantly across browser tabs via Electric shapes.

## What it does

- Add todos by typing a title and pressing Enter or clicking Add
- Toggle todos complete/incomplete with a checkbox (strikethrough + muted text when done)
- Delete todos with the × button
- All changes sync in real-time across browser tabs via Electric SQL shapes

## Running locally

```bash
pnpm install
pnpm dev
```

App runs at http://localhost:5174.

## Required environment variables

```
DATABASE_URL=postgresql://...        # Postgres connection string
ELECTRIC_SOURCE_ID=<your-id>         # Electric Cloud source ID
ELECTRIC_SECRET=<your-secret>        # Electric Cloud auth secret
```

Copy `.env.example` to `.env` and fill in the values before running.
