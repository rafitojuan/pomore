import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Clock, Eye } from 'lucide-react';
import { Button } from './ui/Button';
import { YouTubeVideo, Playlist } from '../types';

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

interface VideoCardProps {
  video: YouTubeVideo;
  playlists: Playlist[];
  onPlay: (video: YouTubeVideo) => void;
  onAddToPlaylist: (video: YouTubeVideo, playlistId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  playlists,
  onPlay,
  onAddToPlaylist
}) => {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const handleAddToPlaylist = (playlistId: string) => {
    onAddToPlaylist(video, playlistId);
    setShowPlaylistMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="theme-bg-tertiary backdrop-blur-xl rounded-3xl overflow-hidden border theme-border hover:theme-border-accent shadow-2xl hover:shadow-theme-accent/10 transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <motion.img
          src={video.thumbnails.medium.url}
          alt={video.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          whileHover={{ scale: 1.1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => onPlay(video)}
              size="sm"
              className="theme-bg-secondary hover:theme-bg-primary backdrop-blur-xl border theme-border-accent rounded-2xl px-6 py-3 theme-text-primary font-medium shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <Play className="h-5 w-5 mr-2" />
              Play Now
            </Button>
          </motion.div>
        </motion.div>
        {video.duration && video.duration.trim() !== '' && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm theme-text-primary text-xs px-3 py-1.5 rounded-xl border theme-border">
            {formatDuration(parseDuration(video.duration))}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="theme-text-primary font-semibold text-base line-clamp-2 mb-3 group-hover:text-purple-300 transition-colors duration-300">
          {video.title}
        </h3>
        <p className="theme-text-secondary text-sm mb-4 group-hover:theme-text-primary transition-colors duration-300">
          {video.channelTitle}
        </p>
        <div className="flex items-center justify-between text-sm theme-text-muted mb-4">
          <div className="flex items-center gap-4">
            {video.viewCount && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{parseInt(video.viewCount).toLocaleString()}</span>
              </div>
            )}
            {video.duration && video.duration.trim() !== '' && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(parseDuration(video.duration))}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => onPlay(video)}
              size="sm"
              className="w-full bg-gradient-to-r theme-accent/80 hover:theme-accent backdrop-blur-xl border theme-border hover:theme-border-accent theme-text-primary font-medium rounded-2xl py-3 shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </motion.div>
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                size="sm"
                variant="outline"
                className="theme-bg-tertiary hover:theme-bg-secondary theme-border hover:theme-border-accent rounded-2xl p-3 transition-all duration-300"
              >
                <Plus className="h-4 w-4 theme-text-primary" />
              </Button>
            </motion.div>
            {showPlaylistMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-3 theme-bg-secondary backdrop-blur-xl border theme-border rounded-2xl shadow-2xl z-20 min-w-52 overflow-hidden"
              >
                <div className="p-4">
                  <div className="text-sm font-medium theme-text-primary mb-3 pb-2 border-b theme-border">
                    Add to playlist
                  </div>
                  {playlists.length === 0 ? (
                    <div className="text-sm theme-text-secondary py-2 text-center">
                      No playlists available
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {playlists.map((playlist) => (
                        <motion.button
                          key={playlist.id}
                          onClick={() => handleAddToPlaylist(playlist.id)}
                          className="w-full text-left px-3 py-2 text-sm theme-text-primary hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center gap-2"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-2 h-2 bg-gradient-to-r theme-accent rounded-full"></div>
                          {playlist.name}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};