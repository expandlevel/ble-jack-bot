import { webhookCallback } from "grammy";
import { bot } from "./bot-internal";

export const server = Bun.serve({
  port: 6701,
  routes: {
    "/": async () => {
      return Response.json({ message: "hi" });
    },
    "/webhook": (req) => {
      const handleUpdate = webhookCallback(bot, "bun");
      return handleUpdate(req);
    },
  },
  tls: {
    cert: Bun.file("./certificates/internal.pem"),
    key: Bun.file("./certificates/internal-key.pem"),
  },
});

// bot.start();

console.log(`Server running at ${server.url}`);
