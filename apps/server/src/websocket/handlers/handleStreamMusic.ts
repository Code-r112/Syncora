import { IS_DEMO_MODE } from "@/demo";
import { generateAudioFileName, uploadBytes } from "@/lib/r2";
import { globalManager } from "@/managers";
import { MUSIC_PROVIDER_MANAGER } from "@/managers/MusicProviderManager";
import { sendBroadcast } from "@/utils/responses";
import type { HandlerFunction } from "@/websocket/types";
import type { ExtractWSRequestFrom } from "@beatsync/shared";

export const handleStreamMusic: HandlerFunction<ExtractWSRequestFrom["STREAM_MUSIC"]> = async ({
  ws,
  message,
  server,
}) => {
  if (IS_DEMO_MODE) return;
  const roomId = ws.data.roomId;

  // Require room to exist before processing stream request
  const room = globalManager.getRoom(roomId);
  if (!room) {
    console.error(`Stream request failed: Room ${roomId} not found`);
    return;
  }

  // Check if this track is already being streamed
  const trackId = message.trackId.toString();
  if (room.hasActiveStreamJob(trackId)) {
    console.log(`Track ${trackId} is already being streamed for room ${roomId}, ignoring duplicate request`);
    return;
  }

  // Add job to room and broadcast updated count
  room.addStreamJob(trackId);
  sendBroadcast({
    server,
    roomId,
    message: {
      type: "STREAM_JOB_UPDATE",
      activeJobCount: room.getActiveStreamJobCount(),
    },
  });

  try {
    // Use provided track name or fallback to track ID
    const originalName = message.trackName ?? `track-${message.trackId}`;

    // Generate a unique filename
    const fileName = generateAudioFileName(`${originalName}.mp3`);

    // Download the audio file using play-dl's built-in robust downloading
    // This bypasses YouTube's strict 403 Forbidden datacenter IPs rules
    const { AUDIO_DIR_PATH } = await import("@/demo");
    const { resolve } = await import("path");
    const filePath = resolve(AUDIO_DIR_PATH, fileName);
    
    console.log(`Downloading audio to: ${filePath}`);
    await MUSIC_PROVIDER_MANAGER.downloadTrack(message.trackId, filePath, originalName);

    // Pass the local backend URL to the clients to completely bypass CORS!
    // We add a timestamp query parameter to force the browser to bypass any corrupted cached files!
    const r2Url = `${process.env.S3_PUBLIC_URL}/audio/${encodeURIComponent(fileName)}?t=${Date.now()}`;

    // Add the audio source to the room and get updated sources list
    const sources = room.addAudioSource({ 
      url: r2Url,
      metadata: message.metadata
    });

    console.log(`Successfully uploaded track to R2: ${r2Url}`);
    console.log(`Broadcasting new audio sources to room ${roomId}: ${sources.length} total sources`);

    // Broadcast to all room members that new audio is available
    sendBroadcast({
      server,
      roomId,
      message: {
        type: "ROOM_EVENT",
        event: {
          type: "SET_AUDIO_SOURCES",
          sources,
        },
      },
    });
  } catch (error) {
    console.error("Error in handleStreamMusic:", error);
  } finally {
    // Job completed or failed - remove from tracking and notify clients
    room.removeStreamJob(trackId);
    sendBroadcast({
      server,
      roomId,
      message: {
        type: "STREAM_JOB_UPDATE",
        activeJobCount: room.getActiveStreamJobCount(),
      },
    });
  }
};
