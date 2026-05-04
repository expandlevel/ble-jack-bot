import { Impit } from "impit";

export const impit = new Impit({
  browser: "chrome",
  ignoreTlsErrors: true,
});

//

/**
 * Configuration options for fetch retry behavior
 */
interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelay?: number;
  /** Backoff multiplier (default: 2) - delay *= backoff after each attempt */
  backoffFactor?: number;
  /**
   * Determines whether a response should trigger a retry.
   * Default retries on 5xx errors and 429 (Too Many Requests).
   */
  shouldRetry?: (response: Response) => boolean;
  /** Optional logger for debugging (default: console.warn) */
  logger?: (message: string) => void;
  /** Enable jitter to add randomness to delay (default: true) */
  useJitter?: boolean;
}

/**
 * Performs a fetch request with automatic retries on failure.
 *
 * @param url - Request URL
 * @param options - Standard fetch options (method, headers, body, signal, etc.)
 * @param retryOptions - Retry configuration options
 * @returns Promise resolving to the fetch Response
 *
 * @example
 * ```typescript
 * // Simple GET with default retries
 * const response = await fetchWithRetry('https://api.example.com/data');
 *
 * // POST with custom retry logic
 * const response = await fetchWithRetry('https://api.example.com/submit', {
 *   method: 'POST',
 *   body: JSON.stringify({ key: 'value' })
 * }, {
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   shouldRetry: (res) => res.status === 503
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions: RetryOptions = {},
): Promise<Response> {
  const {
    maxRetries = 5,
    initialDelay = 3000,
    backoffFactor = 2,
    shouldRetry = (response: Response) =>
      response.status >= 500 || response.status === 429,
    logger = (msg: string) => console.warn(msg),
    useJitter = true,
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Check if response indicates we should retry
      if (shouldRetry(response)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Successful response, return it
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, rethrow with details
      if (attempt === maxRetries) {
        throw new Error(
          `Request failed after ${maxRetries} attempts: ${lastError.message}`,
        );
      }

      // Calculate delay with exponential backoff
      let delay = initialDelay * Math.pow(backoffFactor, attempt - 1);

      // Add jitter to avoid thundering herd problem
      if (useJitter) {
        delay += Math.random() * 100; // Add random 0-100ms jitter
      }

      logger(
        `Attempt ${attempt}/${maxRetries} failed: ${lastError.message}. Retrying in ${Math.round(delay)}ms...`,
      );

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached (the loop always throws on final failure)
  throw lastError ?? new Error("Request failed for unknown reason");
}

// Optional: Export a convenience type for RequestInit extension
export type FetchWithRetryOptions = RetryOptions;
