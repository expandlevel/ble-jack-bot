import { InputFile } from "grammy";
import type { MyContext } from "../types";
import { readdir } from "node:fs/promises";

export async function sendChunks(ctx: MyContext) {
  const chunksList = await readdir("./tmp_download/parts/");

  ctx.reply(`start sending chunks: ${chunksList}`);

  const messageIds: string[] = [];

  for (const chunkName of chunksList) {
    const message = await ctx.replyWithDocument(
      `https://104.252.77.32:88/tmp_download/parts/${chunkName}`,
    );

    messageIds.push(message.document.file_id);
  }

  return messageIds;
}
