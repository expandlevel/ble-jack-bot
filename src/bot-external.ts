import { Bot, session } from "grammy";
import type { MyContext, SessionData } from "./types";
import { showPageList } from "./lib/show-page-list";
import { paginationMenu } from "./menus/pagination";
import { downloadMenu } from "./menus/download";
import { showMoreMenu } from "./menus/show-more";
import { server } from "./server-external";
import { downloadFile } from "./lib/download-file";
import { splitFile } from "./lib/split-file";
import { mergeChunks } from "./lib/merge-chunks";
import { sendChunks } from "./lib/send-chunks";
import { bleApiBaseUrl, config } from "./config";
import { cleanupFiles } from "./lib/cleanup-files";
import os from "node:os";

function initial(): SessionData {
  return { pageNumber: 1, selectedVideo: "", videoDownloadLinks: [] };
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
  await showPageList(ctx);
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

bot.command("test", async (ctx) => {
  // await sendChunks(ctx);

  // Get the local network interfaces
  const networkInterfaces = os.networkInterfaces();

  // Find the IP address of your machine
  let ipAddress = "";
  for (const interfaceName in networkInterfaces) {
    for (const networkInterface of networkInterfaces[interfaceName]) {
      // Exclude internal network interfaces (localhost, etc.)
      if (networkInterface.family === "IPv4" && !networkInterface.internal) {
        ipAddress = networkInterface.address;
        break;
      }
    }
  }

  console.log("Server IP Address:", ipAddress);
  ctx.reply("ok");
});

bot.start();

console.log(`Server running at ${server.url}`);
