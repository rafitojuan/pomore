import { Track, Playlist, MusicState, SourceType } from '../types';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '../utils';

class MusicService {
  private state: MusicState;
  private playlists: Playlist[] = [];
  private tracks: Track[] = [];
  private audioElement: HTMLAudioElement | null = null;
  private callbacks: {
    onStateChange?: (state: MusicState) => void;
    onPlaylistsChange?: (playlists: Playlist[]) => void;
    onTracksChange?: (tracks: Track[]) => void;
  } = {};

  constructor() {
    this.state = {
      isPlaying: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0
    };

    this.loadData();
    this.initializeAudio();
  }

  private loadData(): void {
    this.playlists = loadFromLocalStorage('playlists', []);
    this.tracks = loadFromLocalStorage('tracks', []);
  }

  private saveData(): void {
    saveToLocalStorage('playlists', this.playlists);
    saveToLocalStorage('tracks', this.tracks);
  }

  private initializeAudio(): void {
    this.audioElement = new Audio();
    this.audioElement.volume = this.state.volume;

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.state.duration = this.audioElement?.duration || 0;
      this.notifyStateChange();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audioElement?.currentTime || 0;
      this.notifyStateChange();
    });

    this.audioElement.addEventListener('ended', () => {
      this.next();
    });

    this.audioElement.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.notifyStateChange();
    });

    this.audioElement.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notifyStateChange();
    });
  }

  createPlaylist(name: string, description?: string): Playlist {
    const playlist: Playlist = {
      id: generateId(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      tracks: []
    };

    this.playlists.push(playlist);
    this.saveData();
    this.callbacks.onPlaylistsChange?.(this.playlists);
    return playlist;
  }

  deletePlaylist(playlistId: string): boolean {
    const playlistIndex = this.playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return false;

    this.tracks = this.tracks.filter(track => track.playlistId !== playlistId);
    this.playlists.splice(playlistIndex, 1);
    
    if (this.state.currentPlaylist?.id === playlistId) {
      this.stop();
      this.state.currentPlaylist = undefined;
      this.state.currentTrack = undefined;
    }

    this.saveData();
    this.callbacks.onPlaylistsChange?.(this.playlists);
    this.callbacks.onTracksChange?.(this.tracks);
    return true;
  }

  addTrack(playlistId: string, trackData: {
    title: string;
    artist?: string;
    sourceType: SourceType;
    sourceUrl?: string;
    duration?: number;
  }): Track {
    const playlistTracks = this.tracks.filter(t => t.playlistId === playlistId);
    const position = playlistTracks.length;

    const track: Track = {
      id: generateId(),
      playlistId: playlistId,
      title: trackData.title,
      artist: trackData.artist,
      sourceType: trackData.sourceType,
      sourceUrl: trackData.sourceUrl,
      duration: trackData.duration,
      position
    };

    this.tracks.push(track);
    this.saveData();
    this.callbacks.onTracksChange?.(this.tracks);
    return track;
  }

  removeTrack(trackId: string): boolean {
    const trackIndex = this.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) return false;

    const track = this.tracks[trackIndex];
    
    if (this.state.currentTrack?.id === trackId) {
      this.stop();
      this.state.currentTrack = undefined;
    }

    this.tracks.splice(trackIndex, 1);
    
    this.tracks
      .filter(t => t.playlistId === track.playlistId && t.position > track.position)
      .forEach(t => t.position--);

    this.saveData();
    this.callbacks.onTracksChange?.(this.tracks);
    return true;
  }

  playTrack(trackId: string): void {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track || !this.audioElement) return;

    const playlist = this.playlists.find(p => p.id === track.playlistId);
    
    this.state.currentTrack = track;
    this.state.currentPlaylist = playlist;

    if (track.sourceType === 'local' && track.sourceUrl) {
      this.audioElement.src = track.sourceUrl;
      this.audioElement.play().catch(error => {
        console.error('Error playing track:', error);
      });
    } else if (track.sourceType === 'youtube' && track.sourceUrl) {
      this.playYouTubeTrack(track.sourceUrl);
    }

    this.notifyStateChange();
  }

  private playYouTubeTrack(url: string): void {
    const videoId = this.extractYouTubeVideoId(url);
    if (videoId && this.audioElement) {
      const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
      this.audioElement.src = audioUrl;
      this.audioElement.play().catch(error => {
        console.error('Error playing YouTube track:', error);
      });
    }
  }

  private extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  play(): void {
    if (this.audioElement && this.state.currentTrack) {
      this.audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.notifyStateChange();
  }

  next(): void {
    if (!this.state.currentTrack || !this.state.currentPlaylist) return;

    const playlistTracks = this.getPlaylistTracks(this.state.currentPlaylist.id)
      .sort((a, b) => a.position - b.position);
    
    const currentIndex = playlistTracks.findIndex(t => t.id === this.state.currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlistTracks.length;
    
    this.playTrack(playlistTracks[nextIndex].id);
  }

  previous(): void {
    if (!this.state.currentTrack || !this.state.currentPlaylist) return;

    const playlistTracks = this.getPlaylistTracks(this.state.currentPlaylist.id)
      .sort((a, b) => a.position - b.position);
    
    const currentIndex = playlistTracks.findIndex(t => t.id === this.state.currentTrack?.id);
    const prevIndex = currentIndex === 0 ? playlistTracks.length - 1 : currentIndex - 1;
    
    this.playTrack(playlistTracks[prevIndex].id);
  }

  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.state.volume;
    }
    this.notifyStateChange();
  }

  seek(time: number): void {
    if (this.audioElement && this.state.currentTrack) {
      this.audioElement.currentTime = Math.max(0, Math.min(this.state.duration, time));
    }
  }

  getPlaylists(): Playlist[] {
    return [...this.playlists];
  }

  getPlaylistTracks(playlistId: string): Track[] {
    return this.tracks
      .filter(track => track.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);
  }

  getState(): MusicState {
    return { ...this.state };
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.state);
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: MusicState) => void;
    onPlaylistsChange?: (playlists: Playlist[]) => void;
    onTracksChange?: (tracks: Track[]) => void;
  }): void {
    this.callbacks = callbacks;
  }

  handleFileUpload(file: File, playlistId: string): Promise<Track> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      audio.addEventListener('loadedmetadata', () => {
        const track = this.addTrack(playlistId, {
          title: file.name.replace(/\.[^/.]+$/, ''),
          sourceType: 'local',
          sourceUrl: url,
          duration: audio.duration
        });
        resolve(track);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      });
    });
  }

  destroy(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
  }
}

export const musicService = new MusicService();