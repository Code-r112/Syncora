import { cn, formatTime } from "@/lib/utils";

import { useCanMutate, useGlobalStore } from "@/store/global";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Slider } from "../ui/slider";

export const Player = () => {
  const canMutate = useCanMutate();
  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const getCurrentTrackPosition = useGlobalStore((state) => state.getCurrentTrackPosition);
  const audioSourceCount = useGlobalStore((state) => state.audioSources.length);
  const currentTime = useGlobalStore((state) => state.currentTime);
  const skipToNextTrack = useGlobalStore((state) => state.skipToNextTrack);
  const skipToPreviousTrack = useGlobalStore((state) => state.skipToPreviousTrack);
  const isShuffled = useGlobalStore((state) => state.isShuffled);
  const toggleShuffle = useGlobalStore((state) => state.toggleShuffle);
  const trackDuration = useGlobalStore((state) => state.duration);

  // Local state for slider
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for smooth animation without re-renders
  const currentPositionRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  // Track the last value from onValueChange so we can use it as a fallback
  // when onValueCommit gets swallowed by React batching (quick clicks)
  const pendingSeekRef = useRef<number | null>(null);

  // Sync with currentTime when paused or changed externally
  useEffect(() => {
    if (!isPlaying) {
      const newPosition = currentTime;
      currentPositionRef.current = newPosition;
      // Use queueMicrotask to avoid synchronous setState in effect body
      queueMicrotask(() => {
        setSliderPosition(newPosition);
      });
    }
  }, [currentTime, isPlaying]);

  // Smooth position updates using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;

    let lastUpdateTime = performance.now();

    const animate = () => {
      if (isDragging) {
        // Continue animation but don't update slider
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const currentPosition = getCurrentTrackPosition();
      currentPositionRef.current = currentPosition;

      // Only update React state periodically to reduce re-renders
      // Update every ~250ms for visual feedback, but track internally at 60fps
      const now = performance.now();
      if (now - lastUpdateTime > 250) {
        setSliderPosition(currentPosition);
        lastUpdateTime = now;
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, getCurrentTrackPosition, isDragging]);

  // Handle slider change
  const handleSliderChange = useCallback(
    (value: number[]) => {
      if (!canMutate) return;
      const position = value[0];
      setIsDragging(true);
      setSliderPosition(position);
      pendingSeekRef.current = position;
    },
    [canMutate]
  );

  // Commit the seek — called by onValueCommit or onPointerUp fallback.
  // Guarded by pendingSeekRef to prevent double-fire when both handlers run.
  const commitSeek = useCallback(() => {
    const position = pendingSeekRef.current;
    if (position === null) return;

    pendingSeekRef.current = null;
    setIsDragging(false);
    setSliderPosition(position);
    currentPositionRef.current = position;

    const { isPlaying: currentlyPlaying, broadcastPlay: play } = useGlobalStore.getState();

    if (currentlyPlaying) {
      play(position);
    } else {
      useGlobalStore.setState({ currentTime: position });
    }
  }, []);

  // Handle slider release - seek to that position
  const handleSliderCommit = () => {
    if (!canMutate) return;
    commitSeek();
  };

  // Fallback for when onValueCommit gets swallowed by React batching.
  // Radix compares the controlled `values` prop (stale due to batching) against
  // the value captured at pointerDown — if they match, onValueCommit never fires.
  const handlePointerUp = useCallback(() => {
    commitSeek();
  }, [commitSeek]);

  const handlePlay = () => {
    if (!canMutate) return;
    const state = useGlobalStore.getState();
    if (state.isPlaying) {
      state.broadcastPause();
    } else {
      state.broadcastPlay();
    }
  };

  const handleSkipBack = useCallback(() => {
    if (!canMutate) return;
    if (!isShuffled) {
      skipToPreviousTrack();
    }
  }, [canMutate, skipToPreviousTrack, isShuffled]);

  const handleSkipForward = useCallback(() => {
    if (!canMutate) return;
    skipToNextTrack();
  }, [canMutate, skipToNextTrack]);

  const handleShuffle = () => {
    if (!canMutate) return;
    toggleShuffle();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if space is pressed and we're not in an input field
      if (
        e.code === "Space" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        )
      ) {
        e.preventDefault();
        if (canMutate) {
          handlePlay();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[37rem]">
        <div className="flex items-center justify-center gap-6 mb-2">
          <button
            onClick={handleShuffle}
            disabled={!canMutate || audioSourceCount === 0}
            className={cn(
              "transition-all",
              !canMutate || audioSourceCount === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:scale-105 active:scale-95",
              isShuffled ? "text-[#b026ff]" : "text-[#b3b3b3] hover:text-white"
            )}
            title="Toggle Shuffle"
          >
            <div className="relative">
              <Shuffle className="w-5 h-5" />
              {isShuffled && (
                <div className="absolute w-1 h-1 bg-[#b026ff] rounded-full -bottom-1.5 left-1/2 transform -translate-x-1/2"></div>
              )}
            </div>
          </button>
          <button
            onClick={handleSkipBack}
            disabled={!canMutate || audioSourceCount === 0}
            className={cn(
              "text-[#b3b3b3] hover:text-white transition-all",
              !canMutate || audioSourceCount === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            )}
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full bg-white text-black transition-all",
              !canMutate || audioSourceCount === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105 active:scale-95 hover:bg-gray-200"
            )}
            onClick={handlePlay}
            disabled={!canMutate}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
          <button
            className={cn(
              "text-[#b3b3b3] hover:text-white transition-all",
              !canMutate || audioSourceCount === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            )}
            onClick={handleSkipForward}
            disabled={audioSourceCount <= 1 || !canMutate}
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition-all hover:scale-105 active:scale-95">
            <Repeat className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#a7a7a7] font-variant-numeric: tabular-nums min-w-[40px] text-right select-none">
            {formatTime(sliderPosition)}
          </span>
          <Slider
            value={[sliderPosition]}
            min={0}
            max={trackDuration || 1}
            step={0.1}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            onPointerUp={handlePointerUp}
            disabled={!canMutate || trackDuration <= 0}
            className={cn("flex-1", !canMutate || trackDuration <= 0 ? "opacity-50" : "cursor-pointer group")}
          />
          <span className="text-[11px] text-[#a7a7a7] font-variant-numeric: tabular-nums min-w-[40px] select-none">
            {trackDuration > 0 ? formatTime(trackDuration) : "0:00"}
          </span>
        </div>
      </div>
    </div>
  );
};
