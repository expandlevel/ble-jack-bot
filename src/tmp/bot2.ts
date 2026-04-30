import { Bot } from "grammy";

const telegramToken = "8687944497:AAFHc7CViumqedmynC0tmx2Wc9LjbgTy2xo";

const bleToken = "503298381:oH2RWICXjZ4PigGna8SGrAumI7Wmrxt6ebk";

const isTelegramMode = false;

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

bot.command("deploy", (ctx) => {
  const externalId = ctx.match;

  console.log({ ctx });

  console.log({
    message: ctx.message,
    entities: ctx.message?.entities,
    externalId,
  });

  ctx.reply("ok");
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
