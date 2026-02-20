# Change Log

All notable changes to this extension will be documented in this file.

## [0.1.5]

### Changed

- **Activation**: Extension now activates with `onStartupFinished` instead of on first command, so the first translation no longer has a startup delay.
- **Hover**: Hover is shown only when the translate or normalization-preview command explicitly triggers it. Strict guards in the hover provider (shouldShowHover, lastRange, position inside range) reduce merge/collision with other hover providers (e.g. GitLens). Hover intent is cleared immediately after showing and when the active editor or selection changes to avoid stale hover.

## [0.1.4]

### Changed

- Extension icon updated (`images/icon.png`).

## [0.1.3]

### Added

- Publish scripts in `package.json`: `publish:vsce`, `publish:ovsx`, and `vscode:publish` (runs both via npm-run-all) for publishing to the marketplace and Open VSX.

### Changed

- **README**: Documented `quickTranslate.translateVersion` in the configuration table and example; updated Technical Notes to describe v1/v2 backends and added note about `pnpm run test:translate`.
- **.vscodeignore**: Exclude `src/test/**` from the packaged extension.
- **tsconfig.json**: Formatting only (indentation).
- Translate tests moved from `test/translate.test.ts` to `src/test/translate.test.ts`; `test:translate` script updated to the new path.

## [0.1.2]

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

## [0.1.1]

### Changed

- Bump extension version to 0.1.1.
- Require VS Code `^1.84.0` in `engines.vscode`.

## [0.1.0]

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

## [0.0.1]

- Initial release: translate selection via popup, default auto to Vietnamese.
