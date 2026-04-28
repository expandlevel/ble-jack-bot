import { Bot } from "grammy";
import { Impit } from "impit";
import * as cheerio from "cheerio";
// import demoContent from "./example.content.txt";

const telegramToken = "8687944497:AAFHc7CViumqedmynC0tmx2Wc9LjbgTy2xo";

const bleToken = "503298381:oH2RWICXjZ4PigGna8SGrAumI7Wmrxt6ebk";

const isTelegramMode = true;

const impit = new Impit({
  browser: "chrome", // or "firefox"
  ignoreTlsErrors: true,
});

const bot = new Bot(isTelegramMode ? telegramToken : bleToken, {
  client: isTelegramMode
    ? {}
    : {
        apiRoot: "https://tapi.bale.ai",
      },
});

bot.command("start", (ctx) => {
  ctx.reply("Welcome! Up and running.");
});

bot.command("list", async (ctx) => {
  const page = await impit.fetch("https://pornhd.josex.net/new/8.html");
  const content = await page.text();

  // const content = demoContent;

  const $ = cheerio.load(content);

  const data = $(".spisok").extract({
    videos: [
      {
        selector: ".video",
        value: {
          name: "span:first",
          href: {
            selector: "a:first",
            value: (el) => {
              const href = $(el).attr("href");
              return href;
            },
          },
          thumb: {
            selector: "img:first",
            value: (el) => {
              const src = $(el).attr("src");
              return src;
            },
          },
          duration: "span.duration",
          // date: "div.vote + div",
        },
      },
    ],
  });

  data.videos.forEach(async (video) => {
    console.log(video);
    if (!video.thumb) return;

    await ctx.replyWithPhoto(video.thumb, {
      caption: video.name,
    });
  });

  ctx.reply("ok");
});

// bot.on("message", (ctx) => {
//   ctx.reply("Got another message!");
// });

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
