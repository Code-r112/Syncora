import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Queue } from "../Queue";
import { InlineSearch } from "./InlineSearch";

import { useGlobalStore } from "@/store/global";
import { FullPreview } from "./FullPreview";

export const Main = () => {
  const isPreviewMode = useGlobalStore((state) => state.isPreviewMode);

  return (
    <motion.div
      className={cn(
        "w-full lg:flex-1 overflow-y-auto bg-gradient-to-b from-neutral-900/90 to-neutral-950 backdrop-blur-xl bg-neutral-950 h-full",
        "scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20",
        isPreviewMode ? "overflow-hidden" : ""
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
            <div className="mb-6">
              <InlineSearch />
            </div>
            <Queue className="mb-8" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
