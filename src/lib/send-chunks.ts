import { InputFile } from "grammy";
import type { MyContext } from "../types";
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function sendChunks(ctx: MyContext) {
  const chunksList = await readdir("./tmp_download/parts/");

  const filteredChunksList = chunksList.filter(
    (fileName) => fileName !== ".gitkeep",
  );

  await ctx.reply(`start sending chunks: ${filteredChunksList}`);

  const messageIds: string[] = [];

  for (const chunkName of filteredChunksList) {
    const documentUrl = `http://check-test-bot-internal.work.gd/tmp_download/parts/${chunkName}.mp4`;

    console.log({ documentUrl });
    await ctx.reply(`sending chunk:: ${documentUrl}`);

    const message = await ctx.replyWithDocument(documentUrl);

    messageIds.push(message.document.file_id);
  }

  return messageIds;
}
