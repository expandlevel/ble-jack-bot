import type { FullVideoDetails } from "../types";
import { extractVideoLinks } from "./extract-video-links";
import { impit } from "./utils";
import * as cheerio from "cheerio";

export async function extractPage(href: string) {
  const pageResponse = await impit.fetch(href);
  const pageContent = await pageResponse.text();

  if (!pageContent.length) return;

  const $pageContent = cheerio.load(pageContent);

  const pageData = $pageContent.extract({
    title: ".menu_razd",
    screenshots: [
      {
        selector: 'img[style="max-width: 99%; width: 300px;"]',
        value: (el) => {
          return $pageContent(el).attr("src");
        },
      },
    ],
  });

  if (!pageData.title) return null;

  const videoLinks = await extractVideoLinks(pageContent);

  const fullVideoDetails: FullVideoDetails = {
    title: pageData.title || "",
    screenshots: pageData.screenshots,
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

  return fullVideoDetails;
}
