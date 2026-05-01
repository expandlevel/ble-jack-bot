import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../types";
import { extractPage } from "../lib/extract-page";
import type { InputMediaPhoto } from "grammy/types";
import { downloadMenu } from "./download";

export const showMoreMenu = new Menu<MyContext>("show-more").text(
  "show more",
  async (ctx) => {
    await ctx.answerCallbackQuery();

    const caption = ctx.update.callback_query.message?.caption;
    const href = caption?.split("\n")[2];

    const message = await ctx.reply(`search for: ${href}`);

    if (!href) return;

    ctx.session.selectedVideo = href;

    const pageData = await extractPage(href);

    if (pageData?.links?.length) {
      ctx.session.videoDownloadLinks = pageData?.links.map(
        (link) => link.downloadLink,
      );
    }

    if (!pageData || !pageData.screenshots.length) {
      if (ctx.chatId) {
        return ctx.api.editMessageText(
          ctx.chatId,
          message.message_id,
          "not found",
        );
      } else {
        return ctx.reply("not found");
      }
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

    if (ctx.chatId) {
      await ctx.api.deleteMessage(ctx.chatId, message.message_id);
    }

    await ctx.replyWithMediaGroup(mediaGroup);

    pageData.title &&
      ctx.reply(
        `
        ${pageData.title} \n\n
        ${linksLabel}
        `,
        {
          reply_markup: downloadMenu,
        },
      );
  },
);
