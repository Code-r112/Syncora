import { jsonResponse } from "@/utils/responses";
import type { GetDefaultAudioType } from "@beatsync/shared";

export async function handleGetDefaultAudio(_req: Request) {
  return jsonResponse([]);
}
