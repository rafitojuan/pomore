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
      <div className={`bg-gradient-to-r from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`}>
        <div className="text-center text-white/60">
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
      className={`bg-gradient-to-r from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}
    >
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-medium text-sm">Now Playing Queue</h3>
        <p className="text-white/60 text-xs mt-1">{tracks.length} tracks</p>
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
              className={`flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer transition-all border-l-2 ${
                isCurrentTrack 
                  ? 'bg-violet-500/10 border-l-violet-500' 
                  : 'border-l-transparent hover:border-l-white/20'
              }`}
              onClick={() => onTrackSelect(track, index)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded flex items-center justify-center flex-shrink-0">
                {isCurrentTrack && musicState.isPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Pause className="w-3 h-3 text-violet-400" />
                  </motion.div>
                ) : (
                  <Play className="w-3 h-3 text-white/60" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className={`font-medium text-sm truncate ${
                    isCurrentTrack ? 'text-violet-300' : 'text-white'
                  }`}>
                    {track.title}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {track.sourceType === 'youtube' && (
                      <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                        YT
                      </span>
                    )}
                    {track.sourceType === 'soundcloud' && (
                      <span className="text-xs bg-orange-500/80 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                        SC
                      </span>
                    )}
                    {track.sourceType === 'local' && (
                      <span className="text-xs bg-blue-500/80 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                        Local
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`text-xs truncate ${
                  isCurrentTrack ? 'text-violet-400' : 'text-white/60'
                }`}>
                  {track.artist}
                </div>
              </div>

              <div className="text-xs text-white/40 flex-shrink-0">
                {track.duration > 0 ? formatDuration(track.duration) : '--:--'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isYouTubeTrack && (
        <div className="p-3 border-t border-white/10 bg-gradient-to-r from-red-500/10 to-red-600/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-300 font-medium">YouTube Player Active</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

function isYouTubeTrack(tracks: Track[]): boolean {
  return tracks.some(track => track.sourceType === 'youtube');
}