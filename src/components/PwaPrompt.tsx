import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';

export const PwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileDevice = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');

    if (!isMobileDevice || isStandalone || isDismissed) return;

    setIsIOS(/iphone|ipad|ipod/i.test(userAgent.toLowerCase()));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowToast(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (/iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
      setShowToast(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowModal(false);
        setShowToast(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToast(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      <AnimatePresence>
        {showToast && !showModal && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={() => setShowModal(true)}
            className="md:hidden fixed bottom-20 left-4 right-4 z-40 p-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl border border-zinc-700 dark:border-zinc-300 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Install Pomore App</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600">Akses cepat & audio fullscreen</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-emerald-400 dark:text-emerald-600">Buka</span>
              <button
                onClick={handleDismiss}
                className="p-1 text-zinc-400 hover:text-white dark:hover:text-zinc-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                    P
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Download Pomore</h3>
                    <p className="text-[11px] text-zinc-500">PWA Mobile Experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <p className="text-zinc-500">Untuk menginstall di iOS Safari:</p>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <Share className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1. Tekan tombol <strong>Share</strong> di bar bawah browser.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <PlusSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>2. Scroll ke bawah dan pilih <strong>Add to Home Screen</strong>.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Install Pomore ke layar utama untuk pengalaman timer & background audio.
                  </p>
                  <Button
                    onClick={handleInstallClick}
                    className="w-full justify-center gap-2 py-2 text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Install Sekarang
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
