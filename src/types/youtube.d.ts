declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: {
        height?: string | number;
        width?: string | number;
        videoId?: string;
        playerVars?: {
          autoplay?: 0 | 1;
          controls?: 0 | 1;
          disablekb?: 0 | 1;
          enablejsapi?: 0 | 1;
          fs?: 0 | 1;
          iv_load_policy?: 1 | 3;
          modestbranding?: 0 | 1;
          origin?: string;
          playsinline?: 0 | 1;
          rel?: 0 | 1;
          showinfo?: 0 | 1;
          cc_load_policy?: 0 | 1;
        };
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { target: YTPlayer; data: number }) => void;
        };
      }) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady?: () => void;
  }

  interface YTPlayer {
    loadVideoById(videoId: string): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    setVolume(volume: number): void;
    getVolume(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    destroy(): void;
  }
}

export {};