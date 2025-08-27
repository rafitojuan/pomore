import React from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMusicContext } from "../contexts/MusicContext";
import "./MiniPlayer.css";

interface MiniPlayerProps {
  className?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ className }) => {
  const {
    musicState,
    playTrack,
    pauseMusic,
    resumeMusic,
    setVolume,
    seekTo,
    stopMusic,
  } = useMusicContext();

  const { currentVideo, isPlaying, currentTime, duration, volume } = musicState;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  if (!currentVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-9 shadow-2xl ${
        className || ""
      }`}
    >
      <motion.button
        onClick={stopMusic}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 backdrop-blur-xl border border-white/20 hover:border-white/30"
      >
        <X className="h-4 w-4" />
      </motion.button>
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <img
            src={currentVideo.thumbnails.medium.url}
            alt={currentVideo.title}
            className="w-16 h-16 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate text-base mb-1">
            {currentVideo.title}
          </h4>
          <p className="text-sm text-gray-400 truncate">
            {currentVideo.channelTitle}
          </p>
        </div>

        <motion.button
          onClick={isPlaying ? pauseMusic : resumeMusic}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl transition-all duration-300 shadow-xl backdrop-blur-xl border border-white/20"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </motion.button>

        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <div className="relative w-24">
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, rgb(168 85 247 / 0.8) 0%, rgb(59 130 246 / 0.8) ${
                  volume * 100
                }%, rgb(255 255 255 / 0.1) ${
                  volume * 100
                }%, rgb(255 255 255 / 0.1) 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seekTo(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, rgb(168 85 247 / 0.8) 0%, rgb(59 130 246 / 0.8) ${progressPercentage}%, rgb(255 255 255 / 0.1) ${progressPercentage}%, rgb(255 255 255 / 0.1) 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>
            {Math.floor(currentTime / 60)}:
            {String(Math.floor(currentTime % 60)).padStart(2, "0")}
          </span>
          <span>
            {Math.floor(duration / 60)}:
            {String(Math.floor(duration % 60)).padStart(2, "0")}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
