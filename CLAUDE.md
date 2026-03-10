# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run db:reset     # Reset the SQLite database
```

## Architecture

UIGen is an AI-powered React component IDE. Users describe components in a chat interface; Claude generates/edits code using tool calls; a live iframe preview renders the result.

### Data Flow

```
User Chat → POST /api/chat → Claude AI (with tools) → Tool calls processed by FileSystemProvider
→ VirtualFileSystem (in-memory) updated → jsx-transformer converts JSX → iframe preview
→ (Authenticated) Prisma saves to SQLite
```

### Key Subsystems

**`src/app/api/chat/route.ts`** — Core AI endpoint. Uses Vercel AI SDK `streamText()` with two tools:
- `str_replace_editor`: Create/view/edit files (commands: `view`, `create`, `str_replace`, `insert`, `undo_edit`)
- `file_manager`: Rename/delete files

**`src/lib/file-system.ts`** — `VirtualFileSystem` class. All file operations are **in-memory only** (no disk I/O). Supports serialize/deserialize for persistence.

**`src/lib/contexts/file-system-context.tsx`** — React Context wrapping VirtualFileSystem. Processes AI tool call results and triggers UI refresh.

**`src/lib/contexts/chat-context.tsx`** — React Context for chat state. Uses Vercel AI SDK `useChat` hook and passes current file contents to each request.

**`src/lib/transform/jsx-transformer.ts`** — Transforms JSX/TSX → executable JS using `@babel/standalone`. Creates HTML with import maps pointing to `esm.sh` for iframe execution.

**`src/lib/provider.ts`** — Returns `getLanguageModel()`. Uses `claude-haiku-4-5` if `ANTHROPIC_API_KEY` is set; otherwise falls back to a `MockLanguageModel` for demo/testing.

**`src/app/main-content.tsx`** — Three-panel layout (react-resizable-panels): chat left, preview/code-editor right. Entry point for the UI.

### Auth & Persistence

- JWT sessions via `jose` (7-day expiry, stored in cookies) — `src/lib/auth.ts`
- Server actions in `src/actions/`: `signUp`, `signIn`, `signOut`, project CRUD
- Prisma + SQLite: two models — `User` and `Project` (stores `messages` and file `data` as JSON)
- Anonymous users get no persistence; projects save only for authenticated users

### AI Prompt & Constraints

- System prompt in `src/lib/prompts/generation.tsx`
- AI generates React components in `/App.jsx` as the entry point
- All components must use Tailwind CSS for styling
- Alias `@/` maps to `src/` for imports within generated files
