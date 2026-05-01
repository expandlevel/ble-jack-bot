import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../types";

// TODO: get href from message caption
const href = "https://google.com";
export const downloadMenu = new Menu<MyContext>("download-menu")
  .text("720", (ctx) => {
    const caption = ctx.update.callback_query.message?.caption;
    const href2 = caption?.split("\n")[2];
    console.log({ href2 });

    const videoDownloadLinks = ctx.session.videoDownloadLinks.get(href);
    if (videoDownloadLinks) {
      const linkDownload = videoDownloadLinks[0];
      ctx.reply(`download 720 ${linkDownload}`);
    }
  })
  .text("480", (ctx) => {
    const videoDownloadLinks = ctx.session.videoDownloadLinks.get(href);
    if (videoDownloadLinks) {
      const linkDownload = videoDownloadLinks[1];
      ctx.reply(`download 480 ${linkDownload}`);
    }
  })
  .text("360", (ctx) => {
    const videoDownloadLinks = ctx.session.videoDownloadLinks.get(href);
    if (videoDownloadLinks) {
      const linkDownload = videoDownloadLinks[2];
      ctx.reply(`download 360 ${linkDownload}`);
    }
  })
  .text("240", (ctx) => {
    const videoDownloadLinks = ctx.session.videoDownloadLinks.get(href);
    if (videoDownloadLinks) {
      const linkDownload = videoDownloadLinks[3];
      ctx.reply(`download 240 ${linkDownload}`);
    }
  });
