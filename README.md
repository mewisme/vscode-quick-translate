# VSCode Quick Translate

Translate selected text (or typed input) directly in VS Code. Results appear in **hover**, **side panel**, or **inline** — no leaving the editor, no API key.

**Requires VS Code 1.84.0+**

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=mewisme.vscode-quick-translate) [![Open VSX](https://img.shields.io/badge/Open%20VSX-Registry-purple)](https://open-vsx.org/extension/mewisme/vscode-quick-translate)

---

## Quick Start

1. **Select text** in the editor (or run the command with no selection to type text manually).
2. **Translate** via:
   - **Shortcut:** `Ctrl+Shift+T` (Windows/Linux) or `Cmd+Shift+T` (macOS)
   - **Command Palette:** `Quick Translate: Translate Selection`
   - **Right-click:** Context menu → **Quick Translate** → **Translate Selection**
3. The translation appears in your chosen view: **hover**, **panel**, or **inline**.

---

## Features

- **Instant translation** of selected text using Google Translate (no API key)
- **Three display modes:** hover tooltip, side panel, or inline decorations
- **Multi-target translation** — translate into several languages at once (panel mode)
- **Translation history** — browse recent results within the session
- **Accept translation** — replace the selected source text with the translated result in one step
- **Re-run last translation** — replay the previous translation without re-selecting text
- **Smart text normalization** for code identifiers (camelCase, snake_case, etc.) — optional, improves results
- **Granular normalization controls** — enable or disable each normalization rule individually
- **Manual input** when nothing is selected
- **Copy last translation** to clipboard
- **Normalization preview** — see normalized text without translating
- **Large selection guard** — confirmation prompt before translating very large inputs
- **Status bar** showing the active target language

Built for quick lookups while coding, not as a full translation suite.

---

## Smart Text Normalization (Optional)

For code-like text (`getUserName`, `error_code`, `HTTPServerError`), splitting words first often gives better translations. The extension can normalize before sending to the translator:

| Pattern               | Example                                   |
| --------------------- | ----------------------------------------- |
| camelCase             | `getUserName` → `get User Name`           |
| PascalCase            | `GetUserName` → `Get User Name`           |
| snake_case            | `error_code` → `error code`               |
| kebab-case            | `some-option` → `some option`             |
| dot.case              | `config.path.value` → `config path value` |
| Acronyms              | `HTTPServerError` → `HTTP Server Error`   |
| Number boundaries     | `version2Update` → `version 2 Update`     |
| Consecutive uppercase | `XMLParser` → `XML Parser`                |
| Mixed case            | `myVar_Name` → `my Var Name`              |

- Normalization **only affects** the text sent to the translator; your file is never modified.
- Can be **disabled globally** via `quickTranslate.normalizeText` or **skipped per run** (Translate Without Normalization).
- Each normalization rule can be toggled individually (see [Configuration](#configuration)).

---

## Commands

All under **Quick Translate** in the Command Palette (and most in the right-click context menu).

| Command                         | Description                                              |
| ------------------------------- | -------------------------------------------------------- |
| Translate Selection             | Translate selection or prompt for manual input           |
| Translate Without Normalization | Skip normalization for this run only                     |
| Re-run Last Translation         | Replay the last translation (no re-selection needed)     |
| Accept Translation              | Replace selected text with the translation result        |
| Copy Last Translation           | Copy the last result to the clipboard                    |
| Clear Last Translation          | Clear the current translation view                       |
| Show History                    | Browse translation results from the current session      |
| Normalization Preview           | Show normalized text without translating                 |
| Toggle Normalization            | Enable or disable normalization                          |
| Switch View Mode                | Cycle through: hover → panel → inline                    |
| Open Extension Settings         | Open Quick Translate settings                            |

---

## Configuration

Namespace: `quickTranslate`

### Core

| Setting                    | Default    | Description                                                     |
| -------------------------- | ---------- | --------------------------------------------------------------- |
| `sourceLanguage`           | `"auto"`   | Source language (auto = detect)                                 |
| `targetLanguage`           | `"vi"`     | Target language                                                 |
| `targetLanguages`          | `""`       | Comma-separated list for multi-target translation, e.g. `"vi,ja,de"` (panel mode only; overrides `targetLanguage`) |
| `viewMode`                 | `"panel"`  | `hover` / `panel` / `inline`                                   |
| `translateVersion`         | `"v1"`     | Backend: `v1` (JSON API) or `v2` (mobile HTML fallback)        |

### Input Handling

| Setting                    | Default | Description                                                                 |
| -------------------------- | ------- | --------------------------------------------------------------------------- |
| `maxLineCount`             | `50`    | Maximum lines to translate in multi-line mode. Lines beyond this are dropped. |
| `largeSelectionThreshold`  | `1000`  | Character count above which a confirmation prompt is shown before translating. Set very high to disable. |

### Display

| Setting       | Default  | Description                                                                                                    |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `inlineSave`  | `false`  | When using inline mode, automatically save the document after inserting or removing the translation block.      |
| `historySize` | `20`     | Maximum number of results to keep in the session history (1–500). History is not persisted across sessions.     |

### Normalization

| Setting                        | Default | Description                                                   |
| ------------------------------ | ------- | ------------------------------------------------------------- |
| `normalizeText`                | `true`  | Master switch — enable text normalization before translating   |
| `normalizeCamelCase`           | `true`  | Split camelCase identifiers into words                        |
| `normalizePascalCase`          | `true`  | Split PascalCase identifiers into words                       |
| `normalizeSnakeCase`           | `true`  | Split snake_case identifiers into words                       |
| `normalizeKebabCase`           | `true`  | Split kebab-case identifiers into words                       |
| `normalizeDotCase`             | `true`  | Split dot.case identifiers into words                         |
| `normalizeMixedCase`           | `true`  | Split identifiers mixing multiple casing styles               |
| `normalizeConsecutiveUppercase`| `true`  | Split runs of consecutive uppercase letters (e.g. `XMLParser`) |
| `normalizeAcronyms`            | `true`  | Keep known acronyms intact (e.g. `HTTP` stays as one word)    |
| `normalizeNumberBoundaries`    | `true`  | Insert space between letters and digits (e.g. `version2` → `version 2`) |
| `trimExtraSpaces`              | `true`  | Collapse multiple spaces and trim whitespace before translating |

Example `settings.json`:

```json
{
  "quickTranslate.targetLanguage": "en",
  "quickTranslate.targetLanguages": "en,ja,de",
  "quickTranslate.viewMode": "panel",
  "quickTranslate.normalizeText": true,
  "quickTranslate.maxLineCount": 30,
  "quickTranslate.largeSelectionThreshold": 500,
  "quickTranslate.historySize": 50
}
```

---

## Display Modes

| Mode       | Behavior |
| ---------- | -------- |
| **Hover**  | Tooltip above the selection (truncated at 4000 chars in UI; full text kept for copy). |
| **Panel**  | Dedicated side panel; result stays until cleared or replaced. Supports multi-target translation. |
| **Inline** | Non-editable decorations after each selected line. Clears when selection changes, file is edited, or editor switches. Optionally auto-saves via `inlineSave`. |

---

## Behavior Notes

- Works with **no selection** — you can type or paste in a prompt.
- **Does not modify** your source code (except when using **Accept Translation**).
- Only the **latest translation** is shown; use **Copy Last Translation** or **Show History** to retrieve earlier results.
- **Network** connection required.
- The status bar shows the active target language and updates when settings change.

---

## Technical Details

- Uses **Google Translate** (v1 JSON API or v2 mobile HTML fallback).
- **No API key** required.
- VS Code APIs: `HoverProvider`, `WebviewPanel`, `TextEditorDecorationType`, `withProgress`.

---

## Limitations

- Not for refactoring or bulk renaming.
- Translation history is session-only (not persisted across restarts).
- Quality depends on Google Translate.
- Multi-target translation is panel mode only.
- No grammar or style correction.

---

## Installation

- **[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mewisme.vscode-quick-translate)**
- **[Open VSX](https://open-vsx.org/extension/mewisme/vscode-quick-translate)**

---

## Development

```bash
pnpm install
pnpm run compile
pnpm run watch
pnpm run test:translate
pnpm run test:unit
```

---

## License

MIT © Nguyen Mau Minh. See [LICENSE](LICENSE) for details.
