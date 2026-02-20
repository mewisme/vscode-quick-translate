# Quick Translate

Translate any selected text in VS Code with a single shortcut or context menu.

## Features
- **Quick popup**: Select text → press `Ctrl+Alt+T` (`Cmd+Alt+T` on macOS) → see instant translation.
- **Languages**: Auto-detect source, target defaults to Vietnamese. Configurable in Settings.
- **Copy**: Copy translated result directly from popup.
- **Context Menu**: Right-click → Translate Selection.

## Settings
- `quickTranslate.sourceLanguage`: Source language code (`auto` by default).
- `quickTranslate.targetLanguage`: Target language code (`vi` by default).

## Commands
- `Translate: Selection (Quick Popup)` – translates the selected text.

## Requirements
Internet connection (uses Google Translate API endpoint).

## Known Issues
- Very long text may be truncated in popup.

## Release Notes

### 0.0.1
- Initial release with quick popup translation.
