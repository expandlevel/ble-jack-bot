import type { MyContext } from "../types";
import { readdir } from "node:fs/promises";
import path from "node:path";
//
import { Bot, Context, GrammyError, HttpError, InputFile } from "grammy";

/**
 * Retry options
 */
interface RetryOptions {
  maxAttempts?: number; // default 3
  initialDelayMs?: number; // default 1000
  backoffFactor?: number; // default 2 (exponential)
  maxDelayMs?: number; // default 10000
  retryableErrors?: (error: unknown) => boolean; // custom predicate
}

/**
 * Default retryable errors:
 * - Network errors (HttpError)
 * - Rate limit (429) – will also use retry-after header
 * - Internal server errors (>=500)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof HttpError) return true; // network issues
  if (error instanceof GrammyError) {
    // 429 Too Many Requests -> always retry
    if (error.error_code === 429) return true;
    // 5xx server errors -> retry
    if (error.error_code >= 500 && error.error_code < 600) return true;
    // 400 Bad Request might be invalid file – do NOT retry
    return false;
  }
  return false;
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper for any async function
 */
async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    backoffFactor = 2,
    maxDelayMs = 10000,
    retryableErrors = isRetryableError,
  } = options;

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If this was the last attempt, rethrow
      if (attempt === maxAttempts) throw error;

      // Check if error is retryable
      if (!retryableErrors(error)) throw error;

      // Special handling for Telegram rate limit: use provided retry-after
      let waitTime = delay;
      if (error instanceof GrammyError && error.error_code === 429) {
        const retryAfter = error.parameters?.retry_after;
        if (retryAfter && typeof retryAfter === "number") {
          waitTime = Math.min(retryAfter * 1000, maxDelayMs);
        }
      }

      console.warn(
        `Attempt ${attempt} failed. Retrying in ${waitTime}ms...`,
        error,
      );
      await sleep(waitTime);
      delay = Math.min(delay * backoffFactor, maxDelayMs);
    }
  }
  throw lastError;
}

/**
 * Retryable ctx.replyWithDocument
 */
async function replyWithDocumentRetry(
  ctx: Context,
  document: string | InputFile,
  extra?: Parameters<typeof ctx.replyWithDocument>[1],
  retryOptions?: RetryOptions,
): Promise<any> {
  return retry(() => ctx.replyWithDocument(document, extra), retryOptions);
}

export async function sendChunks(ctx: MyContext) {
  const chunksList = await readdir("./tmp_download/parts/");

  const filteredChunksList = chunksList.filter(
    (fileName) => fileName !== ".gitkeep",
  );

  await ctx.reply(`start sending chunks: ${filteredChunksList}`);

  const messageIds: string[] = [];

  for (const chunkName of filteredChunksList) {
    const documentUrl = `http://check-test-bot-internal.work.gd/tmp_download/parts/${chunkName}`;

    console.log({ documentUrl });
    await ctx.reply(`sending chunk:: ${documentUrl}`);

    // const message = await ctx.replyWithDocument(documentUrl);
    // messageIds.push(message.document.file_id);
    //
    try {
      // Send a document with automatic retries
      const message = await replyWithDocumentRetry(
        ctx,
        documentUrl,
        {},
        { maxAttempts: 5, initialDelayMs: 2000 },
      );
      messageIds.push(message.document.file_id);
    } catch (error) {
      console.error("Failed to send document after retries:", error);
      await ctx.reply("Sorry, could not send the document. Please try later.");
    }

    //
  }

  return messageIds;
}
