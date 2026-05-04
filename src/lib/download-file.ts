import type { CommandContext } from "grammy";
import type { MyContext } from "../types";

export async function downloadFile(
  ctx: CommandContext<MyContext>,
  url?: string,
) {
  const message = await ctx.reply("start downloading...");

  const fileUrl =
    url ||
    "https://v1.cdnde.com/x1/upload_14d6b1cd674297c12d7a11bed2d792af/47318/47318_240p.mp4";

  const fileName = "tmp.mp4";
  const response = await fetch(fileUrl);

  const total = Number(response.headers.get("content-length")) || 0;
  const downloadUrl = `./tmp_download/${fileName}`;
  const file = Bun.file(downloadUrl);
  const writer = file.writer();
  let downloaded = 0;
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("No readable stream");
  }

  const interval = setInterval(() => {
    if (total) {
      const percent = (downloaded / total) * 100;
      ctx.reply(`Progress: ${percent.toFixed(2)}%`);
    } else {
      ctx.reply(`Downloaded: ${downloaded} bytes`);
    }
  }, 3000);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    await writer.write(value);
    downloaded += value.length;
  }

  clearInterval(interval);
  await writer.end();

  ctx.reply("Download complete!");
}
