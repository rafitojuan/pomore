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
    <nav className="relative z-20 border-b border-white/10 backdrop-blur-md bg-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Timer className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
              Pomore
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2
                      ${isActive 
                        ? 'bg-violet-600/30 text-white border border-violet-500/50' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-lg"
                        layoutId="activeTab"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-violet-600/30 text-white border border-violet-500/50' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};