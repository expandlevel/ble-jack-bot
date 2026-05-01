import { webhookCallback } from "grammy";
import { config } from "./config";
import { bot } from "./bot-external";

export const server = Bun.serve({
  port: 6700,
  routes: {
    "/": () => {
      return Response.json({ message: "hi" });
    },
    "/webhook": (req) => {
      const handleUpdate = webhookCallback(bot, "bun");
      return handleUpdate(req);
    },
    "/tmp_download/parts/:partName": (request) => {
      const partName = request.params.partName;

      const filePath = `./tmp_download/parts/${partName}`;

      return new Response(Bun.file(filePath));
    },
  },
});

console.log(`Server running at ${server.url}`);
