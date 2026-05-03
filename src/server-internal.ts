import { webhookCallback } from "grammy";
import { bot } from "./bot-internal";
import { config } from "./config";

export const server = Bun.serve({
  port: 88,
  routes: {
    "/": async () => {
      return Response.json({ message: "hi internal" });
    },
    "/webhook": (req) => {
      console.log("webhook internal called");

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
  //   cert: Bun.file("./certificates/internal.pem"),
  //   key: Bun.file("./certificates/internal-key.pem"),
  // },
});

bot.start();

console.log(`Server running at ${server.url}`);
