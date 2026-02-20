import axios from 'axios';

import { languages } from './languages';

interface GoogleTranslateSuccess {
  error: false;
  text: string;
  fromLang: string;
  toLang: string;
}

interface GoogleTranslateError {
  error: true;
  text: string;
}

export type TranslateResult = GoogleTranslateSuccess | GoogleTranslateError;

interface GoogleTranslateApiResponse {
  0: Array<Array<string>>;
  2: string;
  8: Array<Array<string>>;
}

function parseResponse(data: unknown): { text: string; fromLang: string } {
  const d = data as GoogleTranslateApiResponse;
  const text = (d[0] ?? []).map((row) => row[0] ?? '').join('');
  const fromLang =
    d[2] === (d[8]?.[0]?.[0] ?? null) ? d[2] : (d[8]?.[0]?.[0] ?? d[2] ?? '');
  return { text, fromLang };
}

export async function translate(
  input: string,
  fromLang: string = 'auto',
  toLang: string = 'vi'
): Promise<TranslateResult> {
  if (!languages.some((lang) => lang.code === toLang)) {
    return { error: true, text: 'This language is not supported.' };
  }
  try {
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(input)}`;
    const { data } = await axios.get<unknown>(url);
    const { text, fromLang: detected } = parseResponse(data);
    return { error: false, text, fromLang: detected, toLang };
  } catch {
    return { error: true, text: 'An error occurred.' };
  }
}
