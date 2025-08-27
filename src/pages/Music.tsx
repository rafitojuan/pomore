import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { youtubePlayerService } from '../services/youtubePlayerService';
import youtubeDataService from '../services/youtubeDataService';
import { musicService } from '../services/musicService';
import { YouTubeVideo, YouTubeSearchResult, Playlist, YouTubeCategory } from '../types';
import { Play, Pause, SkipForward, SkipBack, Volume2, Search, TrendingUp, Music as MusicIcon, Clock, Heart, List, Plus, Eye, Upload, X, Trash2, Edit2 } from 'lucide-react';
import { VideoCard } from '../components/VideoCard';
import { toast } from 'sonner';
import type { SourceType } from '../types';


export const Music: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [categories, setCategories] = useState<YouTubeCategory[]>([]);
  const [categoryVideos, setCategoryVideos] = useState<YouTubeVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'categories' | 'playlists'>('trending');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlaylists();
    loadTrendingVideos();
    loadCategories();
    const savedHistory = localStorage.getItem('youtube-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
    
    youtubePlayerService.onStateChange((state) => {
      setIsPlaying(state === 'playing');
      if (state === 'ended') {
        setCurrentVideo(null);
        setIsPlaying(false);
      }
    });
    
    const updateTime = setInterval(() => {
      if (youtubePlayerService.isPlayerReady()) {
        setCurrentTime(youtubePlayerService.getCurrentTime());
        setDuration(youtubePlayerService.getDuration());
      }
    }, 1000);
    
    return () => clearInterval(updateTime);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (youtubePlayerService.getPlayerState() === '1') {
        const currentTime = youtubePlayerService.getCurrentTime();
        const duration = youtubePlayerService.getDuration();
        setCurrentTime(currentTime);
        setDuration(duration);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const debounceTimer = setTimeout(async () => {
        try {
          const suggestions = await youtubeDataService.getSearchSuggestions(searchQuery);
          setSuggestions(suggestions.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const loadPlaylists = () => {
    const playlists = musicService.getPlaylists();
    setPlaylists(playlists);
  };

  const loadTrendingVideos = async () => {
    try {
      setIsLoading(true);
      const videos = await youtubeDataService.getTrendingVideos(20);
      setTrendingVideos(videos);
    } catch (error) {
      console.error('Error loading trending videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await youtubeDataService.getVideoCategories();
      const musicCategories = categoryList.filter(cat => 
        cat.title.toLowerCase().includes('music') || 
        cat.title.toLowerCase().includes('entertainment') ||
        cat.id === '10'
      );
      setCategories(musicCategories.length > 0 ? musicCategories : categoryList.slice(0, 10));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCategoryVideos = async (categoryId: string) => {
    try {
      const videos = await youtubeDataService.getVideosByCategory(categoryId, 20);
      setCategoryVideos(videos);
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error('Error loading category videos:', error);
    }
  };





  const searchVideos = async (query: string, loadMore: boolean = false) => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const pageToken = loadMore ? nextPageToken : undefined;
      const result = await youtubeDataService.searchVideos(query, 20, pageToken);
      
      if (loadMore) {
        setSearchResults(prev => [...prev, ...result.videos]);
      } else {
        setSearchResults(result.videos);
        setActiveTab('search');
        if (!searchHistory.includes(query)) {
           const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
           setSearchHistory(updated);
           localStorage.setItem('youtube-search-history', JSON.stringify(updated));
         }
      }
      
      setNextPageToken(result.nextPageToken);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const suggestions = await youtubeDataService.getSearchSuggestions(query);
      setSearchSuggestions(suggestions.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    getSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    searchVideos(suggestion);
  };

  const loadMoreResults = () => {
    if (nextPageToken && searchQuery) {
      searchVideos(searchQuery, true);
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    if (editingPlaylist) {
      const updatedPlaylist = { ...editingPlaylist, name: newPlaylistName, updatedAt: new Date() };
      const updatedPlaylists = playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p);
      setPlaylists(updatedPlaylists);
    } else {
      musicService.createPlaylist(newPlaylistName);
      loadPlaylists();
    }
    
    setNewPlaylistName('');
    setShowAddPlaylist(false);
    setEditingPlaylist(null);
  };

  const handleAddTrack = () => {
    console.log('Add track not implemented for YouTube Music');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload not implemented for YouTube Music');
  };

  const playVideo = async (video: YouTubeVideo) => {
    try {
      setCurrentVideo(video);
      await youtubePlayerService.loadVideo(video.id);
      await youtubePlayerService.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await youtubePlayerService.pause();
        setIsPlaying(false);
      } else {
        await youtubePlayerService.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handlePlay = () => {
    if (currentVideo) {
      youtubePlayerService.play();
    }
  };

  const handlePause = () => {
    if (currentVideo) {
      youtubePlayerService.pause();
    }
  };

  const handleTrackSelect = (video: YouTubeVideo) => {
    playVideo(video);
  };

  const handleNext = () => {
    console.log('Next track');
  };

  const handlePrevious = () => {
    console.log('Previous track');
  };

  const handleShuffle = () => {
    console.log('Shuffle playlist');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    youtubePlayerService.setVolume(newVolume);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    youtubePlayerService.seekTo(time);
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  const addToPlaylist = async (video: YouTubeVideo, playlistId: string) => {
    try {
      await musicService.addTrack(playlistId, {
        title: video.title,
        artist: video.channelTitle,
        sourceType: 'youtube' as SourceType,
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        duration: parseDuration(video.duration)
      });
      
      await loadPlaylists();
      toast.success(`Added "${video.title}" to playlist`);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast.error('Failed to add video to playlist');
    }
  };





  const deletePlaylist = (playlistId: string) => {
    musicService.deletePlaylist(playlistId);
    loadPlaylists();
  };
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <MusicIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                YouTube Music
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Discover and play music from YouTube
              </p>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <Search className="h-5 w-5 text-gray-400" />
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search for music, artists, or songs..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && searchVideos(searchQuery)}
                  className="w-full border-none bg-transparent focus:ring-0 focus:outline-none"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                   <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 z-10 max-h-48 overflow-y-auto">
                     {searchSuggestions.map((suggestion, index) => (
                       <div
                         key={index}
                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white text-sm"
                         onClick={() => handleSuggestionClick(suggestion)}
                       >
                         <Search className="w-4 h-4 inline mr-2 text-gray-400" />
                         {suggestion}
                       </div>
                     ))}
                   </div>
                 )}
                 {!searchQuery && searchHistory.length > 0 && showSuggestions && (
                   <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 z-10 max-h-48 overflow-y-auto">
                     <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                       Recent searches
                     </div>
                     {searchHistory.map((query, index) => (
                       <div
                         key={index}
                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white text-sm"
                         onClick={() => handleSuggestionClick(query)}
                       >
                         <Search className="w-4 h-4 inline mr-2 text-gray-400" />
                         {query}
                       </div>
                     ))}
                   </div>
                 )}
              </div>
              <Button
                onClick={() => searchVideos(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                className="rounded-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      searchVideos(suggestion);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setActiveTab('trending')}
              variant={activeTab === 'trending' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Button>
            <Button
              onClick={() => setActiveTab('search')}
              variant={activeTab === 'search' ? 'default' : 'outline'}
              className="flex items-center gap-2"
              disabled={searchResults.length === 0}
            >
              <Search className="h-4 w-4" />
              Search Results
            </Button>
            <Button
              onClick={() => setActiveTab('categories')}
              variant={activeTab === 'categories' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <MusicIcon className="h-4 w-4" />
              Categories
            </Button>
            <Button
              onClick={() => setActiveTab('playlists')}
              variant={activeTab === 'playlists' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              My Playlists
            </Button>
          </div>
        </div>

        {activeTab === 'trending' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Trending Music
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg animate-pulse">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-600 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Browse by Category
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => loadCategoryVideos(category.id)}
                  className={`p-4 rounded-lg text-center transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-sm font-medium">{category.title}</div>
                </button>
              ))}
            </div>

            {categoryVideos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {categories.find(cat => cat.id === selectedCategory)?.title} Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryVideos.map((video) => (
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
          </div>
        )}

        {activeTab === 'search' && searchResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {nextPageToken && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={loadMoreResults}
                  disabled={isSearching}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSearching ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                My Playlists
              </h2>
              <Button onClick={() => setShowAddPlaylist(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Playlist
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="lg:col-span-1"
             >
               <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <List className="h-5 w-5" />
                     Playlists
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {playlists.map((playlist) => (
                     <motion.div
                       key={playlist.id}
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       className="p-3 rounded-lg cursor-pointer transition-all duration-200 bg-white/5 hover:bg-white/10 border border-transparent"
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex-1">
                           <h3 className="font-medium text-white">{playlist.name}</h3>
                           <p className="text-sm text-white/70">
                             {playlist.tracks.length} tracks
                           </p>
                         </div>
                         <div className="flex items-center gap-2">
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={(e) => {
                               e.stopPropagation();
                               setEditingPlaylist(playlist);
                               setShowAddPlaylist(true);
                             }}
                             className="text-white/70 hover:text-white hover:bg-white/10"
                           >
                             <Edit2 className="h-3 w-3" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => deletePlaylist(playlist.id)}
                             className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                           >
                             <Trash2 className="h-3 w-3" />
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
                 </CardContent>
               </Card>
             </motion.div>
            </div>
          </div>
        )}

        {currentVideo && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={currentVideo.thumbnails.medium.url}
                    alt={currentVideo.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {currentVideo.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {currentVideo.channelTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                    <span>/</span>
                    <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div id="youtube-player" style={{ display: 'none' }}></div>
    </div>
  );
};