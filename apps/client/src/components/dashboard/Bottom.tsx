import { motion } from "motion/react";
import { Player } from "../room/Player";
import { GlobalVolumeControl } from "./GlobalVolumeControl";
import { NudgeControl } from "./NudgeControl";
import { useGlobalStore } from "@/store/global";
import { Maximize2, Music, Play, Pause, MonitorSpeaker } from "lucide-react";
import { useCanMutate } from "@/store/global";
import { useEffect, useState } from "react";
import { MarqueeText } from "../ui/marquee-text";

const MobileProgressBar = () => {
  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const getCurrentTrackPosition = useGlobalStore((state) => state.getCurrentTrackPosition);
  const trackDuration = useGlobalStore((state) => state.duration);
  const currentTime = useGlobalStore((state) => state.currentTime);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    const animate = () => {
      const current = getCurrentTrackPosition();
      if (trackDuration > 0) {
        setProgress((current / trackDuration) * 100);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, getCurrentTrackPosition, trackDuration]);

  useEffect(() => {
    if (!isPlaying && trackDuration > 0) {
      setProgress((currentTime / trackDuration) * 100);
    }
  }, [isPlaying, trackDuration, currentTime]);

  return (
    <div className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full overflow-hidden">
      <div className="h-full bg-white rounded-r-full" style={{ width: `${progress}%` }} />
    </div>
  );
};

export const Bottom = () => {
  const audioSources = useGlobalStore((state) => state.audioSources);
  const selectedAudioUrl = useGlobalStore((state) => state.selectedAudioUrl);

  const currentSource = audioSources.find((s) => s.source.url === selectedAudioUrl);
  const metadata = currentSource?.source.metadata;

  const isPreviewMode = useGlobalStore((state) => state.isPreviewMode);

  const canMutate = useCanMutate();
  const isPlaying = useGlobalStore((state) => state.isPlaying);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canMutate) return;
    const state = useGlobalStore.getState();
    if (state.isPlaying) {
      state.broadcastPause();
    } else {
      state.broadcastPlay();
    }
  };

  return (
    <>
      {/* DESKTOP PLAYER */}
      <motion.div className="hidden lg:flex flex-shrink-0 bg-black pt-2 pb-safe-plus-4 z-10 relative">
        <div className="flex flex-row items-center justify-between max-w-7xl mx-auto min-h-16 w-full">
          {/* Track Info & Full Preview Trigger */}
          <div
            className={`flex w-1/4 absolute left-6 items-center justify-start ${isPreviewMode ? "hidden lg:flex" : ""}`}
          >
            {metadata && (
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-neutral-800/40 p-1.5 -ml-1.5 rounded-lg transition-colors group w-full justify-start"
                onClick={() => useGlobalStore.getState().setIsPreviewMode(true)}
              >
                <div className="relative shrink-0">
                  {metadata.thumbnail ? (
                    <img
                      src={metadata.thumbnail}
                      alt={metadata.title}
                      className="w-14 h-14 rounded-md object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-md bg-neutral-800 flex items-center justify-center shadow-md">
                      <Music className="w-6 h-6 text-neutral-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-col overflow-hidden min-w-0 text-left items-start flex-1">
                  <MarqueeText className="text-sm font-semibold text-white group-hover:underline decoration-white/50 underline-offset-2 block w-full">
                    {metadata.title}
                  </MarqueeText>
                  <span className="text-xs text-neutral-400 truncate w-full block">
                    {metadata.artist ? `${metadata.artist} • ` : ""}
                    {metadata.album ? `${metadata.album}` : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Player Controls */}
          <div className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center">
            <Player />
          </div>

          {/* Extra Controls */}
          <div className="absolute right-6 w-1/4">
            <div className="flex items-center justify-end gap-4">
              <NudgeControl />
              <GlobalVolumeControl />
            </div>
          </div>
        </div>
      </motion.div>

      {/* MOBILE MINI PLAYER */}
      {!isPreviewMode && metadata && (
        <motion.div
          className="lg:hidden flex flex-col bg-[#1a1a1a] mx-2 mb-1 rounded-md relative overflow-hidden cursor-pointer"
          onClick={() => useGlobalStore.getState().setIsPreviewMode(true)}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <div className="flex items-center justify-between h-14 px-2">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className="relative shrink-0">
                {metadata.thumbnail ? (
                  <img
                    src={metadata.thumbnail}
                    alt={metadata.title}
                    className="w-10 h-10 rounded-md object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center shadow-sm">
                    <Music className="w-5 h-5 text-neutral-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <MarqueeText className="text-[13px] font-bold text-white w-full block">{metadata.title}</MarqueeText>
                <span className="text-[11px] text-[#b3b3b3] truncate w-full block">
                  {metadata.artist || "Unknown Artist"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-2 pr-1">
              <MonitorSpeaker className="w-5 h-5 text-[#b3b3b3]" />
              <button
                onClick={handlePlayPause}
                disabled={!canMutate}
                className={`p-1.5 ${!canMutate ? "opacity-50" : "active:scale-95"}`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-current" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-current" />
                )}
              </button>
            </div>
          </div>
          <MobileProgressBar />
        </motion.div>
      )}
    </>
  );
};
