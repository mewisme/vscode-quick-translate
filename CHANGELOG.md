# Change Log

All notable changes to this extension will be documented in this file.

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
