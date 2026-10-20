# Notes App

Workspace-based note taking: nested folders, a rich-text editor, and fast document search.

## Features

- **Workspaces** — membership-scoped containers with isolated folders and documents.
- **Nested folders** — create, rename, move (drag-and-drop), and delete.
- **Document editor** — BlockNote rich text with debounced autosave, pin, and archive.
- **Search** — title, body, and folder-path matching with ranked results, highlighted snippets, and 300 ms debounce.
- **Auth** — GitHub OAuth via Better Auth; every workspace-scoped query checks membership.
- **UI** — three-pane layout, dark/light themes, skeletons, and Suspense streaming.

## Stack

Next.js 16 (App Router, RSC, Cache Components, React Compiler) · React 19 · TypeScript · Tailwind CSS v4 · tRPC · TanStack Query · Drizzle ORM · PostgreSQL · Better Auth · BlockNote · Vitest

## Architecture

Feature-first layout under `src/features`. Client/server boundary is type-safe end to end: tRPC procedures validate input with Zod and reuse a `workspaceProcedure` middleware for membership checks.

Search runs server-side against a derived plain-text projection (`document_search`) of BlockNote JSON, indexed with `pg_trgm` GIN indexes. The query is split into tokens; every token must match the title, body, or folder path. Results rank title-prefix → title-contains → folder → body, then recency, and return only `id`, `title`, `folderPath`, and a snippet. See [`docs/adr/0001-server-side-document-search.md`](docs/adr/0001-server-side-document-search.md).

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in database and GitHub OAuth values
pnpm db:ensure-trgm    # enable pg_trgm
pnpm db:push           # create tables and indexes
pnpm db:seed           # optional sample data
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Purpose              |
| ---------------- | -------------------- |
| `pnpm dev`       | Development server   |
| `pnpm build`     | Production build     |
| `pnpm check`     | Lint + typecheck     |
| `pnpm test`      | Unit tests (Vitest)  |
| `pnpm db:studio` | Inspect the database |
