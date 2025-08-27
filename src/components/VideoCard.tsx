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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300"
    >
      <div className="relative group">
        <img
          src={video.thumbnails.medium.url}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={() => onPlay(video)}
            size="sm"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(parseDuration(video.duration))}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
          {video.title}
        </h3>
        <p className="text-white/60 text-xs mb-3">{video.channelTitle}</p>
        <div className="flex items-center justify-between text-xs text-white/50 mb-3">
          <div className="flex items-center gap-4">
            {video.viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{parseInt(video.viewCount).toLocaleString()}</span>
              </div>
            )}
            {video.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(parseDuration(video.duration))}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onPlay(video)}
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Play className="h-3 w-3 mr-1" />
            Play
          </Button>
          <div className="relative">
            <Button
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              size="sm"
              variant="outline"
              className="border-white/20 hover:border-white/40"
            >
              <Plus className="h-3 w-3" />
            </Button>
            {showPlaylistMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-white/20 rounded-lg shadow-lg z-10 min-w-48"
              >
                <div className="p-2">
                  <div className="text-xs text-white/60 mb-2 px-2">Add to playlist:</div>
                  {playlists.length === 0 ? (
                    <div className="text-xs text-white/40 px-2 py-1">No playlists available</div>
                  ) : (
                    playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        className="w-full text-left px-2 py-1 text-xs text-white hover:bg-white/10 rounded transition-colors"
                      >
                        {playlist.name}
                      </button>
                    ))
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