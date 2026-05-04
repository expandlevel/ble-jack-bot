import type { MyContext } from "../types";

export async function mergeChunks(ctx: MyContext) {
  const outputPath = `./tmp_download/.merged.mp4`;
  const writer = Bun.file(outputPath).writer();

  let chunkIndex = 0;

  while (true) {
    const chunkPath = `./tmp_download/parts/part${chunkIndex}`;
    const chunkFile = Bun.file(chunkPath);

    if (!(await chunkFile.exists())) break;

    const reader = chunkFile.stream().getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      await writer.write(value);
    }

    chunkIndex++;
  }

  await writer.end();

  console.log(`Merge ${chunkIndex} chunks`);
  ctx.reply(`Merge ${chunkIndex} chunks`);

  console.log(`Merge complete: ${outputPath}`);
  ctx.reply(`Merge complete: ${outputPath}`);
}
