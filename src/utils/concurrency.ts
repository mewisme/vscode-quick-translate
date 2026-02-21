/**
 * Process an array of items with a bounded number of concurrent operations.
 *
 * Unlike `Promise.all`, this ensures at most `limit` promises are in-flight
 * at any given time. Results are returned in the same order as the input.
 *
 * @param items - Items to process.
 * @param limit - Maximum number of concurrent operations (must be >= 1).
 * @param fn - Async function to apply to each item.
 */
export async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (limit < 1) {
    throw new RangeError('mapConcurrent: limit must be at least 1');
  }

  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
