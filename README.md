# VSCode Quick Translate

Translate selected or entered text via Google Translate and view the result in a hover, side panel, or inline. Intended for quick lookups while editing, not for replacing human translation.

**Requires VS Code 1.84.0 or newer.** No API key required.

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=mewisme.vscode-quick-translate) [![Open VSX](https://img.shields.io/badge/Open%20VSX-Registry-purple)](https://open-vsx.org/extension/mewisme/vscode-quick-translate)

## Overview

The extension addresses the need to translate short passages (identifiers, labels, error messages, or snippets) without leaving the editor. Translation is requested explicitly by running the command; the result is shown according to your chosen view mode (hover, panel, or inline).

Typical workflow: select text (or run the command with no selection and enter text in the input box), run the translate command, wait for the progress notification, then see the translation in your configured view. No editor content is modified unless you use inline mode (which adds temporary decorations).

## How It Works

- **Selection-based**: If the active editor has selected text, that text is used as the source. Leading and trailing whitespace is trimmed.
- **Manual input fallback**: If there is no selection or the selection is empty, an input box is shown. Whatever you enter (or cancel) is used as the source. Empty input is rejected with an informational message.
- **View modes**: On success, the translation is shown in one of three ways (configurable via `quickTranslate.viewMode`): **Hover** (tooltip above the selection), **Panel** (dedicated side panel), or **Inline** (decorations after each selected line, cleared when selection or document changes).
- **Progress**: While the request is in flight, a non-cancellable progress notification is shown in the notification area.
- **Normalization**: Before the request is sent, the source text can be run through a configurable normalization pipeline so identifier-like strings (e.g. `getUserName`, `error_code`) are turned into spaced words for better translation. Normalization is optional and each rule can be toggled.

## Text Normalization

Normalization runs only before the translation request. It does not change the document or the selection; only the string sent to the translation API is affected. It is intended for identifier-like or technical text where splitting words improves results.

Supported patterns (each can be enabled or disabled in configuration):

- **CamelCase**: Insert space before uppercase that follows lowercase (e.g. `getUserName` → `get User Name`).
- **PascalCase**: Same boundary rule as CamelCase, so capitalized words are split (e.g. `GetUserName` → `Get User Name`).
- **snake_case**: Replace underscores with spaces (e.g. `error_code` → `error code`).
- **kebab-case**: Replace hyphens with spaces (e.g. `some-option` → `some option`).
- **dot.case**: Replace dots with spaces (e.g. `config.path.value` → `config path value`).
- **Mixed separators**: Replace runs of hyphens, underscores, or dots with a single space (e.g. `use-text_selected.value` → `use text selected value`).
- **Acronyms**: Split before an uppercase letter that starts a word followed by lowercase (e.g. `HTTPServerError` → `HTTP Server Error`).
- **Consecutive uppercase**: Insert space between runs of uppercase and a following uppercase+lowercase word (e.g. `XMLHTTPRequest` → `XML HTTP Request`).
- **Number boundaries**: Insert space between letters and digits (e.g. `getUser2FAStatus` → `get User 2 FA Status`, `version2Update` → `version 2 Update`).
- **Constants (ALL_CAPS)**: Handled by the same case-boundary and separator rules; snake_case also splits `MAX_BUFFER_SIZE`-style names.
- **Whitespace cleanup**: Collapse runs of two or more spaces to one and trim start and end.

If the master switch `quickTranslate.normalizeText` is false, the entire pipeline is skipped. Each rule has its own setting and defaults to true when not set. Input shorter than three characters is only trimmed and optionally whitespace-normalized; no other rules apply.

## Configuration

All keys live under the `quickTranslate` namespace.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `quickTranslate.sourceLanguage` | string | `"auto"` | Source language code. Use `auto` for auto-detection. |
| `quickTranslate.targetLanguage` | string | `"vi"` | Target language code. |
| `quickTranslate.translateVersion` | string | `"v1"` | Backend: `"v1"` (JSON API translate_a/single) or `"v2"` (mobile page; parses HTML result). v2 falls back to v1 on empty result or error. |
| `quickTranslate.viewMode` | string | `"panel"` | How to display the result: `"hover"` (tooltip), `"panel"` (side panel), or `"inline"` (decorations after each line). |
| `quickTranslate.normalizeText` | boolean | `true` | When false, normalization is skipped and the raw input is sent to the API. |
| `quickTranslate.normalizeCamelCase` | boolean | `true` | Split at camelCase boundaries. |
| `quickTranslate.normalizePascalCase` | boolean | `true` | Split at PascalCase boundaries. |
| `quickTranslate.normalizeKebabCase` | boolean | `true` | Replace hyphens with spaces. |
| `quickTranslate.normalizeSnakeCase` | boolean | `true` | Replace underscores with spaces. |
| `quickTranslate.normalizeDotCase` | boolean | `true` | Replace dots with spaces. |
| `quickTranslate.normalizeMixedCase` | boolean | `true` | Collapse mixed separator runs to a single space. |
| `quickTranslate.normalizeAcronyms` | boolean | `true` | Split acronym boundaries (e.g. HTTP + Server). |
| `quickTranslate.normalizeConsecutiveUppercase` | boolean | `true` | Split consecutive uppercase runs. |
| `quickTranslate.normalizeNumberBoundaries` | boolean | `true` | Insert space at letter-digit and digit-letter boundaries. |
| `quickTranslate.trimExtraSpaces` | boolean | `true` | Collapse multiple spaces and trim. |

Example `settings.json`:

```json
{
  "quickTranslate.sourceLanguage": "auto",
  "quickTranslate.targetLanguage": "en",
  "quickTranslate.translateVersion": "v1",
  "quickTranslate.viewMode": "panel",
  "quickTranslate.normalizeText": true,
  "quickTranslate.normalizeSnakeCase": true,
  "quickTranslate.normalizeNumberBoundaries": true
}
```

Language codes must match the set supported by the extension (e.g. `en`, `vi`, `zh-cn`). Invalid target language results in an error response from the command.

## Commands

All commands appear in the Command Palette under the category "Quick Translate". Right-click with a selection to open the Quick Translate submenu (Translate Selection, Toggle Normalization, Switch View Mode, Open Extension Settings).

| Command ID | Title | Keybinding | Description |
|------------|--------|------------|-------------|
| `quickTranslate.translateSelection` | Quick Translate: Translate Selection | `Ctrl+Shift+T` / `Cmd+Shift+T` when `editorHasSelection && editorTextFocus` | Translates selection or manual input; uses config-driven normalization; shows result in configured view mode. |
| `quickTranslate.translateWithoutNormalization` | Quick Translate: Translate Without Normalization | — | Same as Translate Selection but skips the normalization pipeline for this run. |
| `quickTranslate.clearLastTranslation` | Quick Translate: Clear Last Translation | — | Clears the stored translation and view state. |
| `quickTranslate.openSettings` | Quick Translate: Open Extension Settings | — | Opens Settings filtered to Quick Translate options. |
| `quickTranslate.copyLastTranslation` | Quick Translate: Copy Last Translation | — | Copies the last translation text to the clipboard. No-op if none. |
| `quickTranslate.normalizationPreview` | Quick Translate: Normalization Preview | — | Runs the normalization pipeline on selection or input and shows the result in a hover (no translation). |
| `quickTranslate.toggleNormalization` | Toggle Normalization | — | Toggles `quickTranslate.normalizeText` on/off. Context menu only. |
| `quickTranslate.switchViewMode` | Switch View Mode | — | Cycles through hover → panel → inline. Context menu only. |

Execution of the main command: reads config, resolves input (selection or input box), optionally normalizes, calls the translation API with progress, then on success renders the result in the configured view mode. On failure, an error message is shown in the notification area.

## Behavior Details

- **Hover mode**: The hover appears only immediately after a successful translation. The extension sets internal state and runs `editor.action.showHover` once. The hover content is returned only for the document and range that were just translated and only while the show-hover flag is set (it is cleared right after the hover is requested).
- **Panel mode**: The translation is shown in a dedicated side panel. The panel persists until cleared or overwritten by a new translation.
- **Inline mode**: Decorations are added after each selected line. They are cleared when the selection changes, the document is edited, or you switch editors.
- **When the result does not appear**: If the request fails (network, invalid language, API error), the extension shows an error message. If you run the command with no active editor and use the input box, there is no range to attach hover/inline to; panel mode still works.
- **Error handling**: Errors are surfaced via `vscode.window.showErrorMessage` with the message from the translator (or a generic message). The progress notification is dismissed by VSCode when the promise settles.
- **No selection**: The command still runs; an input box is shown. If you cancel or submit empty text, you get an informational message and the command exits without calling the API.

## Edge Cases

- **Identifier-like text**: Handled by the normalization pipeline when the corresponding options are enabled. If normalization is off, the raw string is sent.
- **Already spaced text**: Normalization may still change it (e.g. number boundaries, acronyms). If you want no changes, set `quickTranslate.normalizeText` to false.
- **Large translation results**: The hover display truncates at 4000 characters and appends a “(truncated)” line. The full result is still stored; only the hover rendering is limited.
- **Short input**: Input of length less than three is not run through the full pipeline; only trim and optional whitespace cleanup apply.

## Technical Notes

- The extension supports two backends (selectable via `quickTranslate.translateVersion`): **v1** uses the Google Translate JSON endpoint (translate_a/single); **v2** uses the mobile page and parses the HTML result-container, with fallback to v1 on empty result or error. No API key is required. Network access is required.
- Translation is implemented via configurable v1/v2 async functions; the extension does not add other translation surfaces.
- Result display supports three view modes: **hover** (HoverProvider API), **panel** (WebviewPanel), and **inline** (TextEditorDecorationType). The hover provider returns content only when the request came from its own command and the hover position is inside the stored range.
- Progress is shown with `vscode.window.withProgress` and a notification location.
- The extension does not insert or replace text in the editor (inline mode uses non-editable decorations).
- Normalization is implemented with regular expressions and string methods only; no extra dependencies. Config is read once per command and passed into the normalizer.
- Translate backends can be exercised with `pnpm run test:translate` (requires network; hits Google Translate).

## Limitations

- The extension is not a code refactoring or renaming tool. It only shows a translation; it does not modify source code.
- It does not perform grammar or style correction. Output is the raw result from the translation provider.
- Translation quality and supported languages depend entirely on the Google Translate endpoint. Unsupported or invalid language codes produce an error.
- The extension shows only the most recent translation. There is no history or multiple-result UI.

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mewisme.vscode-quick-translate) or [Open VSX](https://open-vsx.org/extension/mewisme/vscode-quick-translate).

## Development

```bash
pnpm install
pnpm run compile    # Build the extension
pnpm run watch      # Watch mode for development
pnpm run test:translate   # Run translate backend tests (requires network)
```

## License

MIT © Nguyen Mau Minh. See [LICENSE](LICENSE) for details.
