/**
 * TranslationBackend: provider-agnostic abstraction over translation APIs.
 *
 * Command and renderer logic depends only on this interface. Concrete
 * Google Translate v1/v2 implementations are created via `createTranslationBackend`.
 * Alternative providers (e.g. LibreTranslate, DeepL) can be added by implementing
 * this interface without touching any command or renderer code.
 */

export interface BackendTranslateResult {
  error: false;
  text: string;
  fromLang: string;
  toLang: string;
  version: 'v1' | 'v2';
}

export interface BackendTranslateError {
  error: true;
  text: string;
}

export type BackendResult = BackendTranslateResult | BackendTranslateError;

export interface TranslationBackend {
  translate(
    input: string,
    fromLang: string,
    toLang: string,
    wrapLength?: number
  ): Promise<BackendResult>;
}

import { translate } from './translate';
import { translateV2 } from './translate-v2';

class V1Backend implements TranslationBackend {
  async translate(input: string, fromLang: string, toLang: string): Promise<BackendResult> {
    return translate(input, fromLang, toLang);
  }
}

class V2Backend implements TranslationBackend {
  async translate(
    input: string,
    fromLang: string,
    toLang: string,
    wrapLength?: number
  ): Promise<BackendResult> {
    return translateV2(input, fromLang, toLang, wrapLength);
  }
}

export function createTranslationBackend(version: 'v1' | 'v2'): TranslationBackend {
  return version === 'v2' ? new V2Backend() : new V1Backend();
}
