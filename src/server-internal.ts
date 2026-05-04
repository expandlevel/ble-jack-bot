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

    "/tmp_merged": async () => {
      const filePath = `./tmp_download/merged.mp4`;
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return Response.json({ status: "not found" });
      }
      return new Response(file);
    },
  },
  // tls: {
  //   cert: Bun.file("./certificates/internal.pem"),
  //   key: Bun.file("./certificates/internal-key.pem"),
  // },
});

bot.start();

console.log(`Server running at ${server.url}`);
