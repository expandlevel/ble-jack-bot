import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";
import swc from "@swc/core";
import { get } from "es-toolkit/compat";

export async function extractVideoLinks(pageContent: string) {
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
  const videoLinksData = $videoContent.extract({
    links: [
      {
        selector: "li",
        value: {
          size: "small",
          quality: "b",
          href: {
            selector: "a",
            value: (el) => {
              const href = $videoContent(el).attr("href");
              return href;
            },
          },
        },
      },
    ],
  });

  return videoLinksData;
}
