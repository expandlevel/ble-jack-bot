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
  .text("prev", async (ctx) => {
    if (ctx.session.pageNumber !== 1) {
      ctx.session.pageNumber--;

      await showPageList(ctx);
    }
  });
bot.use(paginationMenu);

// const showMoreMenu = new Menu("show-more").text(
//   {
//     text: "show more",
//     payload: "payload",
//   },
//   (ctx) => {
//     console.log({ ctx });

//     const m = String(ctx.match);
//     ctx.reply(`show more! ${m}`);
//   },
// );
// bot.use(showMoreMenu);

async function showPageList(ctx: MyContext) {
  // const pageNumber = ctx.session.pageNumber;
  const pageNumber = 20;

  ctx.reply(`current page ${pageNumber}`);

  const pageListData = await extractPageList(pageNumber);

  for (const pageData of pageListData.videos) {
    if (!pageData.thumb) break;

    console.log({ pageData });

    //
    const showMoreMenu = new InlineKeyboard().text("show more", pageData.slug);

    //
    await ctx.replyWithPhoto(pageData.thumb, {
      caption: `# ${pageData.name} \n${pageData.duration}`,
      reply_markup: showMoreMenu,
    });
  }

  ctx.reply(`pagination - page ${pageNumber}`, {
    reply_markup: paginationMenu,
  });
}

// bot.callbackQuery("click-payload", async (ctx) => {
//   console.log({ payload: ctx.callbackQuery.message?.reply_markup });

//   await ctx.answerCallbackQuery({
//     text: `You were curious, indeed!`,
//   });
// });
//
bot.on("callback_query:data", async (ctx) => {
  console.log("Unknown button event with payload", ctx.callbackQuery.data);
  await ctx.answerCallbackQuery(); // remove loading animation
});
//

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
