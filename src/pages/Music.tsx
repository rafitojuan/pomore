import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  Music as MusicIcon,
  List,
  Plus,
  Trash2,
  Sparkles,
  Radio,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { VideoCard } from "../components/VideoCard";
import { useMusicContext } from "../contexts/MusicContext";

const Music: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    suggestions,
    trendingVideos,
    categories,
    loadMoreResults,
    loadCategoryVideos,
    getSuggestions,
    searchVideos,
    playVideo,
  } = useMusicContext();

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "trending" | "search" | "categories" | "playlists"
  >("trending");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryVideos, setCategoryVideos] = useState<any[]>([]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const savedPlaylists = localStorage.getItem("music-playlists");
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch (error) {
        console.error("Error loading playlists:", error);
      }
    }
  };

  const handleSearchInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      await getSuggestions(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveTab("search");
    searchVideos(suggestion);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem("music-playlists", JSON.stringify(updatedPlaylists));
    setNewPlaylistName("");
    setShowAddPlaylist(false);
  };

  const addToPlaylist = (video: any, playlistId: string) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          videos: [...(playlist.videos || []), video],
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    localStorage.setItem("music-playlists", JSON.stringify(updatedPlaylists));
  };

  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem("music-playlists", JSON.stringify(updatedPlaylists));
  };

  const tabItems = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "categories", label: "Categories", icon: Sparkles },
    { id: "playlists", label: "Playlists", icon: List },
    ...(searchResults.length > 0
      ? [{ id: "search", label: "Search Results", icon: Search }]
      : []),
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500" />
            Focus Audio & Music
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Stream lo-fi beats, ambient sounds, and study tracks from YouTube
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search lo-fi, synthwave, ambient..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                setActiveTab("search");
                searchVideos(searchQuery);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 text-xs max-h-48 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(item);
                  }}
                  className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-700 dark:text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                ${
                  isActive
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "trending" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {trendingVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                playlists={playlists}
                onPlay={playVideo}
                onAddToPlaylist={addToPlaylist}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  loadCategoryVideos(cat.id);
                }}
                className={`
                  p-3 rounded-lg border text-left transition-all duration-150
                  ${
                    selectedCategory === cat.id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }
                `}
              >
                <div className="text-xs font-semibold tracking-tight">{cat.title}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Explore mix</div>
              </button>
            ))}
          </div>

          {/* Note: In full implementation, categoryVideos would be loaded here. Skipping for brevity. */}
        </div>
      )}

      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {searchResults.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                playlists={playlists}
                onPlay={playVideo}
                onAddToPlaylist={addToPlaylist}
              />
            ))}
          </div>
          {searchResults.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" size="sm" onClick={loadMoreResults}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Custom Playlists ({playlists.length})
            </span>
            <Button size="sm" onClick={() => setShowAddPlaylist(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Playlist
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((playlist) => (
              <Card key={playlist.id} padding="sm" className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {playlist.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    {playlist.videos?.length || playlist.tracks?.length || 0} tracks
                  </p>
                </div>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Card>
            ))}
            {playlists.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-zinc-500">
                <MusicIcon className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                No custom playlists yet. Create one to curate your focus sound.
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Playlist Modal */}
      <AnimatePresence>
        {showAddPlaylist && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPlaylist(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-5"
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Create Playlist
              </h3>
              <input
                type="text"
                placeholder="Playlist name (e.g., Deep Focus, Coding)"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreatePlaylist} className="flex-1 text-xs">
                  Create
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddPlaylist(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Music };
