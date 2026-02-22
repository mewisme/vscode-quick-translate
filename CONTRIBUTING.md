# Contributing to VSCode Quick Translate

Thank you for your interest in contributing! This document covers everything you need to get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/mewisme/vscode-quick-translate.git
   cd vscode-quick-translate
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

> **Note:** This project uses [pnpm](https://pnpm.io/). Make sure it is installed (`npm install -g pnpm`) before running the above command.

---

## Development Setup

### Available commands

| Command | Description |
|---|---|
| `pnpm run compile` | Type-check + lint + build (dev) |
| `pnpm run watch` | Watch mode: esbuild + tsc in parallel |
| `pnpm run package` | Type-check + lint + build (production, minified) |
| `pnpm run lint` | Run ESLint on `src/` |
| `pnpm run check-types` | Run TypeScript type-check only (`tsc --noEmit`) |
| `pnpm run test:translate` | Unit tests for the translator (no VS Code required) |
| `pnpm run test:unit` | Unit tests for all units (no VS Code required) |
| `pnpm run test` | Full VS Code integration tests (requires Electron) |

### Running the extension locally

1. Open the project folder in VS Code.
2. Press `F5` to launch the **Extension Development Host**.
3. The extension will be active in the new VS Code window that opens.

### Watching for changes

```bash
pnpm run watch
```

This runs esbuild in watch mode alongside `tsc --noEmit --watch`, so you get incremental builds and type errors in real time. Reload the Extension Development Host window (`Ctrl+R` / `Cmd+R`) after each rebuild.

---

## Project Structure

```
src/
├── command/        # One file per registered VS Code command
├── config/         # Reads quickTranslate.* workspace settings
├── hover/          # HoverStateController + HoverProvider
├── normalize/      # Text normalization (camelCase, snake_case, etc.)
├── preload/        # Warms up the translator on extension activation
├── translator/     # Google Translate v1 and v2 API wrappers
├── types/          # Shared interfaces
├── utils/          # Utility helpers
├── view/           # HoverRenderer, PanelRenderer, InlineRenderer + coordinator
├── extension.ts    # Entry point — registers commands and providers
├── output-channel.ts
└── status-bar.ts
```

For a full architecture overview, refer to [CLAUDE.md](./CLAUDE.md).

---

## Making Changes

### Adding a new command

1. Create `src/command/<name>-command.ts` exporting a factory `run<Name>Command(...)`.
2. Import and register it in `src/extension.ts` via `vscode.commands.registerCommand` inside `context.subscriptions.push(...)`.
3. Declare it in `package.json` under `contributes.commands` (and `menus` if needed).

### Adding a new renderer

Implement the `TranslationRenderer` interface from `src/types/renderer-types.ts` (`render(context: RenderContext): Promise<void>`), then register it in the coordinator switch inside `src/view/renderer.ts`.

### Code style

- **Linter:** ESLint flat config (`eslint.config.mjs`) — TypeScript rules + `curly`, `eqeqeq`, `semi`.
- Run `pnpm run lint` before committing.
- Run `pnpm run check-types` to catch type errors without building.
- Do not add comments that just narrate what the code does — only explain non-obvious intent or constraints.

---

## Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via **commitlint** + **husky**.

### Format

```
<type>(<scope>): <subject>
```

### Allowed types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, tooling |
| `ci` | CI/CD configuration |
| `build` | Changes to the build system (esbuild, tsconfig, etc.) |
| `revert` | Revert a previous commit |

### Rules

- Subject must not start with an uppercase letter, start-case, or be all-caps.
- Header line max 200 characters; body line max 500 characters.

### Examples

```
feat(inline): add option to show translation above the line
fix(translator): handle empty response from v2 API
docs: update contributing guide
chore: bump esbuild to 0.25
```

---

## Pull Request Process

1. Create a branch from `main` with a descriptive name:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes and commit them following the [Commit Convention](#commit-convention).
3. Run the full check suite before pushing:
   ```bash
   pnpm run compile && pnpm run test:unit
   ```
4. Push your branch and open a pull request against `main` on GitHub.
5. Fill in the PR description — explain the motivation, what changed, and how to test it.
6. A maintainer will review and merge the PR once approved.

---

## Reporting Issues

- Search [existing issues](https://github.com/mewisme/vscode-quick-translate/issues) before opening a new one.
- Include the extension version, VS Code version, OS, and clear steps to reproduce.
- For translation accuracy issues, note the source/target language and the text used.
