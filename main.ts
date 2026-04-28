import { Impit } from "impit";
import * as cheerio from "cheerio";
import { write } from "bun";

const impit = new Impit({
  browser: "chrome", // or "firefox"
  ignoreTlsErrors: true,
});

const pageList = await impit.fetch("https://pornhd.josex.net/new/10.html");
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
        // date: "div.vote + div",
      },
    },
  ],
});

data.videos.slice(0, 1).forEach(async (video) => {
  console.log(video);
  if (!video.href) return;

  const page = await impit.fetch(video.href);
  const pageContent = await page.text();

  console.log({ pageContent });
  await write("./downloads/content.html", pageContent);
});
