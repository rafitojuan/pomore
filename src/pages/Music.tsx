import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Plus, Upload, Music as MusicIcon, List, Shuffle, Repeat, Heart, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { musicService } from '../services/musicService';
import { Track, Playlist, MusicState, SourceType } from '../types';
import { formatDuration, generateId } from '../utils';

export const Music: React.FC = () => {
  const [musicState, setMusicState] = useState<MusicState>(musicService.getState());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', url: '' });
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPlaylists();
    musicService.setCallbacks({
      onStateChange: (state) => {
        setMusicState(state);
        setCurrentTime(state.currentTime);
        setDuration(state.duration);
      }
    });
  }, []);

  const loadPlaylists = () => {
    setPlaylists(musicService.getPlaylists());
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    musicService.createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowAddPlaylist(false);
    loadPlaylists();
  };

  const handleAddTrack = () => {
    if (!newTrack.title.trim() || !selectedPlaylist) return;
    
    const sourceType: SourceType = newTrack.url.includes('youtube') || newTrack.url.includes('youtu.be') ? 'youtube' : 'local';
    
    musicService.addTrack(selectedPlaylist, {
      title: newTrack.title,
      artist: newTrack.artist || 'Unknown Artist',
      sourceType,
      sourceUrl: newTrack.url,
      duration: 0
    });
    
    setNewTrack({ title: '', artist: '', url: '' });
    setShowAddTrack(false);
    loadPlaylists();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedPlaylist) return;
    
    Array.from(files).forEach(file => {
      musicService.handleFileUpload(file, selectedPlaylist);
    });
    
    loadPlaylists();
  };

  const handlePlay = (track?: Track) => {
    if (track) {
      musicService.playTrack(track.id);
    } else {
      musicService.play();
    }
  };

  const handlePause = () => {
    musicService.pause();
  };

  const handleNext = () => {
    musicService.next();
  };

  const handlePrevious = () => {
    musicService.previous();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    musicService.setVolume(newVolume / 100);
  };

  const handleSeek = (time: number) => {
    musicService.seek(time);
  };

  const currentPlaylist = playlists.find(p => p.id === selectedPlaylist);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Music Player
          </h1>
          <p className="text-white/70">
            Focus with your favorite music while working
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button onClick={() => setShowAddPlaylist(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Playlist
          </Button>
          {selectedPlaylist && (
            <>
              <Button variant="ghost" onClick={() => setShowAddTrack(true)}>
                <MusicIcon className="w-4 h-4 mr-2" />
                Add Track
              </Button>
              <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="w-5 h-5 mr-2" />
                Playlists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playlists.map(playlist => (
                  <Button
                    key={playlist.id}
                    variant={selectedPlaylist === playlist.id ? 'primary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <MusicIcon className="w-4 h-4 mr-3" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-xs text-white/60">
                        {playlist.tracks.length} tracks
                      </div>
                    </div>
                  </Button>
                ))}
                
                {playlists.length === 0 && (
                  <div className="text-center text-white/40 py-8">
                    <MusicIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No playlists yet</p>
                    <p className="text-xs">Create your first playlist</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3 space-y-6"
        >
          {musicState.currentTrack && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MusicIcon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {musicState.currentTrack.title}
                    </h3>
                    <p className="text-white/70">{musicState.currentTrack.artist}</p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-white/60 mb-2">
                        <span>{formatDuration(currentTime)}</span>
                        <span>{formatDuration(duration)}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1 cursor-pointer"
                           onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const x = e.clientX - rect.left;
                             const percentage = x / rect.width;
                             handleSeek(percentage * duration);
                           }}>
                        <motion.div
                          className="bg-violet-500 h-1 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handlePrevious}>
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={musicState.isPlaying ? handlePause : () => handlePlay()}
                        size="lg"
                        className="w-12 h-12 rounded-full"
                      >
                        {musicState.isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm" onClick={handleNext}>
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentPlaylist ? (
            <Card>
              <CardHeader>
                <CardTitle>{currentPlaylist.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentPlaylist.tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${
                        musicState.currentTrack?.id === track.id ? 'bg-violet-500/20' : ''
                      }`}
                      onClick={() => handlePlay(track)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded flex items-center justify-center">
                        {musicState.currentTrack?.id === track.id && musicState.isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-white">{track.title}</div>
                        <div className="text-sm text-white/60">{track.artist}</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/60">
                          {track.duration > 0 ? formatDuration(track.duration) : '--:--'}
                        </span>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Heart className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {currentPlaylist.tracks.length === 0 && (
                    <div className="text-center text-white/40 py-12">
                      <MusicIcon className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg mb-2">No tracks in this playlist</p>
                      <p className="text-sm">Add some music to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MusicIcon className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Playlist</h3>
                <p className="text-white/60">Choose a playlist from the sidebar to start listening</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <AnimatePresence>
        {showAddPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPlaylist(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Create New Playlist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                  
                  <div className="flex space-x-3">
                    <Button onClick={handleCreatePlaylist} className="flex-1">
                      Create
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAddPlaylist(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddTrack(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Add Track</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Track title"
                    value={newTrack.title}
                    onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    placeholder="Artist name"
                    value={newTrack.artist}
                    onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  
                  <input
                    type="url"
                    placeholder="YouTube URL or streaming link"
                    value={newTrack.url}
                    onChange={(e) => setNewTrack({ ...newTrack, url: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  
                  <div className="flex space-x-3">
                    <Button onClick={handleAddTrack} className="flex-1">
                      Add Track
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAddTrack(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};