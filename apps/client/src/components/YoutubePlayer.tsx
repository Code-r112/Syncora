import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YoutubePlayer = ({
  videoId,
  isPlaying,
  currentTime,
}: {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsReady(true);
      };
    } else {
      setIsReady(true);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isReady && containerRef.current && !playerRef.current) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          mute: 1, // Muted because AudioContext handles the high-quality spatial audio!
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
        events: {
          onReady: (e: any) => {
            if (isPlaying) {
              e.target.seekTo(currentTime, true);
              e.target.playVideo();
            } else {
              e.target.seekTo(currentTime, true);
              e.target.pauseVideo();
            }
          },
        },
      });
    } else if (playerRef.current && isReady) {
      // If videoId changes
      playerRef.current.loadVideoById(videoId, currentTime);
      if (!isPlaying) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isReady, videoId]);

  // Sync logic
  useEffect(() => {
    if (playerRef.current && playerRef.current.seekTo && typeof playerRef.current.getCurrentTime === "function") {
      if (isPlaying) {
        const ytState = playerRef.current.getPlayerState();
        if (ytState !== 1 && ytState !== 3) {
          // 1 is playing, 3 is buffering
          playerRef.current.playVideo();
        }
        // Check drift
        const ytTime = playerRef.current.getCurrentTime();
        if (Math.abs(ytTime - currentTime) > 1.5) {
          playerRef.current.seekTo(currentTime, true);
        }
      } else {
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(currentTime, true);
      }
    }
  }, [isPlaying, Math.floor(currentTime / 2)]); // check sync every 2 seconds or on play state change

  return (
    <div className="w-full h-full relative bg-black/50 rounded-xl overflow-hidden group shadow-2xl ring-1 ring-white/10 flex items-center justify-center pointer-events-none">
      <div className="w-[120%] h-[120%] absolute -top-[10%] -left-[10%]">
        <div ref={containerRef} className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-transparent z-10" />
    </div>
  );
};
