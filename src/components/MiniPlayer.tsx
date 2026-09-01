import React from "react";
import { Play, Pause, Volume2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMusicContext } from "../contexts/MusicContext";
import "./MiniPlayer.css";

interface MiniPlayerProps {
  className?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ className }) => {
  const {
    musicState,
    pauseMusic,
    resumeMusic,
    setVolume,
    seekTo,
    stopMusic,
  } = useMusicContext();

  const { currentVideo, isPlaying, currentTime, duration, volume } = musicState;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  if (!currentVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className={`max-w-4xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg p-3.5 ${
        className || ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <img
            src={currentVideo.thumbnails.medium?.url || currentVideo.thumbnails.default?.url}
            alt={currentVideo.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-xs sm:text-sm">
            {currentVideo.title}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {currentVideo.channelTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={isPlaying ? pauseMusic : resumeMusic}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </motion.button>

          <div className="hidden sm:flex items-center gap-2 px-2">
            <Volume2 className="h-4 w-4 text-zinc-400" />
            <div className="relative w-20">
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer slider-thumb"
              />
            </div>
          </div>

          <button
            onClick={stopMusic}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
          {Math.floor(currentTime / 60)}:
          {String(Math.floor(currentTime % 60)).padStart(2, "0")}
        </span>
        <div className="relative flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seekTo(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer slider-thumb"
          />
        </div>
        <span className="text-[10px] font-mono text-zinc-400 w-8">
          {Math.floor(duration / 60)}:
          {String(Math.floor(duration % 60)).padStart(2, "0")}
        </span>
      </div>
    </motion.div>
  );
};
