import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { youtubePlayerService } from '../services/youtubePlayerService';
import youtubeDataService from '../services/youtubeDataService';
import { YouTubeVideo } from '../types';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  sourceType: 'youtube' | 'local';
  sourceId?: string;
}

interface MusicState {
  currentTrack: Track | null;
  currentVideo: YouTubeVideo | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  searchQuery: string;
  searchResults: any[];
  trendingVideos: any[];
  categories: any[];
  suggestions: string[];
  isSearching: boolean;
  playlist: Track[];
  currentIndex: number;
}

interface MusicContextType {
  musicState: MusicState;
  searchQuery: string;
  searchResults: YouTubeVideo[];
  searchSuggestions: string[];
  searchHistory: string[];
  trendingVideos: YouTubeVideo[];
  categories: any[];
  suggestions: string[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  searchVideos: (query: string) => Promise<void>;
  loadMoreResults: () => Promise<void>;
  loadCategoryVideos: (categoryId: string) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  playTrack: (track: Track) => void;
  playVideo: (video: YouTubeVideo) => void;
  handlePlayPause: () => void;
  handleVolumeChange: (volume: number) => void;
  handleSeek: (time: number) => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  clearSearch: () => void;
  loadTrendingVideos: () => Promise<void>;
  loadCategories: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicState, setMusicState] = useState<MusicState>({
    currentTrack: null,
    currentVideo: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    searchQuery: '',
    searchResults: [],
    trendingVideos: [],
    categories: [],
    suggestions: [],
    isSearching: false,
    playlist: [],
    currentIndex: -1
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeYouTubePlayer = async () => {
      try {
        youtubePlayerService.onStateChange((state) => {
          setMusicState(prev => ({
            ...prev,
            isPlaying: state === 'playing'
          }));
          
          if (state === 'playing') {
            startTimeUpdate();
          } else {
            stopTimeUpdate();
          }
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    const startTimeUpdate = () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      
      updateIntervalRef.current = setInterval(() => {
        if (youtubePlayerService.isPlayerReady()) {
          const currentTime = youtubePlayerService.getCurrentTime();
          const duration = youtubePlayerService.getDuration();
          
          setMusicState(prev => ({
            ...prev,
            currentTime,
            duration
          }));
        }
      }, 1000);
    };
    
    const stopTimeUpdate = () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };

    initializeYouTubePlayer();
    loadTrendingVideos();
    loadCategories();

    return () => {
      stopTimeUpdate();
    };
  }, []);

  const searchVideos = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await youtubeDataService.searchVideos(query);
      const videos = Array.isArray(results) ? results : results.videos || [];
      setSearchResults(videos);
      
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = async () => {
    if (!nextPageToken || !searchQuery) return;
    
    try {
      const results = await youtubeDataService.searchVideos(searchQuery);
      const videos = Array.isArray(results) ? results : results.videos || [];
      setSearchResults(prev => [...prev, ...videos]);
      setNextPageToken(results.nextPageToken);
    } catch (error) {
      console.error('Error loading more results:', error);
    }
  };

  const loadCategoryVideos = async (categoryId: string) => {
    try {
      const videos = await youtubeDataService.getVideosByCategory(categoryId);
      setSearchResults(videos);
    } catch (error) {
      console.error('Error loading category videos:', error);
    }
  };

  const getSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      const suggestions = await youtubeDataService.getSearchSuggestions(query);
      setSuggestions(suggestions.slice(0, 5));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  const playTrack = (track: Track) => {
    setMusicState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true
    }));

    if (track.sourceType === 'youtube' && track.sourceId) {
      youtubePlayerService.loadVideo(track.sourceId);
    }
  };

  const playVideo = (video: YouTubeVideo) => {
    const track: Track = {
      id: video.id,
      title: video.title,
      artist: video.channelTitle,
      duration: 0,
      sourceType: 'youtube',
      sourceId: video.id,
    };
    
    setMusicState(prev => ({
      ...prev,
      currentTrack: track,
      currentVideo: video,
      isPlaying: true,
      currentTime: 0
    }));

    youtubePlayerService.loadVideo(video.id);
    
    youtubePlayerService.onReady(() => {
      const duration = youtubePlayerService.getDuration();
      setMusicState(prev => ({
        ...prev,
        duration
      }));
    });
  };

  const pauseMusic = () => {
    youtubePlayerService.pause();
    setMusicState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumeMusic = () => {
    youtubePlayerService.play();
    setMusicState(prev => ({ ...prev, isPlaying: true }));
  };

  const nextTrack = () => {
    const { playlist, currentIndex } = musicState;
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextTrack = playlist[nextIndex];
      setMusicState(prev => ({ ...prev, currentIndex: nextIndex }));
      playTrack(nextTrack);
    }
  };

  const previousTrack = () => {
    const { playlist, currentIndex } = musicState;
    if (playlist.length > 0) {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      const prevTrack = playlist[prevIndex];
      setMusicState(prev => ({ ...prev, currentIndex: prevIndex }));
      playTrack(prevTrack);
    }
  };

  const seekTo = (time: number) => {
    youtubePlayerService.seekTo(time);
    setMusicState(prev => ({ ...prev, currentTime: time }));
  };

  const setVolume = (volume: number) => {
    youtubePlayerService.setVolume(volume);
    setMusicState(prev => ({ ...prev, volume }));
  };

  const handlePlayPause = () => {
    if (musicState.isPlaying) {
      pauseMusic();
    } else {
      resumeMusic();
    }
  };

  const handleVolumeChange = (volume: number) => {
    setVolume(volume);
  };

  const handleSeek = (time: number) => {
    seekTo(time);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
  };

  const loadTrendingVideos = async () => {
    try {
      const videos = await youtubeDataService.getTrendingVideos();
      setTrendingVideos(videos);
    } catch (error) {
      console.error('Failed to load trending videos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await youtubeDataService.getVideoCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const value: MusicContextType = {
    musicState,
    searchQuery,
    searchResults,
    searchSuggestions,
    searchHistory,
    trendingVideos,
    categories,
    suggestions,
    isSearching,
    setSearchQuery,
    searchVideos,
    loadMoreResults,
    loadCategoryVideos,
    getSuggestions,
    playTrack,
    playVideo,
    handlePlayPause,
    handleVolumeChange,
    handleSeek,
    pauseMusic,
    resumeMusic,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    clearSearch,
    loadTrendingVideos,
    loadCategories
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <div id="youtube-player" style={{ display: 'none' }} />
    </MusicContext.Provider>
  );
};