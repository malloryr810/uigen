# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server at http://localhost:3000 (uses Turbopack)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Run all tests (Vitest)
npx vitest run <file>  # Run a single test file
npm run db:reset       # Reset and re-run all migrations (destructive)
npx prisma migrate dev # Run pending migrations
npx prisma generate    # Regenerate Prisma client after schema changes
```

The dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` (handled by npm scripts). Tests run in jsdom via Vitest.

## Architecture

This is a Next.js 15 App Router application where users describe React components in a chat, the AI generates them using tool calls, and the result is previewed in real time — all without writing any files to disk.

### Request / AI flow

1. `src/app/api/chat/route.ts` — the single POST endpoint. It receives the current chat messages plus the serialized virtual filesystem, reconstructs a `VirtualFileSystem`, calls `streamText` (Vercel AI SDK) with up to 40 steps, and streams the response back. On finish it persists messages + filesystem to the database for authenticated users.
2. `src/lib/provider.ts` — returns either `anthropic("claude-haiku-4-5")` (when `ANTHROPIC_API_KEY` is set) or a `MockLanguageModel` that generates static counter/form/card components. The mock is used when no API key is present.
3. `src/lib/prompts/generation.tsx` — the system prompt. Key rules: always create `/App.jsx` first, use Tailwind for styling, use `@/` alias for all local imports, no HTML files.

### Virtual filesystem

`src/lib/file-system.ts` exports `VirtualFileSystem` — an in-memory tree of `FileNode` objects. It never touches disk. The class supports CRUD, rename (with recursive child path updates), serialization to/from plain objects (for JSON transport), and text editor commands (`viewFile`, `replaceInFile`, `insertInFile`) that the AI tools call.

The AI has two tools wired up in the chat route:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/view/str_replace/insert commands on the VFS
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete commands on the VFS

### Client-side state

Two React contexts wrap the editor UI:

- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — holds the `VirtualFileSystem` instance, selected file path, and a `refreshTrigger` counter. `handleToolCall` is the bridge: it receives tool calls from the AI stream and applies them to the VFS, which increments `refreshTrigger`.
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps `useChat` from `@ai-sdk/react`, passing serialized filesystem state as the request body on every message. Tool calls from the stream are forwarded to `FileSystemContext.handleToolCall`.

### Live preview

`src/components/preview/PreviewFrame.tsx` watches `refreshTrigger` and re-renders an `<iframe srcdoc>` on every change. It calls `createImportMap` + `createPreviewHTML` from `src/lib/transform/jsx-transformer.ts`, which:
1. Transforms all JSX/TSX files via `@babel/standalone`
2. Creates Blob URLs for each transformed file
3. Builds an ES module import map (local files → blob URLs, third-party packages → `esm.sh`, `@/` alias support)
4. Generates an HTML document that bootstraps React 19 via ESM and mounts the app into `#root`

The iframe uses `sandbox="allow-scripts allow-same-origin allow-forms"` (same-origin is required for blob URL imports).

### Auth & persistence

- `src/lib/auth.ts` — JWT-based session in an httpOnly cookie (`auth-token`), 7-day expiry, signed with `JWT_SECRET` env var.
- `src/middleware.ts` — protects routes.
- Prisma + SQLite (`prisma/dev.db`). Schema: `User` (email/password) → `Project` (name, messages JSON, data JSON). The Prisma client is generated into `src/generated/prisma`.
- Anonymous users can generate components; work is tracked via `src/lib/anon-work-tracker.ts` (localStorage) and can be claimed on sign-up.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | If absent, mock provider is used |
| `JWT_SECRET` | No | Defaults to `"development-secret-key"` |
