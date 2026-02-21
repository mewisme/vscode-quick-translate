import { logToChannel } from '../output-channel';
import { languages } from './languages';
import {
  ERR_LANG_NOT_SUPPORTED,
  ERR_NETWORK,
  ERR_PARSE_FAILED,
  ERR_RATE_LIMITED,
  ERR_UNEXPECTED,
} from './error-messages';
import { withRetry } from './retry';

interface GoogleTranslateSuccess {
  error: false;
  text: string;
  fromLang: string;
  toLang: string;
  version: 'v1';
}

interface GoogleTranslateError {
  error: true;
  text: string;
}

export type TranslateResult = GoogleTranslateSuccess | GoogleTranslateError;

function isValidResponseShape(data: unknown): data is unknown[][] {
  return Array.isArray(data) && Array.isArray((data as unknown[])[0]);
}

function parseResponse(data: unknown[][]): { text: string; fromLang: string } {
  const rows = data[0] as unknown[];
  const text = rows.map((row) => (Array.isArray(row) ? (row[0] as string) ?? '' : '')).join('');
  const meta = data as unknown as Record<number, unknown>;
  const detected = (meta[8] as unknown[][])?.[0]?.[0] as string | undefined;
  const reported = meta[2] as string | undefined;
  const fromLang = reported === detected ? (reported ?? '') : (detected ?? reported ?? '');
  return { text, fromLang };
}

async function attemptTranslate(
  input: string,
  fromLang: string,
  toLang: string
): Promise<TranslateResult> {
  try {
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(input)}`;
    const response = await fetch(url);

    if (response.status === 429) {
      return { error: true, text: ERR_RATE_LIMITED };
    }

    if (!response.ok) {
      logToChannel(`translate v1: HTTP ${response.status} ${response.statusText}`);
      return { error: true, text: ERR_NETWORK };
    }

    const data = (await response.json()) as unknown;

    if (!isValidResponseShape(data)) {
      logToChannel(`translate v1: unexpected response shape`, data);
      return { error: true, text: ERR_PARSE_FAILED };
    }

    const { text, fromLang: detected } = parseResponse(data);
    return { error: false, text, fromLang: detected, toLang, version: 'v1' };
  } catch (error: unknown) {
    logToChannel(`translate v1: unexpected error`, error);
    return { error: true, text: ERR_UNEXPECTED };
  }
}

function isTransientError(result: TranslateResult): boolean {
  if (!result.error) {
    return false;
  }
  // Rate-limit and language errors are not transient; network/unexpected errors are.
  return result.text !== ERR_RATE_LIMITED && result.text !== ERR_LANG_NOT_SUPPORTED;
}

export async function translate(
  input: string,
  fromLang: string = 'auto',
  toLang: string = 'vi'
): Promise<TranslateResult> {
  if (!languages.some((lang) => lang.code === toLang)) {
    return { error: true, text: ERR_LANG_NOT_SUPPORTED };
  }
  return withRetry(() => attemptTranslate(input, fromLang, toLang), isTransientError);
}
