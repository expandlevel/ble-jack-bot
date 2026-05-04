import { Bot } from "grammy";

import { bleApiBaseUrl, config } from "./config";
import { mergeChunks } from "./lib/merge-chunks";
import { uploadInternalStorage } from "./lib/upload-internal-storage";
import { cleanupFiles } from "./lib/cleanup-files";
import { sendChunks } from "./lib/send-chunks";
import { splitFile } from "./lib/split-file";
import { downloadFile } from "./lib/download-file";
import { fetchWithRetry } from "./lib/utils";

export const bot = new Bot(config.bleInternalToken, {
  client: {
    apiRoot: bleApiBaseUrl,
  },
});

bot.hears(/internal-download/, async (ctx) => {
  cleanupFiles();
  const fullText = ctx.message?.text;

  const messageChunkIds = fullText?.slice(18).split(",");

  if (!messageChunkIds?.length) {
    return;
  }

  await ctx.reply("start downloading chunks...");

  for (const [index, messageChunkId] of messageChunkIds.entries()) {
    ctx.reply(
      `start downloading chunks... \n\n chunk ${index + 1}/${messageChunkIds.length}`,
    );
    const fileUrl = `https://tapi.bale.ai/file/bot${config.bleExternalToken}/${messageChunkId}`;

    try {
      const filePart = Bun.file(`./tmp_download/parts/part${index}.zip`);

      if (await filePart.exists()) {
        await filePart.delete();
      }

      const response = await fetchWithRetry(fileUrl);

      const writer = filePart.writer();
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        await writer.write(value);
      }

      await writer.end();
    } catch (e) {
      ctx.reply("Sorry, service is busy");
    }
  }

  await mergeChunks(ctx);

  const completeUpload = await uploadInternalStorage(ctx);
  if (completeUpload?.link) {
    ctx.reply(`link upload:: ${completeUpload.link}`);
  } else {
    ctx.reply(`internal storage upload issue`);
  }
});

bot.command("/upload", async (ctx) => {
  const completeUpload = await uploadInternalStorage(ctx);
  if (completeUpload?.link) {
    ctx.reply(`link upload:: ${completeUpload.link}`);
  } else {
    ctx.reply(`internal storage upload issue`);
  }
});

bot.command("clean", async (ctx) => {
  ctx.reply("start cleaning...");
  await cleanupFiles();
  ctx.reply("cleaning complete...");
});

bot.hears(/ping/i, (ctx) => {
  ctx.reply("pong");
});

bot.catch((reason) => {
  console.log({ reason });
});
