class YouTubePlayerService {
  private player: any = null;
  private isReady = false;
  private currentVideoId: string | null = null;
  private onStateChangeCallback: ((state: string) => void) | null = null;
  private onReadyCallback: (() => void) | null = null;

  constructor() {
    this.loadYouTubeAPI();
  }

  private loadYouTubeAPI() {
    if (window.YT) {
      this.initializePlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      this.initializePlayer();
    };
  }

  private initializePlayer() {
    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
      setTimeout(() => this.initializePlayer(), 100);
      return;
    }

    this.player = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        cc_load_policy: 0,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          this.isReady = true;
          if (this.onReadyCallback) {
            this.onReadyCallback();
          }
        },
        onStateChange: (event: any) => {
          if (this.onStateChangeCallback) {
            let state = 'unknown';
            switch (event.data) {
              case window.YT.PlayerState.ENDED:
                state = 'ended';
                break;
              case window.YT.PlayerState.PLAYING:
                state = 'playing';
                break;
              case window.YT.PlayerState.PAUSED:
                state = 'paused';
                break;
              case window.YT.PlayerState.BUFFERING:
                state = 'buffering';
                break;
              case window.YT.PlayerState.CUED:
                state = 'cued';
                break;
            }
            this.onStateChangeCallback(state);
          }
        }
      }
    });
  }

  loadVideo(videoId: string) {
    if (!this.isReady || !this.player) {
      this.onReadyCallback = () => this.loadVideo(videoId);
      return;
    }

    this.currentVideoId = videoId;
    this.player.loadVideoById(videoId);
  }

  play() {
    if (this.isReady && this.player) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.isReady && this.player) {
      this.player.pauseVideo();
    }
  }

  stop() {
    if (this.isReady && this.player) {
      this.player.stopVideo();
    }
  }

  setVolume(volume: number) {
    if (this.isReady && this.player) {
      this.player.setVolume(volume * 100);
    }
  }

  getVolume(): number {
    if (this.isReady && this.player) {
      return this.player.getVolume() / 100;
    }
    return 0.5;
  }

  seekTo(seconds: number) {
    if (this.isReady && this.player) {
      this.player.seekTo(seconds);
    }
  }

  getCurrentTime(): number {
    if (this.isReady && this.player) {
      return this.player.getCurrentTime();
    }
    return 0;
  }

  getDuration(): number {
    if (this.isReady && this.player) {
      return this.player.getDuration();
    }
    return 0;
  }

  getPlayerState(): string {
    if (!this.isReady || !this.player) {
      return 'unstarted';
    }

    const state = this.player.getPlayerState();
    switch (state) {
      case window.YT.PlayerState.ENDED:
        return 'ended';
      case window.YT.PlayerState.PLAYING:
        return 'playing';
      case window.YT.PlayerState.PAUSED:
        return 'paused';
      case window.YT.PlayerState.BUFFERING:
        return 'buffering';
      case window.YT.PlayerState.CUED:
        return 'cued';
      default:
        return 'unstarted';
    }
  }

  onStateChange(callback: (state: string) => void) {
    this.onStateChangeCallback = callback;
  }

  onReady(callback: () => void) {
    if (this.isReady) {
      callback();
    } else {
      this.onReadyCallback = callback;
    }
  }

  getCurrentVideoId(): string | null {
    return this.currentVideoId;
  }

  isPlayerReady(): boolean {
    return this.isReady;
  }
}

export const youtubePlayerService = new YouTubePlayerService();
export default youtubePlayerService;