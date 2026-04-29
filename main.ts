import { Impit } from "impit";
import * as cheerio from "cheerio";
import { write } from "bun";
import demoContent from "./example.content.txt";
import CryptoJS from "crypto-js";
import swc from "@swc/core";
import { get } from "es-toolkit/compat";

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
  console.log(video);
  if (!video || !video?.href) break;

  // const page = await impit.fetch(video.href);
  // const page = await impit.fetch(
  //   "http://pornhd.josex.net/videos/Big-Tits/A-doctor-with-big-tits-pleased-a-guy-with-a-sweet-blowjob.html",
  // );
  const page = await impit.fetch(
    "http://pornhd.josex.net/videos/Russian/Gorgeous-Russian-girl-really-wants-to-get-fucked-in-the-pussy.html",
  );

  const pageContent = await page.text();
  console.log({ pageContent });

  if (!pageContent.length) break;

  const $pageContent = cheerio.load(pageContent);

  const injectedScript = $pageContent("script").eq(5);
  const injectedScriptText = injectedScript.text();

  const injectedScriptParsed = await swc.parse(injectedScriptText, {
    syntax: "ecmascript",
    isModule: false,
  });

  const secretKey = get(
    injectedScriptParsed,
    "body[0].declarations[0].init.value",
    "",
  ).toString();

  const payloadExpressionValue = get(
    injectedScriptParsed,
    "body[2].expression.arguments[0].expression.arguments[0].expression.callee.object.arguments[0].expression.value",
    "{}",
  ).toString();
  const payload = JSON.parse(payloadExpressionValue);

  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(payload.ct),
    iv: CryptoJS.enc.Hex.parse(payload.iv),
    salt: CryptoJS.enc.Hex.parse(payload.s),
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey);
  const decryptedScript = decrypted.toString(CryptoJS.enc.Utf8);

  const decryptedScriptParsed = await swc.parse(decryptedScript, {
    syntax: "ecmascript",
    isModule: false,
  });
  const videoContentScript =
    get(decryptedScriptParsed, "body[0].expression.value")?.toString() || "";

  const videoContentParsed = await swc.parse(videoContentScript, {
    syntax: "ecmascript",
    isModule: false,
  });
  const videoContent =
    get(videoContentParsed, "body[0].expression.right.value")?.toString() || "";

  const $videoContent = cheerio.load(videoContent);
  const videoInfo = $videoContent.extract({
    items: [
      {
        selector: "li",
        value: {
          size: "small",
          quality: "b",
          href: {
            selector: "a",
            value: (el) => {
              const href = $pageListContent(el).attr("href");
              return href;
            },
          },
        },
      },
    ],
  });
  console.log({ videoName: video.name });
  console.log({ videoInfo: JSON.stringify(videoInfo) });

  for (const info of videoInfo.items) {
    if (info.href) {
      try {
        const downloadLink = await fetch(info.href);
        console.log({ info, downloadLink: downloadLink.url });
      } catch (e) {
        console.log({ e });
      }
    }
  }
}
