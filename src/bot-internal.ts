import { Bot } from "grammy";

import { bleApiBaseUrl, config } from "./config";
import { mergeChunks } from "./lib/merge-chunks";

export const bot = new Bot(config.bleInternalToken, {
  client: {
    apiRoot: bleApiBaseUrl,
  },
});

bot.hears(/internal-download/, async (ctx) => {
  const fullText = ctx.message?.text;

  const messageChunkIds = fullText?.slice(18).split(",");
  console.log({ messageChunkIds });

  if (!messageChunkIds?.length) {
    return;
  }

  const message = await ctx.reply("start downloading chunks...");

  messageChunkIds.forEach(async (messageChunkId, index) => {
    await ctx.api.editMessageText(
      ctx.chatId,
      message.message_id,
      `start downloading chunks... \n\n chunk ${index + 1}/${messageChunkIds.length}`,
    );
    const bleFile = await ctx.api.getFile(messageChunkId);
    const fileUrl = `https://tapi.bale.ai/file/bot${config.bleExternalToken}/${bleFile.file_path}`;
    const response = await fetch(fileUrl);

    const fileName = "tmp.mp4";
    const filePart = Bun.file(`./tmp_download/parts/${fileName}.part${index}`);

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
  });

  await mergeChunks();
});

bot.hears(/ping/i, (ctx) => {
  ctx.reply("pong");
});

bot.catch((reason) => {
  console.log({ reason });
});
