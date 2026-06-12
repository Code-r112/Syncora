import {
  RawSearchResponseSchema,
  SearchParamsSchema,
  StreamResponseSchema,
  TrackParamsSchema,
} from "@beatsync/shared/";
import type { z } from "zod";
import ytSearch from "yt-search";
import play from "play-dl";

// In-memory cache to map numeric IDs back to YouTube video IDs
const idMapCache = new Map<number, string>();

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export class MusicProviderManager {
  async search(query: string, offset = 0): Promise<z.infer<typeof RawSearchResponseSchema>> {
    try {
      const { q } = SearchParamsSchema.parse({ q: query, offset });

      const r = await ytSearch(q);
      const videos = r.videos.slice(0, 20);

      const items = videos.map((v) => {
        const numericId = hashStringToInt(v.videoId);
        idMapCache.set(numericId, v.videoId);

        return {
          id: numericId,
          title: v.title,
          duration: v.seconds,
          parental_warning: false,
          track_number: 1,
          performer: {
            id: hashStringToInt(v.author.name),
            name: v.author.name,
          },
          album: {
            id: v.videoId,
            title: "YouTube Audio",
            duration: v.seconds,
            parental_warning: false,
            release_date_original: new Date().toISOString(),
            image: {
              small: v.thumbnail,
              thumbnail: v.thumbnail,
              large: v.image,
            },
          },
        };
      });

      const data = {
        data: {
          tracks: {
            limit: 20,
            offset: 0,
            total: 20,
            items,
          },
        },
      };

      return RawSearchResponseSchema.parse(data);
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`, { cause: error });
    }
  }

  async downloadTrack(trackId: number, outputPath: string, fallbackSearchName?: string): Promise<void> {
    try {
      const { id } = TrackParamsSchema.parse({ id: trackId });

      let videoId = idMapCache.get(id);

      // If server restarted, cache is empty. Use fallback search to recover seamlessly!
      if (!videoId && fallbackSearchName) {
        const ytSearch = (await import("yt-search")).default;
        const result = await ytSearch(fallbackSearchName);
        if (result.videos.length > 0) {
          videoId = result.videos[0].videoId;
          idMapCache.set(id, videoId);
        }
      }

      if (!videoId) {
        throw new Error("Track ID not found in cache. Please search again.");
      }

      // Use yt-dlp to directly download the audio, as play-dl has a known crash bug with Bun's URL parser.
      // We use ffmpeg-static to properly convert and mux the DASH stream into a clean MP3 file
      // so that the browser's decodeAudioData doesn't crash on fragmented atoms.
      const ytDlp = (await import("yt-dlp-exec")).default;
      const ffmpegPath = (await import("ffmpeg-static")).default;

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      await ytDlp(videoUrl, {
        extractAudio: true,
        audioFormat: "mp3",
        ffmpegLocation: ffmpegPath || undefined,
        output: outputPath,
        noCheckCertificates: true,
        noWarnings: true,
      });
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`, { cause: error });
    }
  }
}

// Export singleton instance
export const MUSIC_PROVIDER_MANAGER = new MusicProviderManager();
