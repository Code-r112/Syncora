import { motion } from "motion/react";
import { Player } from "../room/Player";
import { GlobalVolumeControl } from "./GlobalVolumeControl";
import { NudgeControl } from "./NudgeControl";
import { useGlobalStore } from "@/store/global";
import { Maximize2, Music } from "lucide-react";

export const Bottom = () => {
  const audioSources = useGlobalStore((state) => state.audioSources);
  const selectedAudioUrl = useGlobalStore((state) => state.selectedAudioUrl);

  const currentSource = audioSources.find((s) => s.source.url === selectedAudioUrl);
  const metadata = currentSource?.source.metadata;

  const isPreviewMode = useGlobalStore((state) => state.isPreviewMode);

  return (
    <motion.div className="flex-shrink-0 border-t border-neutral-800/50 bg-neutral-900/10 backdrop-blur-lg p-3 lg:p-4 pb-safe-plus-4 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-10 relative">
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto min-h-16 gap-3 lg:gap-0">
        {/* Track Info & Full Preview Trigger - Visible on both Mobile and Desktop, but hidden on mobile if full preview is open */}
        <div
          className={`flex w-full lg:w-1/4 lg:absolute lg:left-6 items-center justify-center lg:justify-start ${isPreviewMode ? "hidden lg:flex" : ""}`}
        >
          {metadata && (
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-neutral-800/40 p-1.5 -ml-1.5 rounded-lg transition-colors group w-full max-w-md lg:max-w-none justify-center lg:justify-start"
              onClick={() => useGlobalStore.getState().setIsPreviewMode(true)}
            >
              <div className="relative shrink-0">
                {metadata.thumbnail ? (
                  <img
                    src={metadata.thumbnail}
                    alt={metadata.title}
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-md object-cover shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-md bg-neutral-800 flex items-center justify-center shadow-md">
                    <Music className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                  <Maximize2 className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col overflow-hidden min-w-0 text-left lg:text-left items-start flex-1 lg:flex-none">
                <span className="text-xs lg:text-sm font-semibold text-white truncate group-hover:underline decoration-white/50 underline-offset-2 w-full">
                  {metadata.title}
                </span>
                <span className="text-[10px] lg:text-xs text-neutral-400 truncate w-full">
                  {metadata.artist ? `${metadata.artist} • ` : ""}
                  {metadata.album ? `${metadata.album}` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center mt-1 lg:mt-0">
          <Player />
        </div>

        {/* Extra Controls - Desktop only for now */}
        <div className="hidden lg:block absolute right-6 w-1/4">
          <div className="flex items-center justify-end gap-4">
            <NudgeControl />
            <GlobalVolumeControl />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
