import { Impit } from "impit";
import * as cheerio from "cheerio";

const impit = new Impit({
  browser: "chrome", // or "firefox"
  ignoreTlsErrors: true,
});

const page = await impit.fetch("https://pornhd.josex.net/new/8.html");
const content = await page.text();

const $ = cheerio.load(content);

const data = $(".spisok").extract({
  videos: [
    {
      selector: ".video",
      value: {
        name: "span:first",
        href: {
          selector: "a:first",
          value: (el) => {
            const href = $(el).attr("href");
            return href;
          },
        },
        thumb: {
          selector: "img:first",
          value: (el) => {
            const src = $(el).attr("src");
            return src;
          },
        },
        duration: "span.duration",
        // date: "div.vote + div",
      },
    },
  ],
});

data.videos.forEach((video) => {
  console.log(video);
});
