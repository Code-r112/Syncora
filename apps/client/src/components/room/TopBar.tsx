"use client";
import { SOCIAL_LINKS } from "@/constants";
import { audioContextManager } from "@/lib/audioContextManager";
import { MAX_NTP_MEASUREMENTS, useGlobalStore } from "@/store/global";
import { Crown, Hash, Users, Video, MonitorPlay, Search, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import Link from "next/link";

import { SyncProgress } from "../ui/SyncProgress";
import { InlineSearch } from "../dashboard/InlineSearch";

interface TopBarProps {
  roomId: string;
  onEqClick?: () => void;
  onSearchClick?: () => void;
}

export const TopBar = ({ roomId, onEqClick, onSearchClick }: TopBarProps) => {
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

          {/* NTP Measurements Indicator */}
          <div className="items-center hidden md:flex font-medium font-mono text-[11px] gap-1 shrink-0">
            <motion.svg width="14" height="14" viewBox="0 0 14 14" className="mr-1">
              <circle
                cx="7"
                cy="7"
                r="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[#333333]"
              />
              <motion.circle
                cx="7"
                cy="7"
                r="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[#b026ff]"
                strokeDasharray={`${(syncMeasurementCount / MAX_NTP_MEASUREMENTS) * 31.4} 31.4`}
                strokeLinecap="round"
                transform="rotate(-90 7 7)"
                initial={{ strokeDasharray: "0 31.4" }}
                animate={{
                  strokeDasharray: `${(syncMeasurementCount / MAX_NTP_MEASUREMENTS) * 31.4} 31.4`,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </motion.svg>
            <span>
              {syncMeasurementCount}/{MAX_NTP_MEASUREMENTS}
            </span>
          </div>
          <div className="hidden lg:flex items-center font-medium font-mono text-[11px] shrink-0">
            <Hash size={12} className="mr-1" />
            <span className="flex items-center">{roomId}</span>
          </div>
          <div className="hidden lg:flex items-center font-medium font-mono text-[11px] shrink-0">
            <Users size={12} className="mr-1" />
            <span className="flex items-center">
              <span className="mr-1.5">
                {connectedClientCount} {connectedClientCount === 1 ? "user" : "users"}
              </span>
            </span>
          </div>
        </div>

        {/* CENTER SIDE (Search Bar) - Desktop Only */}
        <div className="hidden lg:block flex-1 w-full max-w-lg min-w-[200px]">
          <InlineSearch />
        </div>

        {/* RIGHT SIDE OF TOPBAR */}
        <div className="flex-1 flex items-center justify-end space-x-1 shrink-0">
          <button className="lg:hidden p-2 text-[#b3b3b3] hover:text-white transition-colors" onClick={onEqClick}>
            <SlidersHorizontal className="w-6 h-6" />
          </button>
          <button className="lg:hidden p-2 text-[#b3b3b3] hover:text-white transition-colors" onClick={onSearchClick}>
            <Search className="w-6 h-6" />
          </button>
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
