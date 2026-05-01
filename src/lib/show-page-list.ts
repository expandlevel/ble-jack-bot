import { paginationMenu } from "../menus/pagination";
import { showMoreMenu } from "../menus/show-more";
import type { MyContext } from "../types";
import { extractPageList } from "./extract-page-list";

export async function showPageList(ctx: MyContext) {
  const pageNumber = ctx.session.pageNumber;

  const pageListData = await extractPageList(pageNumber);

  for (const pageData of pageListData.videos) {
    if (!pageData.thumb) break;

    if (!ctx.chatId) return;

    ctx.api.sendPhoto(ctx.chatId, pageData.thumb, {
      caption: `# ${pageData.name}\n${pageData.duration}\n${pageData.href}`,
      reply_markup: showMoreMenu,
    });
  }

  // if (ctx.chatId) {
  //   ctx.api.sendMessage(ctx.chatId, `page ${pageNumber}`, {
  //     reply_markup: paginationMenu,
  //   });
  // }
}
