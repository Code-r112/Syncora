import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

import { useCanMutate, useGlobalStore } from "@/store/global";
import { FullPreview } from "./FullPreview";
import { YoutubePlayer } from "../YoutubePlayer";
import { Play, Bell, History, Settings } from "lucide-react";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum } from "@beatsync/shared";
import { toast } from "sonner";
import { SearchResults } from "./SearchResults";

const LATEST_SONGS = [
  {
    id: 9002,
    title: "Blinding Lights",
    artist: "The Weeknd",
    image: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    searchQuery: "The Weeknd - Blinding Lights",
  },
  {
    id: 9004,
    title: "Shape of You",
    artist: "Ed Sheeran",
    image: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
    searchQuery: "Ed Sheeran - Shape of You",
  },
  {
    id: 9005,
    title: "Brown Munde",
    artist: "AP Dhillon",
    image: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg",
    searchQuery: "Brown Munde AP Dhillon",
  },
  {
    id: 9006,
    title: "Despacito",
    artist: "Luis Fonsi, Daddy Yankee",
    image: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    searchQuery: "Despacito Luis Fonsi",
  },
  {
    id: 9008,
    title: "Levitating",
    artist: "Dua Lipa",
    image: "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg",
    searchQuery: "Levitating Dua Lipa",
  },
  {
    id: 9009,
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    image: "https://i.ytimg.com/vi/E07s5ZYygMg/hqdefault.jpg",
    searchQuery: "Watermelon Sugar Harry Styles",
  },
  {
    id: 9010,
    title: "Excuses",
    artist: "AP Dhillon",
    image: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg",
    searchQuery: "Excuses AP Dhillon",
  },
  {
    id: 9011,
    title: "Peaches",
    artist: "Justin Bieber",
    image: "https://i.ytimg.com/vi/tQ0yjYUFKAE/hqdefault.jpg",
    searchQuery: "Peaches Justin Bieber",
  },
  {
    id: 9013,
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    image: "https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg",
    searchQuery: "Stay The Kid LAROI",
  },
  {
    id: 9014,
    title: "Bad Habits",
    artist: "Ed Sheeran",
    image: "https://i.ytimg.com/vi/YQHsXMglC9A/hqdefault.jpg",
    searchQuery: "Bad Habits Ed Sheeran",
  },
  {
    id: 9016,
    title: "Industry Baby",
    artist: "Lil Nas X",
    image: "https://i.ytimg.com/vi/UTHLKHL_whs/hqdefault.jpg",
    searchQuery: "Industry Baby Lil Nas X",
  },
  {
    id: 9017,
    title: "Heat Waves",
    artist: "Glass Animals",
    image: "https://i.ytimg.com/vi/mRD0-GxqHVo/hqdefault.jpg",
    searchQuery: "Heat Waves Glass Animals",
  },
  {
    id: 9019,
    title: "Dance Monkey",
    artist: "Tones And I",
    image: "https://i.ytimg.com/vi/q0hyYWKXF0Q/hqdefault.jpg",
    searchQuery: "Dance Monkey Tones And I",
  },
  {
    id: 9020,
    title: "Someone You Loved",
    artist: "Lewis Capaldi",
    image: "https://i.ytimg.com/vi/bCuhuePlP8o/hqdefault.jpg",
    searchQuery: "Someone You Loved Lewis Capaldi",
  },
  {
    id: 9021,
    title: "Senorita",
    artist: "Shawn Mendes",
    image: "https://i.ytimg.com/vi/Pkh8UtuejGw/hqdefault.jpg",
    searchQuery: "Senorita Shawn Mendes",
  },
  {
    id: 9023,
    title: "Believer",
    artist: "Imagine Dragons",
    image: "https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg",
    searchQuery: "Believer Imagine Dragons",
  },
  {
    id: 9024,
    title: "Let Me Down Slowly",
    artist: "Alec Benjamin",
    image: "https://i.ytimg.com/vi/50VNCymT-Cs/hqdefault.jpg",
    searchQuery: "Let Me Down Slowly Alec Benjamin",
  },
  {
    id: 9025,
    title: "Dandelions",
    artist: "Ruth B",
    image: "https://i.ytimg.com/vi/f5z0Z0qIetQ/hqdefault.jpg",
    searchQuery: "Dandelions Ruth B",
  },
  {
    id: 9026,
    title: "Perfect",
    artist: "Ed Sheeran",
    image: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg",
    searchQuery: "Perfect Ed Sheeran",
  },
];

