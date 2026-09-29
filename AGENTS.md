# Stencil

Open **this git root** as the Cursor workspace (the folder that contains `readme.md` and `server/`). Project rules live in `.cursor/rules/` and only bind correctly from that root.

This repository contains `server/generation` (XML schema + generator) and `server/api` (NestJS + React admin). There is no `app/` mobile tree. Ignore docs that assume `app/src/`.

## How to work

1. Teach the Stencil workflow. Do not invent a parallel source of truth next to the XML schema.
2. Before entity, API, or CRUD work, read `server/api/ai/ruleset.md`, then `server/api/ai/code-generation.md`.
3. Schema changes go in `server/generation/xml/stencil-entities.xml`. Then run `server/generation/tools/code-generator-cli.exe` (or `src/generate.ps1` / `src/generate.sh` if it is not built yet). Do not hand-edit files the generator rewrites (`.base.ts`, `*.model.ts`, `*.schema.ts`, admin list/editor, frontend models and API hooks).
4. Custom logic goes in the extension files the generator creates once and then skips: `*.manager.ts`, `*.controller.ts`.
5. When explaining generation, describe that log line (Created/Updated vs Skipping existing file). Do not teach `STARTFILE`, `ENSUREFILE`, or `ENDFILE` unless someone is editing an XSL template. Those markers are stripped before the file is written.
6. Hard safety rules always apply: body sanitization, jurisdiction from `request.account`, dual-homed `local_account_id`, tombstones, privacy logging, named contracts, additive schema, strict XML types.

Long-form patterns: `server/api/ai/`. What Stencil gives you: `server/api/ai/enterprise-features.md`. Strict enforcement: `.cursor/rules/`. Optional practice track: `docs/training/`.

## Cursor Cloud specific instructions

The image provides Node.js 24 at `/usr/local/lib/nodejs/bin` and the .NET 8 SDK at `~/.dotnet`. Prepend both to `PATH` and set `DOTNET_ROOT=$HOME/.dotnet` before `npm` or `dotnet`. The default `node` on `PATH` can be older than `server/api/backend/package.json` `engines` (`>=23.4.0`).

Local run matches `readme.md`: from `server/api`, `npm ci`, copy `backend/.env.example` and `frontend/.env.example` to `.env` when missing, then `npm start` (UI `:3000`, API `:3001`). Leave `SHARED_MONGO_URI` and Firebase blank so the API uses in-memory MongoDB and username `dev` / password `dev-secret`. Seed with `GET http://localhost:3001/api/platform/bootstrap` before the first sign-in. Build the generator with `server/generation/tools/src/build.sh`, then run `server/generation/tools/code-generator-cli` with no arguments. `code-generator.config.xml` stores Windows relative paths; the CLI normalizes `\` before resolving them. The config sets `WindowsLineEndings`, so a generation run can rewrite files as CRLF. Treat a huge generated-file diff as line endings unless `git diff --ignore-cr-at-eol` shows a real change.

`server/api/backend/src/entities/fulldate/fulldate.utils.spec.ts` daylight-saving cases assume `TZ=America/New_York`. The rest of the unit tests and `npm run test:e2e` pass with `TZ=UTC`.
