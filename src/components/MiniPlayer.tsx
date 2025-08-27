import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Track, MusicState } from '../types';
import { formatDuration } from '../utils';

interface MiniPlayerProps {
  musicState: MusicState;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  musicState,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [tempVolume, setTempVolume] = useState(musicState.volume);

  useEffect(() => {
    setTempVolume(musicState.volume);
  }, [musicState.volume]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * musicState.duration;
    onSeek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setTempVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const progressPercentage = musicState.duration > 0 
    ? (musicState.currentTime / musicState.duration) * 100 
    : 0;

  if (!musicState.currentTrack) {
    return (
      <div className={`bg-gradient-to-r from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`}>
        <div className="text-center text-white/60">
          <div className="text-sm">No track selected</div>
          <div className="text-xs mt-1">Choose a track to start playing</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-violet-900/30 to-purple-900/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          {musicState.currentTrack.sourceType === 'youtube' && (
            <span className="text-white text-xs font-bold">YT</span>
          )}
          {musicState.currentTrack.sourceType === 'soundcloud' && (
            <span className="text-white text-xs font-bold">SC</span>
          )}
          {musicState.currentTrack.sourceType === 'local' && (
            <span className="text-white text-xs font-bold">♪</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">
            {musicState.currentTrack.title}
          </div>
          <div className="text-white/60 text-sm truncate">
            {musicState.currentTrack.artist}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <SkipBack className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={musicState.isPlaying ? onPause : onPlay}
            className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            {musicState.isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-4 h-4 text-white" />
          </motion.button>
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            {tempVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </motion.button>

          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3"
            >
              <input
                type="range"
                min="0"
                max="100"
                value={tempVolume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 text-center mt-1">
                {tempVolume}%
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div
          className="w-full h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/60">
          <span>{formatDuration(musicState.currentTime)}</span>
          <span>{formatDuration(musicState.duration)}</span>
        </div>
      </div>


    </motion.div>
  );
};