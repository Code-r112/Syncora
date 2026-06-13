"use client";
import { SOCIAL_LINKS } from "@/constants";
import { audioContextManager } from "@/lib/audioContextManager";
import { MAX_NTP_MEASUREMENTS, useGlobalStore } from "@/store/global";
import { Crown, Hash, Users, Video, MonitorPlay, Search, SlidersHorizontal, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import React, { useState } from "react";
import Link from "next/link";

import { SyncProgress } from "../ui/SyncProgress";
import { InlineSearch } from "../dashboard/InlineSearch";

interface TopBarProps {
  roomId: string;
  onEqClick?: () => void;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
}

export const TopBar = ({ roomId, onEqClick, onSearchClick, onProfileClick }: TopBarProps) => {
  const isLoadingAudio = useGlobalStore((state) => state.isInitingSystem);
  const isSynced = useGlobalStore((state) => state.isSynced);
  const roundTripEstimate = useGlobalStore((state) => state.roundTripEstimate);
  const connectedClientCount = useGlobalStore((state) => state.connectedClients.length);
  const clockOffset = useGlobalStore((state) => state.offsetEstimate);
  const syncMeasurementCount = useGlobalStore((state) => state.syncMeasurements.length);

  // Get current user from global store to check admin status
  const currentUser = useGlobalStore((state) => state.currentUser);
  const isAdmin = currentUser?.isAdmin || false;

  const isVideoMode = useGlobalStore((state) => state.isVideoMode);
  const setIsVideoMode = useGlobalStore((state) => state.setIsVideoMode);

  // Show minimal nav bar when synced and not loading
  if (!isLoadingAudio && isSynced) {
    return (
      <div className="h-14 bg-transparent z-50 flex items-center justify-between px-4 gap-4">
        <div className="flex-1 flex items-center justify-start space-x-4 text-xs text-[#b3b3b3] py-2 md:py-0 font-sans font-bold overflow-hidden">
          <Link href="/" className="flex shrink-0 items-center gap-2 hover:text-white transition-colors">
            <Crown className="h-6 w-6 text-[#ffffff]" fill="currentColor" />
            <span className="text-white text-lg font-bold tracking-tight">Syncora</span>
          </Link>
        </div>

        {/* CENTER SIDE (Search Bar) - Desktop Only */}
        <div className="hidden lg:block flex-1 w-full max-w-lg min-w-[200px]">
          <InlineSearch />
        </div>

        {/* RIGHT SIDE OF TOPBAR */}
        <div className="flex-1 flex items-center justify-end space-x-1 shrink-0">
          {/* Mobile Buttons */}
          <button className="lg:hidden p-2 text-[#b3b3b3] hover:text-white transition-colors" onClick={onEqClick}>
            <SlidersHorizontal className="w-6 h-6" />
          </button>
          <button className="lg:hidden p-2 text-[#b3b3b3] hover:text-white transition-colors" onClick={onSearchClick}>
            <Search className="w-6 h-6" />
          </button>

          {/* User Profile Trigger */}
          <div className="flex items-center space-x-3 pr-2">
            <button
              onClick={onProfileClick}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-[#b026ff] to-[#d87bff] text-white font-bold text-xl uppercase shadow-md hover:scale-105 hover:shadow-lg hover:shadow-[#b026ff]/20 transition-all active:scale-95"
            >
              {currentUser?.username?.[0] || "?"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use the existing SyncProgress component for loading/syncing states
  return (
    <AnimatePresence>
      {isLoadingAudio && (
        <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <SyncProgress />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
