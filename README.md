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
   - **Right-click:** Context menu → **Translate Selection**
3. The translation appears in your chosen view: **hover**, **panel**, or **inline**.

---

## Features

- **Instant translation** of selected text using Google Translate (no API key)
- **Three display modes:** hover tooltip, side panel, or inline decorations
- **Smart text normalization** for code-like text (camelCase, snake_case, etc.) — optional, improves results for identifiers
- **Manual input** when nothing is selected
- **Copy last translation** to clipboard
- **Normalization preview** — see normalized text without translating
- **Toggle normalization** and **switch view mode** from the context menu or Command Palette

Built for quick lookups while coding, not as a full translation suite.

---

## Smart Text Normalization (Optional)

For code-like text (`getUserName`, `error_code`, `HTTPServerError`), splitting words first often gives better translations. The extension can normalize before sending to the translator:

| Pattern           | Example                                   |
| ----------------- | ----------------------------------------- |
| camelCase         | `getUserName` → `get User Name`           |
| PascalCase        | `GetUserName` → `Get User Name`           |
| snake_case        | `error_code` → `error code`               |
| kebab-case        | `some-option` → `some option`             |
| dot.case          | `config.path.value` → `config path value` |
| Acronyms          | `HTTPServerError` → `HTTP Server Error`   |
| Number boundaries | `version2Update` → `version 2 Update`     |

- Normalization **only affects** the text sent to the translator; your file is never modified.
- Can be **disabled globally** or **skipped per run** (Translate Without Normalization).

---

## Commands

All under **Quick Translate** in the Command Palette (and some in the editor context menu).

| Command                         | Description                                  |
| ------------------------------- | -------------------------------------------- |
| Translate Selection             | Translate selection or manual input         |
| Translate Without Normalization | Skip normalization for this run              |
| Copy Last Translation           | Copy last result to clipboard                |
| Clear Last Translation          | Clear current translation view               |
| Normalization Preview           | Show normalized text without translating     |
| Toggle Normalization            | Enable or disable normalization              |
| Switch View Mode                | Cycle: hover → panel → inline                |
| Open Extension Settings         | Open Quick Translate settings                |

---

## Configuration

Namespace: `quickTranslate`

| Setting              | Default   | Description                    |
| -------------------- | --------- | ------------------------------ |
| `sourceLanguage`     | `"auto"`  | Source language (auto = detect) |
| `targetLanguage`     | `"vi"`    | Target language                |
| `viewMode`           | `"panel"` | `hover` / `panel` / `inline`    |
| `normalizeText`      | `true`    | Enable smart normalization     |
| `translateVersion`   | `"v1"`    | Backend: `v1` (JSON) or `v2` (mobile HTML) |

Example `settings.json`:

```json
{
  "quickTranslate.targetLanguage": "en",
  "quickTranslate.viewMode": "panel",
  "quickTranslate.normalizeText": true
}
```

---

## Display Modes

| Mode    | Behavior |
| ------- | -------- |
| **Hover**  | Tooltip above the selection (truncated at 4000 chars in UI; full text kept for copy). |
| **Panel**  | Dedicated side panel; result stays until cleared or replaced. |
| **Inline** | Non-editable decorations after each selected line. Clears when selection changes, file is edited, or editor switches. |

---

## Behavior Notes

- Works with **no selection** — you can type or paste in a prompt.
- **Does not modify** your source code.
- Only the **latest translation** is shown; use **Copy Last Translation** to keep it.
- **Network** connection required.

---

## Technical Details

- Uses **Google Translate** (v1 JSON API or v2 mobile HTML fallback).
- **No API key** required.
- VS Code APIs: `HoverProvider`, `WebviewPanel`, `TextEditorDecorationType`, `withProgress`.

---

## Limitations

- Not for refactoring or bulk renaming.
- No translation history.
- Quality depends on Google Translate.
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
```

---

## License

MIT © Nguyen Mau Minh. See [LICENSE](LICENSE) for details.
