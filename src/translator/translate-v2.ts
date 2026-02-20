import axios from 'axios';
import { languages } from './languages';
import { translate } from './translate';

/** Extract translation from mobile page HTML. */
const RESULT_CONTAINER_PATTERN = /class="result-container">([\s\S]*?)</;

export type TranslateResult =
  | { error: false; text: string; fromLang: string; toLang: string; version: 'v1' | 'v2' }
  | { error: true; text: string };

/**
 * Unescape HTML entities (equivalent to Python's html.unescape).
 */
function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    );
}

/**
 * Wrap text to a maximum line length (equivalent to Python's textwrap.wrap).
 */
function wrapText(text: string, width: number): string {
  if (width <= 0) {
    return text;
  }
  const lines: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= width) {
      lines.push(remaining);
      break;
    }
    let breakAt = remaining.lastIndexOf(' ', width);
    if (breakAt <= 0) {
      breakAt = width;
    }
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  return lines.join('\n');
}

/**
 * Translate text via Google Translate mobile page (version 2).
 * Mirrors the Flow Launcher plugin: fetch HTML and parse result-container.
 *
 * @param input - Text to translate
 * @param fromLang - Source language code (default 'auto')
 * @param toLang - Target language code (default 'vi')
 * @param wrapLength - Optional max line length; if set, result is wrapped
 */
export async function translateV2(
  input: string,
  fromLang: string = 'auto',
  toLang: string = 'vi',
  wrapLength?: number
): Promise<TranslateResult> {
  if (!languages.some((lang) => lang.code === toLang)) {
    return { error: true, text: 'This language is not supported.' };
  }

  try {
    const url = `https://translate.google.com/m?tl=${encodeURIComponent(toLang)}&sl=${encodeURIComponent(fromLang)}&q=${encodeURIComponent(input)}`;
    const { data } = await axios.get<string>(url, {
      responseType: 'text',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const match = data.match(RESULT_CONTAINER_PATTERN);
    const raw = match ? match[1] : '';
    const result = unescapeHtml(raw);

    if (!result) {
      return translate(input, fromLang, toLang);
    }

    const width =
      typeof wrapLength === 'number' && wrapLength > 0 ? wrapLength : 0;
    const text = width > 0 ? wrapText(result, width) : result;

    return {
      error: false,
      text,
      fromLang,
      toLang,
      version: 'v2',
    };
  } catch (error) {
    console.error('Error translating with v2:', error);
    return translate(input, fromLang, toLang);
  }
}
