import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Track, MusicState } from '../types';
import { formatDuration } from '../utils';

interface PlaylistMiniProps {
  tracks: Track[];
  musicState: MusicState;
  onTrackSelect: (track: Track, index: number) => void;
  className?: string;
}

export const PlaylistMini: React.FC<PlaylistMiniProps> = ({
  tracks,
  musicState,
  onTrackSelect,
  className = ''
}) => {
  if (tracks.length === 0) {
    return (
      <div className={`glassmorphism rounded-xl p-4 ${className}`}>
        <div className="text-center theme-text-muted">
          <div className="text-sm">No tracks in playlist</div>
          <div className="text-xs mt-1">Add some music to get started</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glassmorphism rounded-xl ${className}`}
    >
      <div className="p-4 border-b theme-border">
        <h3 className="theme-text-primary font-medium text-sm">Now Playing Queue</h3>
        <p className="theme-text-muted text-xs mt-1">{tracks.length} tracks</p>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {tracks.map((track, index) => {
          const isCurrentTrack = musicState.currentTrack?.id === track.id;
          const isYouTubeTrack = track.sourceType === 'youtube';
          
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex items-center space-x-3 p-3 hover:theme-bg-tertiary cursor-pointer transition-all border-l-2 ${
                isCurrentTrack 
                  ? 'theme-accent/10 border-l-theme-accent' 
                  : 'border-l-transparent hover:border-l-theme-border'
              }`}
              onClick={() => onTrackSelect(track, index)}
            >
              <div className="w-8 h-8 theme-accent/20 rounded flex items-center justify-center flex-shrink-0">
                {isCurrentTrack && musicState.isPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Pause className="w-3 h-3 theme-text-secondary" />
                  </motion.div>
                ) : (
                  <Play className="w-3 h-3 theme-text-muted" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className={`font-medium text-sm truncate ${
                    isCurrentTrack ? 'theme-text-secondary' : 'theme-text-primary'
                  }`}>
                    {track.title}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {track.sourceType === 'youtube' && (
                      <span className="text-xs bg-red-500/80 theme-text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                        YT
                      </span>
                    )}
                    {track.sourceType === 'soundcloud' && (
                      <span className="text-xs bg-orange-500/80 theme-text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                        SC
                      </span>
                    )}
                    {track.sourceType === 'local' && (
                      <span className="text-xs bg-blue-500/80 theme-text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                        Local
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`text-xs truncate ${
                  isCurrentTrack ? 'theme-text-secondary' : 'theme-text-muted'
                }`}>
                  {track.artist}
                </div>
              </div>

              <div className="text-xs theme-text-muted flex-shrink-0">
                {track.duration > 0 ? formatDuration(track.duration) : '--:--'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isYouTubeTrack(tracks) && (
        <div className="p-3 border-t theme-border bg-red-500/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs theme-text-secondary font-medium">YouTube Player Active</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

function isYouTubeTrack(tracks: Track[]): boolean {
  return tracks.some(track => track.sourceType === 'youtube');
}