import { Impit } from "impit";
import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";
import swc from "@swc/core";
import { get } from "es-toolkit/compat";
import { extractVideoLinks } from "./lib/extract-video-links";

const impit = new Impit({
  browser: "chrome", // or "firefox"
  ignoreTlsErrors: true,
});

const pageList = await impit.fetch("http://pornhd.josex.net/new/1.html");
const pageListContent = await pageList.text();
// const pageListContent = demoContent;

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

const targetVideo = data.videos.at(13);
const fakeArray = [targetVideo];
for (const video of fakeArray) {
  if (!video || !video?.href) break;

  // const page = await impit.fetch(video.href);
  const page = await impit.fetch(
    "http://pornhd.josex.net/videos/Big-Tits/A-doctor-with-big-tits-pleased-a-guy-with-a-sweet-blowjob.html",
  );

  const pageContent = await page.text();

  if (!pageContent.length) break;

  const $pageContent = cheerio.load(pageContent);
  const coversData = $pageContent.extract({
    covers: [
      {
        selector: 'img[style="max-width: 99%; width: 300px;"]',
        value: (el) => {
          return $pageContent(el).attr("src");
        },
      },
    ],
  });
  const covers = coversData.covers;

  const videoLinks = await extractVideoLinks(pageContent);

  interface FullVideoDetails {
    name: string;
    cover: string;
    href: string;
    duration: string;
    date: string;
    covers: string[];
    links: {
      quality: string;
      size: string;
      shadowLink: string;
      downloadLink: string;
    }[];
  }
  const fullVideoDetails: FullVideoDetails = {
    name: video.name || "",
    cover: video.thumb || "",
    href: video.href,
    duration: video.duration || "",
    date: video.date || "",
    covers,
    links: [],
  };

  for (const videoLink of videoLinks.links) {
    if (!videoLink.href) break;

    try {
      const downloadLink = await fetch(videoLink.href);
      fullVideoDetails.links.push({
        quality: videoLink.quality || "",
        size: videoLink.size || "",
        shadowLink: videoLink.href,
        downloadLink: downloadLink.url,
      });
    } catch (e) {
      console.log({ e });
    }
  }
  console.log({ fullVideoDetails });
}
