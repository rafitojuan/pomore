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
  const { musicState } = useMusicContext();

  return (
    <div className={`min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white antialiased ${theme}`}>
      <Navigation />

      <main
        className={`flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 ${
          musicState.currentTrack || musicState.currentVideo ? "pb-32" : "pb-12"
        }`}
      >
        {children}
      </main>

      {(musicState.currentTrack || musicState.currentVideo) && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <MiniPlayer />
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Pomore — Focus & Sound. Crafted with care.</p>
      </footer>

      <div
        id="youtube-player"
        className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-px w-px opacity-0 overflow-hidden"
        aria-hidden="true"
      />
    </div>
  );
};
