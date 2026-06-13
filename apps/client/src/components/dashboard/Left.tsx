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
            <div className="px-4 py-3 border-b border-white/5">
              <span className="font-medium text-sm flex items-center gap-2">
                <Hash size={16} /> Room Settings
              </span>
            </div>
          )}
          <motion.div className="px-3.5 space-y-2.5 py-2 mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium">
                <Hash size={18} />
                <span>Room {roomId}</span>
              </div>
              <RoomQRCode />
            </div>
          </motion.div>

          <Separator className="bg-neutral-800/50" />

          <PlaybackPermissions />

          <Separator className="bg-neutral-800/50" />

          <div className="block lg:hidden">
            <GlobalVolumeControl isMobile />
            <Separator className="bg-neutral-800/50" />
            <MobileNudgeControl />
            <Separator className="bg-neutral-800/50" />
          </div>

          {tab === "room" && (
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

      {(tab === "upload" || tab === "all") && (
        <>
          {tab !== "all" && (
            <div className="px-4 py-3 border-b border-white/5">
              <span className="font-medium text-sm flex items-center gap-2">Upload Song</span>
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
            <div className="px-4 py-3 border-b border-white/5">
              <span className="font-medium text-sm flex items-center gap-2">
                <Users size={16} /> Connected Users
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
