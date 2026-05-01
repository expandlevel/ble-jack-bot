import { z } from "zod";

export const bleApiBaseUrl = "https://tapi.bale.ai";

const ConfigSchema = z.object({
  bleExternalToken: z.string(),
  bleInternalToken: z.string(),
});

export const config = ConfigSchema.parse({
  bleExternalToken: Bun.env.BLE_EXTERNAL_BOT_TOKEN,
  bleInternalToken: Bun.env.BLE_INTERNAL_BOT_TOKEN,
});
