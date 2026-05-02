import { webhookCallback } from "grammy";
import { bot } from "./bot-internal";
import { config } from "./config";

export const server = Bun.serve({
  // port: 6701,
  // port: 443,
  port: 88,
  routes: {
    "/": async () => {
      return Response.json({ message: "hi internal" });
    },
    "/webhook": (req) => {
      console.log("webhook called");

      // const handleUpdate = webhookCallback(bot, "bun");
      // return handleUpdate(req);
      return Response.json({ status: "ok" });
    },
    // "set-webhook": async (req) => {
    //   const response = await bot.api.setWebhook(
    //     "https://5.10.249.18:6701/webhook",
    //   );

    //   return Response.json({ status: response });
    // },
  },
  tls: {
    cert: Bun.file("./certificates/internal.pem"),
    key: Bun.file("./certificates/internal-key.pem"),
  },
});

// bot.start();

console.log(`Server running at ${server.url}`);
