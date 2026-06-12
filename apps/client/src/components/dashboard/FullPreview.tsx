import { useGlobalStore } from "@/store/global";
import { Music, Minimize2 } from "lucide-react";
import { motion } from "motion/react";

export const FullPreview = () => {
  const audioSources = useGlobalStore((state) => state.audioSources);
  const selectedAudioUrl = useGlobalStore((state) => state.selectedAudioUrl);
  
  const currentSource = audioSources.find(s => s.source.url === selectedAudioUrl);
  const metadata = currentSource?.source.metadata;

  if (!metadata) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Blurred Background */}
      {metadata.thumbnail && (
        <div 
          className="absolute inset-0 opacity-20 blur-[100px] scale-150 transform-gpu z-0 pointer-events-none"
          style={{ backgroundImage: `url(${metadata.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      
      {/* Close Button */}
      <button 
        onClick={() => useGlobalStore.getState().setIsPreviewMode(false)}
        className="absolute top-6 right-6 z-20 p-2 rounded-full bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors"
        title="Close Preview"
      >
        <Minimize2 className="w-5 h-5" />
      </button>
      
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center max-h-full overflow-hidden"
      >
        {metadata.thumbnail ? (
          <img 
            src={metadata.thumbnail} 
            alt={metadata.title} 
            className="w-full max-w-[min(320px,35vh)] lg:max-w-[min(400px,40vh)] aspect-square rounded-2xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 md:mb-8 ring-1 ring-white/10 shrink-0" 
          />
        ) : (
          <div className="w-full max-w-[min(320px,35vh)] lg:max-w-[min(400px,40vh)] aspect-square rounded-2xl bg-neutral-800/50 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 md:mb-8 ring-1 ring-white/10 shrink-0">
            <Music className="w-24 h-24 text-neutral-600" />
          </div>
        )}
        
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4 leading-tight tracking-tight line-clamp-2 w-full px-4 shrink-0">
          {metadata.title}
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 font-medium line-clamp-1 w-full px-4 shrink-0">
          {metadata.artist || "Unknown Artist"}
        </p>
        
        {metadata.album && (
          <div className="mt-4 md:mt-6 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-neutral-300 font-medium tracking-wide truncate max-w-full shrink-0">
            {metadata.album} {metadata.releaseYear ? `• ${metadata.releaseYear}` : ""}
          </div>
        )}
      </motion.div>
    </div>
  );
};
