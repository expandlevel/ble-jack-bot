import { Bot, session } from "grammy";
import type { MyContext, SessionData } from "./types";
import { showPageList } from "./lib/show-page-list";
import { paginationMenu } from "./menus/pagination";
import { downloadMenu } from "./menus/download";
import { showMoreMenu } from "./menus/show-more";
import { server } from "./server-external";
import { downloadFile } from "./lib/download-file";
import { splitFile } from "./lib/split-file";
import { sendChunks } from "./lib/send-chunks";
import { bleApiBaseUrl, config } from "./config";
import { cleanupFiles } from "./lib/cleanup-files";
import { Menu } from "@grammyjs/menu";

function initial(): SessionData {
  return { pageNumber: 1, videoDownloadLinks: new Map() };
}

const bot = new Bot<MyContext>(config.bleExternalToken, {
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
  ctx.reply(`current page ${ctx.session.pageNumber}`);
});

bot.command("download", async (ctx) => {
  await downloadFile(ctx);

  await splitFile();

  const chunkIds = await sendChunks(ctx);

  cleanupFiles();

  ctx.reply(`internal-download ${chunkIds}`);
});

const testMenu = new Menu("test-menu").text("test", (ctx) => {
  ctx.reply("ok");
  setTimeout(() => {
    ctx.chatId && ctx.api.sendMessage(ctx.chatId, "ok 2");
  }, 5000);
});
bot.use(testMenu);
bot.command("test", (ctx) => {
  ctx.reply("test", {
    reply_markup: testMenu,
  });
});

bot.start();
//   .catch((reason) => {
//   console.log({ reason });
// });

console.log(`Server running at ${server.url}`);
