import { Bot, session } from "grammy";
import type { MyContext, SessionData } from "./types";
import { showPageList } from "./lib/show-page-list";
import { paginationMenu } from "./menus/pagination";
import { downloadMenu } from "./menus/download";
import { showMoreMenu } from "./menus/show-more";
import { downloadFile } from "./lib/download-file";
import { splitFile } from "./lib/split-file";
import { sendChunks } from "./lib/send-chunks";
import { bleApiBaseUrl, config } from "./config";
import { cleanupFiles } from "./lib/cleanup-files";

function initial(): SessionData {
  return { pageNumber: 1, videoDownloadLinks: new Map() };
}

export const bot = new Bot<MyContext>(config.bleExternalToken, {
  client: {
    apiRoot: bleApiBaseUrl,
  },
});

bot.use(session({ initial }));
bot.use(paginationMenu);
bot.use(downloadMenu);
bot.use(showMoreMenu);

bot.command("start", async (ctx) => {
  const pageNumber = ctx.session.pageNumber;
  await ctx.reply(`current page ${pageNumber}`);

  showPageList(ctx);
});

bot.command("page", (ctx) => {
  const matchPage = Number(ctx.match);

  if (matchPage) {
    ctx.session.pageNumber = matchPage;
  }
  ctx.reply(`current page ${ctx.session.pageNumber}`, {
    reply_markup: paginationMenu,
  });
});

bot.command("download", async (ctx) => {
  await cleanupFiles();
  const downloadUrl = ctx.match;

  await downloadFile(ctx, downloadUrl);

  await splitFile();

  const chunkIds = await sendChunks(ctx);

  cleanupFiles();

  ctx.reply(`internal-download ${chunkIds}`);
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
