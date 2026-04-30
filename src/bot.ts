import { Bot, session } from "grammy";
import type { MyContext, SessionData } from "./types";
import { showPageList } from "./lib/show-page-list";
import { paginationMenu } from "./menus/pagination";
import { downloadMenu } from "./menus/download";
import { showMoreMenu } from "./menus/show-more";
import { server } from "./server";

const telegramToken = "8687944497:AAFHc7CViumqedmynC0tmx2Wc9LjbgTy2xo";

const bleToken = "503298381:oH2RWICXjZ4PigGna8SGrAumI7Wmrxt6ebk";

const isTelegramMode = false;

function initial(): SessionData {
  return { pageNumber: 1, selectedVideo: "", videoDownloadLinks: [] };
}

const bot = new Bot<MyContext>(isTelegramMode ? telegramToken : bleToken, {
  client: isTelegramMode
    ? {}
    : {
        apiRoot: "https://tapi.bale.ai",
      },
});

bot.use(session({ initial }));
bot.use(paginationMenu);
bot.use(downloadMenu);
bot.use(showMoreMenu);

bot.command("start", async (ctx) => {
  await showPageList(ctx);
});

bot.command("page", (ctx) => {
  const matchPage = Number(ctx.match);

  if (matchPage) {
    ctx.session.pageNumber = matchPage;
  }
  ctx.reply(`current page ${ctx.session.pageNumber}`);
});

bot.start();

console.log(`Server running at ${server.url}`);
