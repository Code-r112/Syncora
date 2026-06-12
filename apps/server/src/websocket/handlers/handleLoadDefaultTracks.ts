import { IS_DEMO_MODE } from "@/demo";
import { listObjectsWithPrefix } from "@/lib/r2";
import { sendBroadcast } from "@/utils/responses";
import { requireCanMutate } from "@/websocket/middlewares";
import type { HandlerFunction } from "@/websocket/types";
import type { ExtractWSRequestFrom } from "@beatsync/shared";

export const handleLoadDefaultTracks: HandlerFunction<ExtractWSRequestFrom["LOAD_DEFAULT_TRACKS"]> = async () => {
  // Cloud-hosted default tracks are disabled since S3 has been removed.
  return;
};
