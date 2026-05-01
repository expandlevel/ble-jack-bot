import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../types";
import { showPageList } from "../lib/show-page-list";

export const paginationMenu = new Menu<MyContext>("pagination-menu")
  .text("next", async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.pageNumber++;

    const pageNumber = ctx.session.pageNumber;
    ctx.reply(`current page ${pageNumber}`);

    showPageList(ctx);
  })
  .text("prev", async (ctx) => {
    await ctx.answerCallbackQuery();

    if (ctx.session.pageNumber !== 1) {
      ctx.session.pageNumber--;

      const pageNumber = ctx.session.pageNumber;
      ctx.reply(`current page ${pageNumber}`);

      showPageList(ctx);
    }
  });
