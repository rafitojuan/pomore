import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  Music as MusicIcon,
  List,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
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
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "trending" | "search" | "categories" | "playlists"
  >("trending");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryVideos, setCategoryVideos] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

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

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: new Date().toISOString(),
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem("music-playlists", JSON.stringify(updatedPlaylists));
    setShowAddPlaylist(false);
  };

  const handleAddTrack = () => {
    console.log("Add track not implemented for YouTube Music");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File upload not implemented for YouTube Music");
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  };

  const addToPlaylist = (video: any, playlistId: string) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          videos: [...playlist.videos, video],
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
  };

  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem("music-playlists", JSON.stringify(updatedPlaylists));
  };

  return (
    <div className="h-screen theme-bg-primary">
      <div className="absolute top-0 left-1/4 w-96 h-96 theme-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 theme-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 h-full w-full px-4 py-4 overflow-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="p-4 theme-accent/20 backdrop-blur-xl rounded-2xl theme-border shadow-2xl"
            >
              <MusicIcon className="h-10 w-10 theme-text-primary" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl font-bold theme-text-primary leading-tight"
              >
                Music Library
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="theme-text-secondary mt-2 text-lg font-light tracking-wide"
              >
                Discover and play music from your own sanctum
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mb-6"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <Input
                    type="text"
                    placeholder="Search for music, artists, or songs..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setActiveTab("search");
                        searchVideos(searchQuery);
                      }
                    }}
                    className="pr-12 h-14 theme-bg-secondary backdrop-blur-xl theme-border hover:theme-border-accent focus:theme-border-accent rounded-2xl theme-text-primary placeholder-theme-text-secondary text-lg font-light transition-all duration-300 shadow-2xl"
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-secondary" />
                </motion.div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 theme-bg-secondary backdrop-blur-xl theme-border rounded-2xl mt-2 z-10 max-h-48 overflow-y-auto custom-scrollbar shadow-2xl">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:theme-bg-tertiary cursor-pointer theme-text-primary text-sm transition-all duration-200"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="w-4 h-4 inline mr-2 theme-text-secondary" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                {!searchQuery &&
                  searchHistory.length > 0 &&
                  showSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl mt-2 z-10 max-h-48 overflow-y-auto custom-scrollbar shadow-2xl">
                      <div className="px-4 py-2 text-xs text-white/60 border-b border-white/20">
                        Recent searches
                      </div>
                      {searchHistory.map((query, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white text-sm transition-all duration-200"
                          onClick={() => handleSuggestionClick(query)}
                        >
                          <Search className="w-4 h-4 inline mr-2 text-white/60" />
                          {query}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    setActiveTab("search");
                    searchVideos(searchQuery);
                  }}
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-14 px-8 theme-accent/80 hover:theme-accent backdrop-blur-xl theme-border hover:theme-border-accent theme-text-primary font-medium rounded-2xl shadow-2xl transition-all duration-300"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-6"
          >
            <div className="flex space-x-2 theme-bg-secondary backdrop-blur-xl rounded-2xl p-2 theme-border shadow-2xl">
              {["trending", "search", "categories", "playlists"].map(
                (tab, index) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                      activeTab === tab
                        ? "theme-accent/80 theme-text-primary shadow-xl theme-border"
                        : "theme-text-secondary hover:theme-text-primary hover:theme-bg-tertiary border border-transparent hover:theme-border"
                    }`}
                  >
                    <div className="flex items-center justify-center relative z-10">
                      {tab === "trending" && (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      {tab === "search" && <Search className="h-4 w-4 mr-2" />}
                      {tab === "categories" && (
                        <MusicIcon className="h-4 w-4 mr-2" />
                      )}
                      {tab === "playlists" && <List className="h-4 w-4 mr-2" />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 theme-accent/20 backdrop-blur-sm rounded-xl"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "trending" && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl border border-white/10">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Trending Music
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </motion.div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 animate-pulse border border-white/10 shadow-2xl"
                    >
                      <div className="bg-white/20 h-40 rounded-xl mb-4"></div>
                      <div className="bg-white/20 h-4 rounded-lg mb-3"></div>
                      <div className="bg-white/20 h-3 rounded-lg w-2/3"></div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {trendingVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <VideoCard
                        video={video}
                        playlists={playlists}
                        onPlay={playVideo}
                        onAddToPlaylist={addToPlaylist}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === "categories" && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl border border-white/10">
                  <MusicIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Music Categories
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    onClick={() => loadCategoryVideos(category.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group p-6 backdrop-blur-xl rounded-2xl border transition-all duration-300 text-left shadow-2xl ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-purple-500/80 to-blue-500/80 border-white/30 text-white shadow-purple-500/20"
                        : "bg-white/10 border-white/10 hover:border-white/30 text-white hover:shadow-purple-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Sparkles className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full group-hover:scale-150 transition-transform"></div>
                    </div>
                    <div className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors leading-tight">
                      {category.title}
                    </div>
                    <div className="mt-2 text-xs text-white/60 group-hover:text-white/80 transition-colors">
                      Explore category
                    </div>
                  </motion.button>
                ))}
              </div>
              {categoryVideos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-12"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-white/10">
                      <MusicIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {
                        categories.find((cat) => cat.id === selectedCategory)
                          ?.title
                      }{" "}
                      Videos
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {categoryVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <VideoCard
                          video={video}
                          playlists={playlists}
                          onPlay={playVideo}
                          onAddToPlaylist={addToPlaylist}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "search" && searchResults.length > 0 && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl border border-white/10">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Search Results ({searchResults.length})
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {searchResults.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <VideoCard
                      video={video}
                      playlists={playlists}
                      onPlay={playVideo}
                      onAddToPlaylist={addToPlaylist}
                    />
                  </motion.div>
                ))}
              </div>
              {nextPageToken && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={loadMoreResults}
                    disabled={isSearching}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isSearching ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "playlists" && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl border border-white/10">
                    <List className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    My Playlists
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setShowAddPlaylist(true)}
                    className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white font-medium rounded-2xl px-6 py-3 shadow-2xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Playlist
                  </Button>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl"
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                      Playlists ({playlists.length})
                    </h3>
                    <div className="space-y-3">
                      {playlists.map((playlist, index) => (
                        <motion.div
                          key={playlist.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-4 rounded-2xl cursor-pointer transition-all duration-300 group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                {playlist.name}
                              </h4>
                              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                {playlist.tracks.length} tracks
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlaylist(playlist);
                                  setShowAddPlaylist(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-white/20 rounded-xl"
                              >
                                <Edit2 className="h-4 w-4 text-white" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePlaylist(playlist.id);
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {playlists.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <MusicIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No playlists yet. Create your first playlist!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
                <div className="lg:col-span-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <div className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl border border-white/10 w-fit mx-auto mb-6">
                        <MusicIcon className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Select a Playlist
                      </h3>
                      <p className="text-gray-400 text-lg">
                        Choose a playlist from the left to view its contents
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddPlaylist(false);
              setEditingPlaylist(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-white/10 w-fit mx-auto mb-4">
                  <List className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {editingPlaylist ? "Edit Playlist" : "Create New Playlist"}
                </h3>
                <p className="text-gray-400">
                  {editingPlaylist
                    ? "Update your playlist name"
                    : "Give your playlist a name"}
                </p>
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter playlist name..."
                  className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddPlaylist(false);
                      setEditingPlaylist(null);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 text-white rounded-2xl py-3 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleCreatePlaylist("")}
                    className="w-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 border border-white/20 text-white rounded-2xl py-3 shadow-xl transition-all duration-300"
                  >
                    {editingPlaylist ? "Update" : "Create"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <div id="youtube-player" style={{ display: "none" }}></div> */}
    </div>
  );
};

export { Music };
