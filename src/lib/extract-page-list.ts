import { impit } from "./utils";
import * as cheerio from "cheerio";

export async function extractPageList(pageNumber: number) {
  const pageList = await impit.fetch(
    `http://pornhd.josex.net/new/${pageNumber}.html`,
  );
  const pageListContent = await pageList.text();

  const $pageListContent = cheerio.load(pageListContent);

  const data = $pageListContent(".spisok").extract({
    videos: [
      {
        selector: ".video",
        value: {
          name: "span:first",
          href: {
            selector: "a:first",
            value: (el) => {
              const href = $pageListContent(el).attr("href");
              return href;
            },
          },
          thumb: {
            selector: "img:first",
            value: (el) => {
              const src = $pageListContent(el).attr("src");
              return src;
            },
          },
          duration: "span.duration",
          date: "div.vote + div",
        },
      },
    ],
  });

  return data;
}
