import React, { useState } from "react";
import { Play, Plus, Clock, Eye } from "lucide-react";
import { Button } from "./ui/Button";
import { YouTubeVideo, Playlist } from "../types";

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
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
  onAddToPlaylist,
}) => {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const handleAddToPlaylist = (playlistId: string) => {
    onAddToPlaylist(video, playlistId);
    setShowPlaylistMenu(false);
  };

  const durationSecs =
    video.duration && video.duration.trim() !== ""
      ? parseDuration(video.duration)
      : 0;

  return (
    <div className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={video.thumbnails.medium?.url || video.thumbnails.default?.url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {durationSecs > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-100">
            {formatDuration(durationSecs)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug mb-1">
            {video.title}
          </h4>
          <p className="text-[11px] text-zinc-500 truncate mb-2">
            {video.channelTitle}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            {video.viewCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {parseInt(video.viewCount).toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 relative">
            <Button
              size="sm"
              onClick={() => onPlay(video)}
              className="h-7 px-2.5 text-[11px] gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              Play
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className="h-7 w-7 p-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>

            {showPlaylistMenu && (
              <div className="absolute bottom-full right-0 mb-1.5 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-30 p-1">
                <div className="text-[10px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Add to Playlist
                </div>
                {playlists.length === 0 ? (
                  <div className="text-[11px] text-zinc-500 px-2 py-1">
                    No playlists
                  </div>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handleAddToPlaylist(pl.id)}
                      className="w-full text-left px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded truncate"
                    >
                      {pl.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
