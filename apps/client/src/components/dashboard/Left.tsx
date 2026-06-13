"use client";

import { audioContextManager } from "@/lib/audioContextManager";
import { cn } from "@/lib/utils";
import { MAX_NTP_MEASUREMENTS, useGlobalStore } from "@/store/global";
import { useRoomStore } from "@/store/room";
import { Hash, Users } from "lucide-react";
import { motion } from "motion/react";

import { Separator } from "../ui/separator";
import { ConnectedUsersList } from "./ConnectedUsersList";
import { AudioUploaderMinimal } from "../AudioUploaderMinimal";
import { RoomQRCode } from "./CopyRoom";
import { GlobalVolumeControl } from "./GlobalVolumeControl";
import { MobileNudgeControl } from "./MobileNudgeControl";
import { PlaybackPermissions } from "./PlaybackPermissions";

interface LeftProps {
  className?: string;
  tab?: "room" | "users" | "upload" | "all";
}

export const Left = ({ className, tab = "room" }: LeftProps) => {
  const roomId = useRoomStore((state) => state.roomId);

  return (
    <motion.div
      className={cn(
        "w-full bg-transparent flex flex-col pb-4 lg:pb-0 text-sm space-y-1 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20",
        className
      )}
    >
      {(tab === "room" || tab === "all") && (
        <>
          {tab !== "all" && (
            <div className="px-4 py-4 flex items-center justify-between shrink-0">
              <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">
                Room Settings
              </span>
            </div>
          )}

          {/* Decorative User Profile */}
          <motion.div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#b026ff] to-[#d87bff] flex items-center justify-center text-white font-bold text-3xl uppercase shadow-lg shadow-[#b026ff]/20 mb-3">
              {useGlobalStore.getState().currentUser?.username?.[0] || "?"}
            </div>
            <span className="text-sm font-bold text-white tracking-wide">
              {useGlobalStore.getState().currentUser?.username || "Guest"}
            </span>
          </motion.div>

          <motion.div className="px-3.5 space-y-2.5 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium">
                <Hash size={18} />
                <span>Room {roomId}</span>
              </div>
              <RoomQRCode />
            </div>
          </motion.div>

          <PlaybackPermissions />

          <div className="block lg:hidden">
            <GlobalVolumeControl isMobile />
            <MobileNudgeControl />
          </div>

          {tab === "room" && (
            <motion.div className="mt-auto pb-4 pt-2 text-neutral-400">
              <div className="flex flex-col gap-2 p-4">
                <h5 className="text-xs font-medium text-neutral-300">Tips</h5>
                <ul className="list-disc list-outside pl-4 space-y-1.5">
                  <li className="text-xs leading-relaxed">
                    {"Headphones recommended for the best listening experience."}
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </>
      )}

      {(tab === "upload" || tab === "all") && (
        <>
          {tab !== "all" && (
            <div className="px-4 py-4 flex items-center justify-between shrink-0">
              <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">Upload Song</span>
            </div>
          )}
          <div className="p-4 flex-1 overflow-y-auto">
            <AudioUploaderMinimal />
          </div>
        </>
      )}

      {(tab === "users" || tab === "all") && (
        <>
          {tab !== "all" && (
            <div className="px-4 py-4 flex items-center justify-between shrink-0">
              <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">
                Connected Users
              </span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            <ConnectedUsersList />
          </div>

          {tab === "all" && (
            <motion.div className="mt-auto pb-4 pt-2 text-neutral-400">
              <div className="flex flex-col gap-2 p-4 border-t border-white/5">
                <h5 className="text-xs font-medium text-neutral-300">Tips</h5>
                <ul className="list-disc list-outside pl-4 space-y-1.5">
                  <li className="text-xs leading-relaxed">
                    {"Headphones recommended for the best listening experience."}
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};
