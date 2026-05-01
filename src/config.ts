import { z } from "zod";

export const bleApiBaseUrl = "https://tapi.bale.ai";

const ConfigSchema = z.object({
  bleExternalToken: z.string(),
  bleInternalToken: z.string(),
});

// export const config = ConfigSchema.parse({
//   bleExternalToken: Bun.env.BLE_EXTERNAL_BOT_TOKEN,
//   bleInternalToken: Bun.env.BLE_INTERNAL_BOT_TOKEN,
// });
//

const BLE_EXTERNAL_BOT_TOKEN = "503298381:oH2RWICXjZ4PigGna8SGrAumI7Wmrxt6ebk";

const BLE_INTERNAL_BOT_TOKEN = "1471840337:Dvx4WC_TXCw-BXCqZ1j3iLri9Vyf6m5gjsE";
export const config = ConfigSchema.parse({
  bleExternalToken: BLE_EXTERNAL_BOT_TOKEN,
  bleInternalToken: BLE_INTERNAL_BOT_TOKEN,
});
//
