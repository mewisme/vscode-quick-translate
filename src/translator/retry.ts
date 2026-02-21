/**
 * Exponential backoff with jitter for transient failures.
 *
 * Calls `fn` up to `maxAttempts` times. After each failure for which
 * `isRetryable` returns true, waits `baseDelayMs * 2^attempt + jitter` ms
 * before the next attempt, where jitter is a random value in [0, baseDelayMs).
 * Returns the last result (success or failure) once attempts are exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  isRetryable: (result: T) => boolean,
  maxAttempts = 2,
  baseDelayMs = 500
): Promise<T> {
  let attempt = 0;
  while (true) {
    const result = await fn();
    if (!isRetryable(result) || attempt >= maxAttempts - 1) {
      return result;
    }
    const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs;
    await sleep(delay);
    attempt++;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
