/**
 * Minimal HTML content extractor.
 *
 * Walks the raw HTML character by character to find elements by class name and
 * extract their inner text. This is more resilient than a regex because it
 * tracks nesting depth, so the content is correctly bounded even when the
 * inner HTML contains nested tags. Minor markup changes (attribute order,
 * whitespace, additional classes) do not break the extraction.
 */

function tagHasClass(tagSlice: string, className: string): boolean {
  const classMatch = /class="([^"]*)"/i.exec(tagSlice);
  if (!classMatch) {
    return false;
  }
  return classMatch[1].split(/\s+/).includes(className);
}

/**
 * Extract the inner text of the first element whose `class` attribute
 * includes `className`. Returns `undefined` if no match is found.
 *
 * The algorithm:
 * 1. Scan for `<tagName ...class="... className ..."...>`.
 * 2. Once found, collect everything until the matching closing tag by
 *    tracking open/close depth for that tag name.
 * 3. Strip any inner HTML tags from the collected content and return plain
 *    text.
 */
export function extractByClass(html: string, className: string): string | undefined {
  let i = 0;
  const len = html.length;

  while (i < len) {
    const tagStart = html.indexOf('<', i);
    if (tagStart === -1) {
      break;
    }

    const tagEnd = html.indexOf('>', tagStart);
    if (tagEnd === -1) {
      break;
    }

    const fullTag = html.slice(tagStart + 1, tagEnd);

    if (fullTag.startsWith('/') || fullTag.startsWith('!')) {
      i = tagEnd + 1;
      continue;
    }

    const spaceIdx = fullTag.search(/[\s/>]/);
    const tagName = (spaceIdx === -1 ? fullTag : fullTag.slice(0, spaceIdx)).toLowerCase();

    if (!tagName) {
      i = tagEnd + 1;
      continue;
    }

    if (fullTag.endsWith('/')) {
      i = tagEnd + 1;
      continue;
    }

    if (tagHasClass(fullTag, className)) {
      let depth = 1;
      let j = tagEnd + 1;
      const contentStart = j;
      const openPattern = new RegExp(`<${tagName}[\\s>]`, 'i');

      while (j < len && depth > 0) {
        const nextOpenFromJ = (() => {
          const sub = html.slice(j);
          const m = openPattern.exec(sub);
          return m ? j + m.index : -1;
        })();
        const nextCloseFromJ = html.indexOf(`</${tagName}>`, j);

        if (nextCloseFromJ === -1) {
          break;
        }

        if (nextOpenFromJ !== -1 && nextOpenFromJ < nextCloseFromJ) {
          depth++;
          j = nextOpenFromJ + tagName.length + 1;
        } else {
          depth--;
          if (depth === 0) {
            const rawContent = html.slice(contentStart, nextCloseFromJ);
            return stripTags(rawContent);
          }
          j = nextCloseFromJ + tagName.length + 3; // `</tagName>` length
        }
      }
      // No matching close tag found; keep scanning for another candidate.
    }

    i = tagEnd + 1;
  }

  return undefined;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function extractByClasses(html: string, classNames: string[]): string | undefined {
  for (const cls of classNames) {
    const result = extractByClass(html, cls);
    if (result !== undefined && result.trim() !== '') {
      return result.trim();
    }
  }
  return undefined;
}
