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
    onError?: (message: string) => void;
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
        this.notifyError(`Failed to play track: ${track.title}`);
      });
    } else if (track.sourceType === 'youtube' && track.sourceUrl) {
      const videoId = this.extractYouTubeVideoId(track.sourceUrl);
      if (videoId) {
        this.playYouTubeTrack(videoId, track);
      } else {
        this.notifyError('Invalid YouTube URL');
      }
    } else if (track.sourceType === 'soundcloud' && track.sourceUrl) {
      this.playSoundCloudTrack(track.sourceUrl, track);
    }

    this.notifyStateChange();
  }

  private extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }



  private playYouTubeTrack(videoId: string, track: Track): void {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    this.createEmbedPlayer(embedUrl, track);
  }

  private playSoundCloudTrack(url: string, track: Track): void {
    const encodedUrl = encodeURIComponent(url);
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    this.createEmbedPlayer(embedUrl, track);
  }

  private createEmbedPlayer(embedUrl: string, track: Track): void {
    const existingPlayer = document.getElementById('music-embed-player');
    if (existingPlayer) {
      existingPlayer.remove();
    }

    const container = document.createElement('div');
    container.id = 'music-embed-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 200px;
      z-index: 1000;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      background: #1a1a1a;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1001;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.onclick = () => {
      this.stop();
    };

    const iframe = document.createElement('iframe');
    iframe.id = 'music-embed-player';
    iframe.src = embedUrl;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    iframe.allow = 'autoplay';
    iframe.setAttribute('frameborder', '0');

    container.appendChild(closeButton);
    container.appendChild(iframe);
    document.body.appendChild(container);

    this.state.isPlaying = true;
    this.notifyStateChange();
  }

  play(): void {
    if (this.state.currentTrack?.sourceType === 'local' && this.audioElement) {
      this.audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } else if (this.state.currentTrack?.sourceType === 'youtube' || this.state.currentTrack?.sourceType === 'soundcloud') {
      const iframe = document.getElementById('music-embed-player') as HTMLIFrameElement;
      if (iframe) {
        this.state.isPlaying = true;
        this.notifyStateChange();
      }
    }
  }

  pause(): void {
    if (this.state.currentTrack?.sourceType === 'local' && this.audioElement) {
      this.audioElement.pause();
    } else if (this.state.currentTrack?.sourceType === 'youtube' || this.state.currentTrack?.sourceType === 'soundcloud') {
      this.state.isPlaying = false;
      this.notifyStateChange();
    }
  }

  stop(): void {
    if (this.state.currentTrack?.sourceType === 'local' && this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    
    const embedContainer = document.getElementById('music-embed-container');
    if (embedContainer) {
      embedContainer.remove();
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
    onError?: (message: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  private notifyError(message: string): void {
    this.callbacks.onError?.(message);
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
    
    const embedContainer = document.getElementById('music-embed-container');
     if (embedContainer) {
       embedContainer.remove();
     }
  }
}

export const musicService = new MusicService();