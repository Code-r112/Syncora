"use client";

import { SOCIAL_LINKS } from "@/constants";
import { MAX_NTP_MEASUREMENTS, useGlobalStore } from "@/store/global";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const WS_STATUS_COLORS = {
  connected: "34,197,94",
  connecting: "234,179,8",
  closed: "239,68,68",
} as const;

const WsStatusDot = ({ wsReadyState }: { wsReadyState: number }) => {
  const rgb =
    wsReadyState === 1
      ? WS_STATUS_COLORS.connected
      : wsReadyState === 0
        ? WS_STATUS_COLORS.connecting
        : WS_STATUS_COLORS.closed;

  return (
    <span className="absolute top-1/2 -translate-y-1/2 -left-5 flex size-2">
      {wsReadyState <= 1 && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: `rgb(${rgb})` }}
        />
      )}
      <span
        className="relative inline-flex size-2 rounded-full"
        style={{
          backgroundColor: `rgb(${rgb})`,
          boxShadow: `0 0 6px 1px rgba(${rgb},0.5)`,
          transition: "background-color 0.4s ease, box-shadow 0.4s ease",
        }}
      />
    </span>
  );
};

interface SyncProgressProps {
  // Loading state flags
  isLoading?: boolean; // Initial loading phase (room/socket/audio)
  loadingMessage?: string; // Message for initial loading phase

  // Sync state
  isSyncComplete?: boolean; // Whether sync is complete
}

const OuterModal = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-neutral-950 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md px-1">{children}</div>
    </motion.div>
  );
};

const PILL_COUNT = 8;
const MEASUREMENTS_PER_PILL = MAX_NTP_MEASUREMENTS / PILL_COUNT;

export const SyncProgress = ({ isLoading = false, loadingMessage = "Loading..." }: SyncProgressProps) => {
  const isSyncComplete = useGlobalStore((state) => state.isSynced);
  const setIsInitingSystem = useGlobalStore((state) => state.setIsInitingSystem);
  const reconnectionInfo = useGlobalStore((state) => state.reconnectionInfo);

  // Auto-dismiss when sync is complete
  useEffect(() => {
    if (isSyncComplete) {
      const timer = setTimeout(() => {
        setIsInitingSystem(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSyncComplete, setIsInitingSystem]);

  // Check if max reconnection attempts have been reached
  const hasReconnectionFailed =
    reconnectionInfo.isReconnecting && reconnectionInfo.currentAttempt >= reconnectionInfo.maxAttempts;

  // If reconnection failed after max attempts
  if (hasReconnectionFailed) {
    return (
      <OuterModal>
        <motion.div
          className="flex flex-col items-center justify-center p-8 bg-[#121212] rounded-2xl shadow-2xl mx-auto w-full max-w-sm"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="size-6 flex items-center justify-center mb-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <motion.path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            </svg>
          </motion.div>

          <motion.h2
            className="text-2xl font-bold tracking-tight mb-2 text-white text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Failed to reconnect
          </motion.h2>

          <motion.p
            className="text-[#b3b3b3] mb-6 text-center text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            Unable to establish connection after {reconnectionInfo.maxAttempts} attempts
          </motion.p>

          <motion.a
            href="/"
            className="mt-4 px-5 py-2 bg-[#b026ff] text-white rounded-full font-medium text-xs tracking-wide cursor-pointer w-full hover:shadow-lg transition-shadow duration-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.3 }}
          >
            Go to home
          </motion.a>
        </motion.div>
      </OuterModal>
    );
  }

  // Simple blank screen with circular progress in center
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black">
      <motion.div
        className="w-10 h-10 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg className="w-full h-full text-[#b026ff] animate-spin" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40 * 0.25}
          />
        </svg>
      </motion.div>
    </div>
  );
};
