import { webhookCallback } from "grammy";
import { bot } from "./bot-external";

export const server = Bun.serve({
  // port: 88,
  port: 80,
  routes: {
    "/": () => {
      return Response.json({ message: "hi external" });
    },
    "/webhook": (req) => {
      console.log("webhook external called");

      return webhookCallback(bot, "bun")(req);
    },
    "/tmp_download": async () => {
      const filePath = `./tmp_download/tmp.mp4`;
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return Response.json({ status: "not found" });
      }
      return new Response(file);
    },
    "/tmp_download/parts/:partName": async (request) => {
      const partName = request.params.partName;

      const filePath = `./tmp_download/parts/${partName}`;
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return Response.json({ status: "not found" });
      }

      return new Response(file, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(file.size),
        },
      });
    },
  },
  // tls: {
  //   cert: Bun.file("./certificates/external.pem"),
  //   key: Bun.file("./certificates/external-key.pem"),
  // },
});

bot.start();

console.log(`Server running at ${server.url}`);
