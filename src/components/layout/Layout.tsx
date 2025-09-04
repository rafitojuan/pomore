import React from "react";
import { Navigation } from "./Navigation";
import { MiniPlayer } from "../MiniPlayer";
import { useMusicContext } from "../../contexts/MusicContext";
import { useTheme } from "../../hooks/useTheme";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const {
    musicState,
    pauseMusic,
    resumeMusic,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
  } = useMusicContext();

  return (
    <div
      className={`min-h-screen relative overflow-hidden theme-bg-primary ${theme}`}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.03%27%3E%3Ccircle cx=%2730%27 cy=%2730%27 r=%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      />

      <div className="absolute top-0 left-0 w-96 h-96 theme-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 theme-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 theme-accent/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />

        <main
          className={`flex-1 container mx-auto px-4 py-8 ${
            musicState.currentTrack ? "pb-32" : ""
          }`}
        >
          {children}
        </main>

        {(musicState.currentTrack || musicState.currentVideo) && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
            <MiniPlayer />
          </div>
        )}

        <footer className="border-t theme-border backdrop-blur-md theme-bg-secondary py-6">
          <div className="container mx-auto px-4 text-center theme-text-secondary">
            <p>
              &copy; 2025 Pomore - Pomodoro Timer with Music. Made by rafitojuan
              💓
            </p>
          </div>
        </footer>

        <div id="youtube-player" style={{ display: "none" }}></div>
      </div>
    </div>
  );
};
