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
  },
  // tls: {
  //   cert: Bun.file("./certificates/external.pem"),
  //   key: Bun.file("./certificates/external-key.pem"),
  // },
});

bot.start();

console.log(`Server running at ${server.url}`);
