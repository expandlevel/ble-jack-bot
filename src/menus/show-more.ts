import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../types";
import { extractPage } from "../lib/extract-page";
import type { InputMediaPhoto } from "grammy/types";
import { downloadMenu } from "./download";

export const showMoreMenu = new Menu<MyContext>("show-more").text(
  "show more",
  async (ctx) => {
    const caption = ctx.update.callback_query.message?.caption;
    const href = caption?.split("\n")[2];

    console.log("show more", { href });
    await ctx.reply(`search for: ${href}`);

    // const message = await ctx.reply(`search for: ${href}`);
    // const message_id = message.message_id;
    const message_id = 0;

    if (!href) return;

    show(href, message_id, ctx);
  },
);

async function show(href: string, message_id: number, ctx: MyContext) {
  const pageData = await extractPage(href);

  if (pageData?.links?.length) {
    ctx.session.videoDownloadLinks = pageData?.links.map(
      (link) => link.downloadLink,
    );
  }

  if (!pageData || !pageData.screenshots.length) {
    // if (ctx.chatId) {
    //   return ctx.api.editMessageText(ctx.chatId, message_id, "not found");
    // } else {
    return ctx.api.sendMessage(Number(ctx.chatId), "not found");
    // }
  }

  const mediaGroup: InputMediaPhoto[] = pageData.screenshots.map(
    (screenshot) => ({
      type: "photo",
      media: screenshot,
    }),
  );

  const linksLabel = pageData.links
    .map((link) => `${link.quality}`)
    .join(" | ");

  // if (ctx.chatId) {
  //   await ctx.api.deleteMessage(ctx.chatId, message_id);
  // }

  if (!ctx.chatId) return;

  ctx.api.sendMediaGroup(ctx.chatId, mediaGroup).then(() => {
    pageData.title &&
      ctx.api.sendMessage(
        Number(ctx.chatId),
        `
        ${pageData.title} \n\n
        ${linksLabel}
        `,
        {
          reply_markup: downloadMenu,
        },
      );
  });
}
