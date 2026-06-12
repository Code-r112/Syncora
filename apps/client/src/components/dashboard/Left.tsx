"use client";

import { audioContextManager } from "@/lib/audioContextManager";
import { cn } from "@/lib/utils";
import { MAX_NTP_MEASUREMENTS, useGlobalStore } from "@/store/global";
import { useRoomStore } from "@/store/room";
import { Hash } from "lucide-react";
import { motion } from "motion/react";

import { Separator } from "../ui/separator";
import { ConnectedUsersList } from "./ConnectedUsersList";
import { RoomQRCode } from "./CopyRoom";
import { GlobalVolumeControl } from "./GlobalVolumeControl";
import { MobileNudgeControl } from "./MobileNudgeControl";
import { PlaybackPermissions } from "./PlaybackPermissions";

interface LeftProps {
  className?: string;
}

export const Left = ({ className }: LeftProps) => {
  const roomId = useRoomStore((state) => state.roomId);
  const clockOffset = useGlobalStore((state) => state.offsetEstimate);
  const roundTripEstimate = useGlobalStore((state) => state.roundTripEstimate);
  const syncMeasurementCount = useGlobalStore((state) => state.syncMeasurements.length);

  return (
    <motion.div
      className={cn(
        "w-full border-r border-neutral-800/50 bg-neutral-900/50 backdrop-blur-md flex flex-col pb-4 lg:pb-0 text-sm space-y-1 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20",
        className
      )}
    >
      {/* Header section */}
      {/* <div className="px-3 py-2 flex items-center gap-2">
        <div className="bg-neutral-800 rounded-md p-1.5">
          <Music className="h-4 w-4 text-white" />
        </div>
        <h1 className="font-semibold text-white">Beatsync</h1>
      </div>


      <Separator className="bg-neutral-800/50" /> */}

      {/* Navigation menu */}
      <motion.div className="px-3.5 space-y-2.5 py-2 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Hash size={18} />
            <span>Room {roomId}</span>
          </div>

          {/* QR Code Dialog */}
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

      {/* Connected Users List */}
      <ConnectedUsersList />

      {/* Playback Permissions */}

      {/* <Separator className="bg-neutral-800/50" /> */}

      {/* Tips Section */}
      <motion.div className="mt-auto pb-4 pt-2 text-neutral-400">
        <div className="flex flex-col gap-2 p-4 border-t border-neutral-800/50">
          <h5 className="text-xs font-medium text-neutral-300">Tips</h5>
          <ul className="list-disc list-outside pl-4 space-y-1.5">
            <li className="text-xs leading-relaxed">{"Headphones recommended for the best listening experience."}</li>
          </ul>
        </div>

        {/* Creator Branding */}
        <div className="mt-6 flex justify-center">
          <a
            href="https://github.com/kpran"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-[#B026FF] transition-colors duration-300 bg-neutral-900/50 px-3 py-1.5 rounded-full border border-neutral-800 hover:border-[#B026FF]/30 group"
          >
            <span>Crafted with</span>
            <span className="text-[#B026FF] group-hover:scale-125 transition-transform duration-300">💜</span>
            <span>
              by <strong className="text-neutral-300 group-hover:text-white transition-colors">Pranav</strong>
            </span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};
