import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../types";
import { showPageList } from "../lib/show-page-list";

export const paginationMenu = new Menu<MyContext>("pagination-menu")
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
