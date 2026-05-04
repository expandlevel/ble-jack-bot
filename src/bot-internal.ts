import { Bot } from "grammy";

import { bleApiBaseUrl, config } from "./config";
import { mergeChunks } from "./lib/merge-chunks";
import { uploadInternalStorage } from "./lib/upload-internal-storage";
import { cleanupFiles } from "./lib/cleanup-files";
import { sendChunks } from "./lib/send-chunks";
import { splitFile } from "./lib/split-file";

export const bot = new Bot(config.bleInternalToken, {
  client: {
    apiRoot: bleApiBaseUrl,
  },
});

bot.hears(/internal-download/, async (ctx) => {
  console.log("download command");

  const fullText = ctx.message?.text;

  const messageChunkIds = fullText?.slice(18).split(",");
  console.log({ messageChunkIds });

  if (!messageChunkIds?.length) {
    return;
  }

  const message = await ctx.reply("start downloading chunks...");

  for (const [index, messageChunkId] of messageChunkIds.entries()) {
    ctx.reply(
      `start downloading chunks... \n\n chunk ${index + 1}/${messageChunkIds.length}`,
    );
    const bleFile = await ctx.api.getFile(messageChunkId);
    const fileUrl = `https://tapi.bale.ai/file/bot${config.bleExternalToken}/${bleFile.file_path}`;
    const response = await fetch(fileUrl);

    const filePart = Bun.file(`./tmp_download/parts/part${index}`);

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
  }

  // @ts-ignore
  await mergeChunks(ctx);

  // const completeUpload = await uploadInternalStorage();
  // ctx.reply(`link upload:: ${completeUpload.link}`);

  // cleanupFiles();
});

bot.command("merge", async (ctx) => {
  //
  // await splitFile();
  // @ts-ignore
  await mergeChunks(ctx);
  //
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
