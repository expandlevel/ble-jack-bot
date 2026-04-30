import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../types";

export const downloadMenu = new Menu<MyContext>("download-menu")
  .text("720", (ctx) => {
    const linkDownload = ctx.session.videoDownloadLinks[0];
    ctx.reply(`download 720 ${linkDownload}`);
  })
  .text("480", (ctx) => {
    const linkDownload = ctx.session.videoDownloadLinks[1];
    ctx.reply(`download 480 ${linkDownload}`);
  })
  .text("360", (ctx) => {
    const linkDownload = ctx.session.videoDownloadLinks[2];
    ctx.reply(`download 360 ${linkDownload}`);
  })
  .text("240", (ctx) => {
    const linkDownload = ctx.session.videoDownloadLinks[3];
    ctx.reply(`download 240 ${linkDownload}`);
  });
