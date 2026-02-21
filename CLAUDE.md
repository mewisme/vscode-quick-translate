# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install             # Install dependencies
pnpm run compile         # Type-check + lint + build (dev)
pnpm run package         # Type-check + lint + build (production, minified)
pnpm run watch           # Watch mode: esbuild + tsc in parallel
pnpm run lint            # ESLint (src/ only)
pnpm run check-types     # tsc --noEmit
pnpm run test:translate  # Unit tests for translator (tsx, no VS Code needed)
pnpm run test            # Full VS Code integration tests (requires Electron)
```

Releases use `standard-version`:
```bash
pnpm run release         # Auto-detect bump
pnpm run release:patch / release:minor / release:major
```

Publishing:
```bash
pnpm run publish:vsce    # VS Code Marketplace
pnpm run publish:ovsx    # Open VSX
```

## Architecture

Single-entry TypeScript bundle: `src/extension.ts` → `dist/extension.js` via esbuild (`esbuild.js`). `vscode` is external. The `main` field in `package.json` points to `dist/extension.js`.

### Data flow for a translation

1. User triggers a command → `src/command/translate-command.ts`
2. Config read from `src/config/get-config.ts` → `QuickTranslateConfig`
3. Input optionally normalized via `src/normalize/normalize-input.ts` (camelCase, snake_case, etc.)
4. API call to `src/translator/translate.ts` (v1, Google JSON API) or `src/translator/translate-v2.ts` (v2, mobile HTML fallback)
5. Result stored in the shared `HoverStateController` (`src/hover/hover-state.ts`)
6. `TranslationViewCoordinator` (`src/view/renderer.ts`) selects the renderer based on `viewMode`
7. Renderer (`HoverRenderer` / `PanelRenderer` / `InlineRenderer`) displays the result

### Shared state

`HoverStateController` is created once in `extension.ts` and injected into every command and the hover provider. It is the single mutable store for the last translation result. `HoverProvider` (`src/hover/hover-provider.ts`) reads from it when VS Code fires a hover event over the stored range.

### Module map

| Path | Purpose |
|---|---|
| `src/command/` | One file per registered VS Code command |
| `src/view/` | Three renderers (`HoverRenderer`, `PanelRenderer`, `InlineRenderer`) + coordinator |
| `src/hover/` | Shared `HoverStateController` + `HoverProvider` registration |
| `src/translator/` | Google Translate v1 (`translate.ts`) and v2 (`translate-v2.ts`) API wrappers; `error-messages.ts` for shared error constants |
| `src/normalize/` | `normalize-input.ts` (transforms identifiers), `normalize-config.ts` (extracts `NormalizeOptions` from config) |
| `src/config/` | Reads `quickTranslate.*` workspace settings |
| `src/types/` | Shared interfaces (`internal-types.ts`, `renderer-types.ts`) |
| `src/preload/` | Warms up the translator on extension activation |
| `src/output-channel.ts` | Singleton "Quick Translate" output channel; use `logToChannel()` for diagnostic logging |
| `src/status-bar.ts` | Status bar item showing current target language; refreshes on config changes |

### Adding a new command

1. Create `src/command/<name>-command.ts` exporting a factory `run<Name>Command(...)`
2. Import and register in `src/extension.ts` via `vscode.commands.registerCommand` inside `context.subscriptions.push(...)`
3. Declare in `package.json` under `contributes.commands` (and `menus` if needed)

### Adding a new renderer

Implement the `TranslationRenderer` interface from `src/types/renderer-types.ts` (`render(context: RenderContext): Promise<void>`), then add it to the coordinator switch in `src/view/renderer.ts`.

## Tooling

- **Package manager:** pnpm (enforced via `.npmrc`)
- **Bundler:** esbuild — CJS output, sourcemaps in dev, minified in production
- **Linter:** ESLint flat config (`eslint.config.mjs`) — TypeScript rules + `curly`, `eqeqeq`, `semi`
- **Commits:** Conventional Commits enforced by commitlint + husky
- **Changelog:** `standard-version`
