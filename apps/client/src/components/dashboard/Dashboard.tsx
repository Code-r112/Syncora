import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useGlobalStore } from "@/store/global";
import {
  Library,
  ListMusic,
  SlidersHorizontal,
  MoreHorizontal,
  User,
  Hash,
  Users,
  MessageCircle,
  UploadCloud,
  Home,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TopBar } from "../room/TopBar";
import { SyncProgress } from "../ui/SyncProgress";
import { BeatFlash } from "./BeatFlash";
import { Bottom } from "./Bottom";
import { Left } from "./Left";
import { Main } from "./Main";
import { Right } from "./Right";
import { Chat } from "./right/Chat";
import { Equalizer } from "./right/Equalizer";
import { FullPreview } from "./FullPreview";
import { Queue } from "../Queue";
import { InlineSearch } from "./InlineSearch";

interface DashboardProps {
  roomId: string;
}

export const Dashboard = ({ roomId }: DashboardProps) => {
  const [activeLeftTab, setActiveLeftTab] = useState<"room" | "users" | "upload" | null>("room");
  const [activeRightTab, setActiveRightTab] = useState<"chat" | "eq" | "queue" | null>("queue");
  const [showMobileEq, setShowMobileEq] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isSynced = useGlobalStore((state) => state.isSynced);
  const isLoadingAudio = useGlobalStore((state) => state.isInitingSystem);
  const hasUserStartedSystem = useGlobalStore((state) => state.hasUserStartedSystem);
  const isPreviewMode = useGlobalStore((state) => state.isPreviewMode);

  const isReady = isSynced && !isLoadingAudio;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="w-full h-dvh flex flex-col text-white bg-black p-2 gap-2 overflow-hidden font-sans">
      <BeatFlash />

      {/* Top bar: Native in the black background */}
      <div className="shrink-0">
        <TopBar
          roomId={roomId}
          onEqClick={() => setShowMobileEq(true)}
          onSearchClick={() => setShowMobileSearch(true)}
        />
      </div>

      {/* Show SyncProgress during reconnection (when user has already started but lost sync) */}
      {!isSynced && hasUserStartedSystem && !isLoadingAudio && <SyncProgress />}

      {isReady && (
        <Tabs defaultValue="music" className="flex flex-1 flex-col overflow-hidden min-h-0 gap-2">
          <motion.div
            className="flex flex-1 flex-col overflow-hidden min-h-0 gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* --- DESKTOP LAYOUT (lg+) --- */}
            <div className="hidden lg:flex lg:flex-1 w-full lg:overflow-hidden min-h-0 gap-2">
              {/* LEFT SIDEBAR STRIP + EXPANDED CONTENT */}
              <div className="flex h-full flex-shrink-0 relative bg-[#121212] rounded-lg overflow-hidden">
                {/* Permanent Compact Strip */}
                <div className="w-[64px] h-full flex flex-col items-center py-4 gap-4 z-10 bg-transparent">
                  <button
                    onClick={() => setActiveLeftTab(activeLeftTab === "room" ? null : "room")}
                    className={`p-3 rounded-full transition-colors ${activeLeftTab === "room" ? "text-white bg-[#1a1a1a]" : "text-[#b3b3b3] hover:text-white"}`}
                    title="Room Settings"
                  >
                    <Hash size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setActiveLeftTab(activeLeftTab === "users" ? null : "users")}
                    className={`p-3 rounded-full transition-colors ${activeLeftTab === "users" ? "text-white bg-[#1a1a1a]" : "text-[#b3b3b3] hover:text-white"}`}
                    title="Connected Users"
                  >
                    <Users size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setActiveLeftTab(activeLeftTab === "upload" ? null : "upload")}
                    className={`p-3 rounded-full transition-colors ${activeLeftTab === "upload" ? "text-white bg-[#1a1a1a]" : "text-[#b3b3b3] hover:text-white"}`}
                    title="Upload Song"
                  >
                    <UploadCloud size={24} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Expanded Content */}
                <AnimatePresence initial={false}>
                  {activeLeftTab && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 300, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="h-full overflow-hidden bg-transparent"
                    >
                      <div className="w-[300px] h-full relative">
                        <Left tab={activeLeftTab} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MAIN CONTENT */}
              <div className="flex-1 min-w-0 h-full overflow-hidden bg-[#121212] rounded-lg relative">
                <Main />
              </div>

              {/* RIGHT SIDEBAR STRIP + EXPANDED CONTENT */}
              <div className="flex h-full flex-shrink-0 relative bg-[#121212] rounded-lg overflow-hidden">
                {/* Expanded Content */}
                <AnimatePresence initial={false}>
                  {activeRightTab && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 320, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="h-full overflow-hidden bg-transparent"
                    >
                      <div className="w-[320px] h-full relative flex flex-col">
                        {activeRightTab === "chat" ? (
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                            <div className="px-4 py-4 flex justify-between items-center shrink-0">
                              <span className="font-bold text-base flex items-center gap-2">Chat</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <Chat />
                            </div>
                          </div>
                        ) : activeRightTab === "eq" ? (
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                            <div className="px-4 py-4 flex justify-between items-center shrink-0">
                              <span className="font-bold text-base flex items-center gap-2">Equalizer</span>
                            </div>
                            <div className="flex-1 overflow-auto">
                              <Equalizer />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                            <div className="px-4 py-4 flex justify-between items-center shrink-0">
                              <span className="font-bold text-base flex items-center gap-2">Queue</span>
                            </div>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                              <div className="p-4 pt-0">
                                <Queue />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Permanent Compact Strip */}
                <div className="w-[64px] h-full flex flex-col items-center py-4 gap-4 z-10 bg-transparent">
                  <button
                    onClick={() => setActiveRightTab(activeRightTab === "queue" ? null : "queue")}
                    className={`p-3 rounded-full transition-colors ${activeRightTab === "queue" ? "text-white bg-[#1a1a1a]" : "text-[#b3b3b3] hover:text-white"}`}
                    title="Queue"
                  >
                    <ListMusic size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setActiveRightTab(activeRightTab === "chat" ? null : "chat")}
                    className={`p-3 rounded-full transition-colors ${activeRightTab === "chat" ? "text-white bg-[#1a1a1a]" : "text-[#b3b3b3] hover:text-white"}`}
                    title="Chat"
                  >
                    <MessageCircle size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setActiveRightTab(activeRightTab === "eq" ? null : "eq")}
                    className={`p-3 rounded-full transition-colors ${activeRightTab === "eq" ? "text-white bg-[#1a1a1a]" : "text-[#b3b3b3] hover:text-white"}`}
                    title="Equalizer"
                  >
                    <SlidersHorizontal size={24} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* --- MOBILE LAYOUT (< lg) --- */}
            <div className="flex flex-1 flex-col lg:hidden min-h-0">
              <AnimatePresence mode="wait">
                {isPreviewMode ? (
                  <motion.div
                    key="full-preview-mobile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 w-full overflow-hidden bg-[#121212] relative rounded-lg"
                  >
                    <FullPreview />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tabs-mobile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col min-h-0 w-full overflow-hidden bg-[#121212] rounded-lg"
                  >
                    {/* Tab Content Area - Scrolls independently */}
                    <AnimatePresence mode="sync">
                      <TabsContent key="library" value="library" className="flex-1 overflow-y-auto mt-0 min-h-0">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Left className="flex h-full w-full" tab="all" />
                        </motion.div>
                      </TabsContent>
                      <TabsContent key="music" value="music" className="flex-1 overflow-y-auto mt-0 min-h-0">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Main />
                        </motion.div>
                      </TabsContent>
                      <TabsContent
                        key="queue"
                        value="queue"
                        className="flex-1 overflow-hidden mt-0 min-h-0 bg-[#121212]"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="h-full flex flex-col"
                        >
                          <div className="px-4 py-4 flex justify-between items-center shrink-0">
                            <span className="font-bold text-base flex items-center gap-2 text-white">Queue</span>
                          </div>
                          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-0">
                            <Queue />
                          </div>
                        </motion.div>
                      </TabsContent>
                      <TabsContent key="chat" value="chat" className="flex-1 overflow-hidden mt-0 min-h-0 bg-[#121212]">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="h-full flex flex-col"
                        >
                          <div className="px-4 py-4 flex justify-between items-center shrink-0">
                            <span className="font-bold text-base flex items-center gap-2 text-white">Chat</span>
                          </div>
                          <Chat />
                        </motion.div>
                      </TabsContent>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Equalizer Overlay */}
              <AnimatePresence>
                {showMobileEq && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-50 bg-[#121212] flex flex-col rounded-lg overflow-hidden"
                  >
                    <div className="px-4 py-4 flex justify-between items-center shrink-0 bg-[#1a1a1a] shadow-md z-10">
                      <span className="font-bold text-base flex items-center gap-2 text-white">Equalizer</span>
                      <button
                        onClick={() => setShowMobileEq(false)}
                        className="p-1.5 hover:bg-neutral-800 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-neutral-400 hover:text-white" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 pt-6">
                      <Equalizer />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Search Overlay */}
              <AnimatePresence>
                {showMobileSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-50 bg-[#121212] flex flex-col rounded-lg overflow-hidden"
                  >
                    <InlineSearch isMobileOverlay={true} onClose={() => setShowMobileSearch(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Player & Mobile Nav Container */}
            <div className="shrink-0 flex flex-col bg-black lg:bg-transparent">
              <Bottom />

              {/* Mobile Tab List at the very bottom */}
              {!isPreviewMode && (
                <div className="lg:hidden shrink-0">
                  <TabsList className="grid w-full grid-cols-4 h-16 rounded-none p-0 bg-black border-t-0 select-none">
                    <TabsTrigger
                      value="library"
                      className="flex flex-col items-center justify-center flex-1 !bg-transparent !border-transparent !border-none data-[state=active]:shadow-none rounded-none gap-1 text-[#b3b3b3] data-[state=active]:text-white hover:text-white transition-all duration-200 !outline-none focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 !ring-0 focus-visible:!ring-offset-0"
                    >
                      <Library size={32} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold">Session</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="music"
                      className="flex flex-col items-center justify-center flex-1 !bg-transparent !border-transparent !border-none data-[state=active]:shadow-none rounded-none gap-1 text-[#b3b3b3] data-[state=active]:text-white hover:text-white transition-all duration-200 !outline-none focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 !ring-0 focus-visible:!ring-offset-0"
                    >
                      <Home size={32} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold">Music</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="flex flex-col items-center justify-center flex-1 !bg-transparent !border-transparent !border-none data-[state=active]:shadow-none rounded-none gap-1 text-[#b3b3b3] data-[state=active]:text-white hover:text-white transition-all duration-200 !outline-none focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 !ring-0 focus-visible:!ring-offset-0"
                    >
                      <MessageCircle size={32} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="queue"
                      className="flex flex-col items-center justify-center flex-1 !bg-transparent !border-transparent !border-none data-[state=active]:shadow-none rounded-none gap-1 text-[#b3b3b3] data-[state=active]:text-white hover:text-white transition-all duration-200 !outline-none focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 !ring-0 focus-visible:!ring-offset-0"
                    >
                      <ListMusic size={32} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold">Queue</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}
            </div>
          </motion.div>
        </Tabs>
      )}
    </div>
  );
};
