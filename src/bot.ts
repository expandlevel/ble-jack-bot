import {
  Bot,
  InlineKeyboard,
  type SessionFlavor,
  Context,
  session,
  type CommandContext,
} from "grammy";
import { Impit } from "impit";
import * as cheerio from "cheerio";
import { Menu } from "@grammyjs/menu";
import { extractPageList } from "./lib/extract-page-list";

const telegramToken = "8687944497:AAFHc7CViumqedmynC0tmx2Wc9LjbgTy2xo";

const bleToken = "503298381:oH2RWICXjZ4PigGna8SGrAumI7Wmrxt6ebk";

const isTelegramMode = false;

const impit = new Impit({
  browser: "chrome",
  ignoreTlsErrors: true,
});

interface SessionData {
  pageNumber: number;
}

type MyContext = Context & SessionFlavor<SessionData>;

function initial(): SessionData {
  return { pageNumber: 1 };
}

const bot = new Bot<MyContext>(isTelegramMode ? telegramToken : bleToken, {
  client: isTelegramMode
    ? {}
    : {
        apiRoot: "https://tapi.bale.ai",
      },
});

bot.use(session({ initial }));

const paginationMenu = new Menu<MyContext>("pagination-menu")
  .text("next", async (ctx) => {
    ctx.session.pageNumber++;

    await showPageList(ctx);
  })
  .text("prev", (ctx) => ctx.reply("You pressed A!"));

// const showMoreMenu = new Menu("show-more").text("show more", (ctx) => {
//   console.log({ ctx });

//   ctx.reply("You pressed B!");
// });

bot.use(paginationMenu);
// bot.use(showMoreMenu);

async function showPageList(ctx: MyContext) {
  ctx.reply(`current page ${ctx.session.pageNumber}`);

  const pageListData = await extractPageList(ctx.session.pageNumber);

  for (const pageData of pageListData.videos) {
    if (!pageData.thumb) break;

    await ctx.replyWithPhoto(pageData.thumb, {
      caption: pageData.name,
      // reply_markup: showMoreMenu,
    });
  }

  ctx.reply(`pagination - page ${ctx.session.pageNumber}`, {
    reply_markup: paginationMenu,
  });
}

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

const server = Bun.serve({
  port: 6700,
  routes: {
    "/": (request) => {
      return Response.json({ message: "hi" });
    },
  },
});

console.log(`Server running at ${server.url}`);