export const Main = () => {
  const isPreviewMode = useGlobalStore((state) => state.isPreviewMode);
  const isVideoMode = useGlobalStore((state) => state.isVideoMode);
  const selectedAudioUrl = useGlobalStore((state) => state.selectedAudioUrl);
  const audioSources = useGlobalStore((state) => state.audioSources);
  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const currentTime = useGlobalStore((state) => state.currentTime);
  const socket = useGlobalStore((state) => state.socket);
  const canMutate = useCanMutate();
  const searchQuery = useGlobalStore((state) => state.searchQuery);
  const isSearching = useGlobalStore((state) => state.isSearching);
  const searchResults = useGlobalStore((state) => state.searchResults);
  const [visibleCount, setVisibleCount] = useState(10);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  
  const showSearchResults = isSearching || (searchQuery && searchQuery.trim() !== "");

  const selectedAudio = audioSources.find((source) => source.source.url === selectedAudioUrl);

  const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/\/vi\/([^\/]+)\//);
    return match ? match[1] : null;
  };

  const youtubeId = getYoutubeId(selectedAudio?.source.metadata?.thumbnail);

  const handleLoadMockTrack = (song: (typeof LATEST_SONGS)[0]) => {
    if (!socket || !canMutate) return;
    sendWSRequest({
      ws: socket,
      request: {
        type: ClientActionEnum.enum.STREAM_MUSIC,
        trackId: song.id,
        trackName: song.searchQuery,
        metadata: {
          title: song.title,
          artist: song.artist,
          thumbnail: song.image,
        },
      },
    });
  };

  const visibleSongs = LATEST_SONGS.filter((song) => !failedImages.has(song.id));

  return (
    <motion.div
      className={cn(
        "w-full lg:flex-1 overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#121212] bg-[#121212] h-full",
        "scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20"
      )}
    >
      <AnimatePresence mode="wait">
        {isPreviewMode ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <FullPreview />
          </motion.div>
        ) : (
          <motion.div
            key="queue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 pt-4 min-h-full"
          >
            <AnimatePresence>
              {isVideoMode && youtubeId && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
                >
                  <YoutubePlayer videoId={youtubeId} isPlaying={isPlaying} currentTime={currentTime} />
                </motion.div>
              )}
            </AnimatePresence>

            {showSearchResults ? (
              <div className="mt-4 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Search Results for "{searchQuery}"
                  </h2>
                </div>
                <SearchResults
                  onTrackSelect={() => {
                    useGlobalStore.getState().setSearchQuery("");
                  }}
                />
              </div>
            ) : (
              <>
                {/* DESKTOP LAYOUT */}
                <div className="hidden lg:block mt-4">
              <h2 className="text-2xl font-bold text-white mb-6">Latest Songs</h2>
              <div className="grid grid-cols-4 gap-6">
                {visibleSongs.slice(0, visibleCount).map((song) => {
                  return (
                    <div
                      key={song.id}
                      className="bg-[#181818] p-3 rounded-md hover:bg-[#282828] transition-all cursor-pointer group flex flex-col gap-3"
                      onClick={() => handleLoadMockTrack(song)}
                    >
                      <div className="relative aspect-square w-full shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden bg-[#282828]">
                        <img
                          src={song.image}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={() => setFailedImages((prev) => new Set(prev).add(song.id))}
                        />
                        <button className="absolute right-2 bottom-2 bg-[#b026ff] text-white p-3 rounded-full shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                          <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        </button>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base truncate text-white">{song.title}</span>
                        <span className="text-sm text-[#b3b3b3] truncate mt-1">{song.artist}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {visibleCount < visibleSongs.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="bg-transparent border border-neutral-600 hover:border-white text-white font-medium py-1.5 px-6 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE LAYOUT */}
            <div className="lg:hidden mt-2">
              {/* Recently Played */}
              <h2 className="text-[22px] font-bold text-white mb-4 tracking-tight">Recently played</h2>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {visibleSongs.slice(0, 6).map((song) => (
                  <div
                    key={`recent-${song.id}`}
                    className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors rounded-md flex items-center overflow-hidden h-14 shadow-sm cursor-pointer"
                    onClick={() => handleLoadMockTrack(song)}
                  >
                    <img
                      src={song.image}
                      className="h-full aspect-square object-cover shadow-[4px_0_10px_rgba(0,0,0,0.3)]"
                      onError={() => setFailedImages((prev) => new Set(prev).add(song.id))}
                    />
                    <span className="font-bold text-xs text-white px-2.5 truncate flex-1 leading-tight">
                      {song.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fresh new music */}
              <h2 className="text-[22px] font-bold text-white mb-4 tracking-tight">Fresh new music</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {visibleSongs.slice(6, visibleCount < 6 ? 12 : visibleCount + 6).map((song) => (
                  <div
                    key={`mobile-${song.id}`}
                    className="bg-[#181818] p-2 rounded-md hover:bg-[#282828] transition-all cursor-pointer group flex flex-col gap-2"
                    onClick={() => handleLoadMockTrack(song)}
                  >
                    <div className="relative aspect-square w-full shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden bg-[#282828]">
                      <img
                        src={song.image}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages((prev) => new Set(prev).add(song.id))}
                      />
                      <button className="absolute right-2 bottom-2 bg-[#b026ff] text-white p-2.5 rounded-full shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-all active:scale-95">
                        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                      </button>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[13px] truncate text-white">{song.title}</span>
                      <span className="text-[11px] text-[#b3b3b3] truncate mt-0.5">{song.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
              {visibleCount + 6 < visibleSongs.length && (
                <div className="mt-8 mb-4 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="bg-transparent border border-neutral-600 hover:border-white text-white font-medium py-1.5 px-6 rounded-full transition-all duration-300"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
