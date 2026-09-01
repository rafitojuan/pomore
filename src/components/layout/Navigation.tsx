import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, CheckSquare, Music, Settings, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

const navItems = [
  { path: '/', label: 'Timer', icon: Timer },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/music', label: 'Music', icon: Music },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 transition-transform duration-200 group-hover:scale-105">
              {/* Bespoke Pomore mark: 25-min dial arc + focus aperture core */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="9" className="opacity-20" />
                <path d="M12 3a9 9 0 0 1 9 9" className="text-emerald-500 stroke-emerald-500" strokeWidth="2.5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                <path d="M12 7v2" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
              Pomore<span className="text-emerald-500">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`
                      relative px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-2
                      ${isActive
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                      }
                    `}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-1.5"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150
                      ${isActive
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </nav>
  );
};