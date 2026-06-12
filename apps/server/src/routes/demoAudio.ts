import { AUDIO_FILE_CACHE, AUDIO_DIR_PATH } from "@/demo";
import { corsHeaders, errorResponse } from "@/utils/responses";
import { resolve } from "path";

export async function handleServeAudio(pathname: string): Promise<Response> {
  const filename = decodeURIComponent(pathname.slice("/audio/".length));

  const cached = AUDIO_FILE_CACHE.get(filename);
  if (cached) {
    return new Response(cached.bytes.buffer as ArrayBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": cached.type,
        "Content-Length": cached.bytes.byteLength.toString(),
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  }

  // Fallback to disk for dynamically downloaded files
  try {
    const filePath = resolve(AUDIO_DIR_PATH, filename);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file, {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600, immutable",
        },
      });
    }
  } catch (e) {
    console.error("Error serving audio file from disk", e);
  }

  return errorResponse("File not found", 404);
}
