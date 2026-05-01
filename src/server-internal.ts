import { webhookCallback } from "grammy";
import { bot } from "./bot-external";

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
});

console.log(`Server running at ${server.url}`);
