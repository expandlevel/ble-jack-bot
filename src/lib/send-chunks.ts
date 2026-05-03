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
    // const documentUrl = `https://104.252.77.32:88/tmp_download/parts/${chunkName}`;
    // const documentUrl = `https://5.10.249.18:88/tmp_download/parts/${chunkName}`;
    const documentUrl = `http://104.252.77.32:88/tmp_download/parts/${chunkName}`;
    // const documentUrl =
    //   "https://dl.moddingpack.ir/punkpaste/files/2-535305035643358835-6jtpsa.mp4";

    console.log({ documentUrl });
    await ctx.reply(`document:: ${documentUrl}`);

    const message = await ctx.replyWithDocument(documentUrl);

    messageIds.push(message.document.file_id);
  }

  return messageIds;
}
