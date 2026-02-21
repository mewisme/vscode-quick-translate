# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/mewisme/vscode-quick-translate/compare/v0.1.11...v0.2.0) (2026-02-21)


### Documentation

* update CLAUDE.md for improved module descriptions and command registration process ([9de1474](https://github.com/mewisme/vscode-quick-translate/commit/9de14742a2b34966f9ba45c43d86e61496936534))


### Added

* add unit tests and improve translation backend ([fb3b37b](https://github.com/mewisme/vscode-quick-translate/commit/fb3b37b6d74152e77cc7e402a4417cfa2924a95c))
* enhance translation functionality and user experience ([0e688ce](https://github.com/mewisme/vscode-quick-translate/commit/0e688ce27ee23adf48af6da4043eb9dae1a0a09e))
* implement translation history and caching features ([e965bcf](https://github.com/mewisme/vscode-quick-translate/commit/e965bcf10f804543e4e3bf415ac682b7d256c961))

### [0.1.11](https://github.com/mewisme/vscode-quick-translate/compare/v0.1.10...v0.1.11) (2026-02-20)


### Miscellaneous

* update versioning configuration and changelog links ([03a419a](https://github.com/mewisme/vscode-quick-translate/commit/03a419a389cb326de9c27c7d422c074612a9cddc))

### [0.1.10](https://github.com/mewisme/vscode-quick-translate/compare/v0.1.9...v0.1.10) (2026-02-20)


### Miscellaneous

* update versioning configuration and changelog formatting ([84de74c](https://github.com/mewisme/vscode-quick-translate/commit/84de74c9024c9a155781d892e96d7dd7178759b6))

### [0.1.9](https://github.com/mewisme/vscode-quick-translate/compare/v0.1.8...v0.1.9) (2026-02-20)


### Fixed

* ensure document is saved after setting decorations in inline renderer ([7f2dffc](https://github.com/mewisme/vscode-quick-translate/commit/7f2dffc7ccd717fd64955e7af0638437f7ce0937))

### [0.1.8](https://github.com/mewisme/vscode-quick-translate/compare/v0.1.7...v0.1.8) (2026-02-20)

### [0.1.7](https://github.com/mewisme/vscode-quick-translate/compare/v0.1.6...v0.1.7) (2026-02-20)

### 0.1.6 (2026-02-20)


### Fixed

* update display name in package.json to "VSCode Quick Translate" ([00cc5ee](https://github.com/mewisme/vscode-quick-translate/commit/00cc5ee8766bfef572a03adfe15f13836953d133))


### Added

* **0.1.2:** add translate backend v2, config, tests; remove Show Last Translation ([059d91d](https://github.com/mewisme/vscode-quick-translate/commit/059d91ddfaa0cc4debb65f4c45a462f458e99450))
* **0.1.3:** enhance publishing scripts, update README, and reorganize tests ([63b064d](https://github.com/mewisme/vscode-quick-translate/commit/63b064d9845b0d6138721d7730f106f8b1e99520))
* enhance translation extension with inline hover, normalization options, and new commands ([9d8851c](https://github.com/mewisme/vscode-quick-translate/commit/9d8851c251a8b59f6944a3c6d03683786d2c6214))
* init commit ([38a87f1](https://github.com/mewisme/vscode-quick-translate/commit/38a87f1b38a1a2078b81fa76493e4d3e99779a51))
* **view:** add view mode selection (hover, panel, inline) and inline renderer ([377d94c](https://github.com/mewisme/vscode-quick-translate/commit/377d94c1d946d3374325aa26a75a4323909b9dcb))

## 0.1.5

### Changed

- **Activation**: Extension now activates with `onStartupFinished` instead of on first command, so the first translation no longer has a startup delay.
- **Hover**: Hover is shown only when the translate or normalization-preview command explicitly triggers it. Strict guards in the hover provider (shouldShowHover, lastRange, position inside range) reduce merge/collision with other hover providers (e.g. GitLens). Hover intent is cleared immediately after showing and when the active editor or selection changes to avoid stale hover.

## 0.1.4

### Changed

- Extension icon updated (`images/icon.png`).

## 0.1.3

### Added

- Publish scripts in `package.json`: `publish:vsce`, `publish:ovsx`, and `vscode:publish` (runs both via npm-run-all) for publishing to the marketplace and Open VSX.

### Changed

- **README**: Documented `quickTranslate.translateVersion` in the configuration table and example; updated Technical Notes to describe v1/v2 backends and added note about `pnpm run test:translate`.
- **.vscodeignore**: Exclude `src/test/**` from the packaged extension.
- **tsconfig.json**: Formatting only (indentation).
- Translate tests moved from `test/translate.test.ts` to `src/test/translate.test.ts`; `test:translate` script updated to the new path.

## 0.1.2

### Added

- **Translate backend v2**: optional Google Translate mobile-page backend (`translate-v2`) that parses the HTML result-container; falls back to v1 on empty result or error.
- Setting `quickTranslate.translateVersion` (`"v1"` | `"v2"`) to choose backend; default is `"v2"`.
- Tests for translate functions (v1 and v2) in `test/translate.test.ts`; run with `pnpm run test:translate` (requires network).

### Changed

- Translate command uses configurable backend (v1 or v2) via `getTranslateFn(config.translateVersion)`.
- Config type and `getQuickTranslateConfig()` include `translateVersion`; translator index exports `translateV2`.
- Hover/result types and display support `version: 'v1' | 'v2'` on success.

### Removed

- **Quick Translate: Show Last Translation** command and `show-last-translation-command` module.
- `quickTranslate.modalPopup` configuration (legacy; was unused).

## 0.1.1

### Changed

- Bump extension version to 0.1.1.
- Require VS Code `^1.84.0` in `engines.vscode`.

## 0.1.0

### Added

- Hover-based result display: translation is shown in an inline hover at the selection or cursor instead of a popup.
- Configurable text normalization pipeline before translation (separators, case boundaries, acronyms, number boundaries, whitespace). All rules are toggleable; defaults on.
- Command Palette category "Quick Translate" for all commands.
- **Quick Translate: Translate Without Normalization** — one-off translation without running normalization.
- **Quick Translate: Show Last Translation** — re-show the last translation in hover.
- **Quick Translate: Clear Last Translation** — clear stored translation and hover state.
- **Quick Translate: Open Settings** — open Settings filtered to Quick Translate.
- **Quick Translate: Copy Last Translation** — copy last translation to clipboard.
- **Quick Translate: Normalization Preview** — show normalized text in hover without translating.

### Changed

- Main command title: "Quick Translate: Translate Selection". Command ID unchanged (`quickTranslate.translateSelection`).
- Error and UI messages in English (replaced Vietnamese strings in translator).
- Modular structure: command, config, hover, normalize, types, translator (languages + translate) modules.
- Progress during translation is shown in the window status bar (bottom bar) instead of a notification.
- Default keybinding for Translate Selection: `Ctrl+Shift+T` / `Cmd+Shift+T` (was `Ctrl+Alt+T` / `Cmd+Alt+T`).
- Hover tooltip layout: structured sections, metadata (source → target), optional "Normalization applied" line, dividers, and "Copy to clipboard" command link.
- Package description and keywords updated for marketplace.

### Removed

- Popup for successful translation (replaced by hover).

## 0.0.1

- Initial release: translate selection via popup, default auto to Vietnamese.