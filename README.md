# TimeFlow

TimeFlow is a modern time-tracking and project management web app designed to make logging work hours simple and effortless. It helps users track their time, manage projects, monitor tasks, and understand their workload through a clear, centralized dashboard.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Offline Mode & AI Assistant Configuration

### 1. Offline Logging & Installable App (PWA)
- TimeFlow registers a Service Worker (`public/sw.js`) and Web App Manifest (`public/manifest.webmanifest`) so the app shell and core screens load offline after the user has opened the app online at least once.
- Signed-in users' project lists and queued offline work logs are persisted in IndexedDB (`timeflow_offline_db`) strictly scoped by `userId`.

### 2. Backend AI Provider Settings (`server/.env`)
AI-assisted task logging (`POST /api/ai/draft-task`) and weekly summary drafting (`POST /api/ai/weekly-summary`) route exclusively through the backend (`server/src/modules/ai/`). **Never place AI API keys in frontend `VITE_*` variables.**

Configure the following optional environment variables in `server/.env`:
```env
AI_ENABLED=true
AI_PROVIDER=gemini            # "gemini" (default) or "openai"
AI_API_KEY=                   # Or GEMINI_API_KEY / OPENAI_API_KEY (never commit secrets)
AI_MODEL=gemini-2.5-flash     # Or "gpt-4o-mini" when AI_PROVIDER=openai
AI_BASE_URL=                  # Optional custom endpoint override
```
If no external `AI_API_KEY` is provided while `AI_ENABLED=true`, the backend falls back to a deterministic structured-drafting formatter so local development and demo environments work without external credentials.

