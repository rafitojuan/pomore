import { useState, useEffect } from 'react';

type Theme = 'default' | 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['default', 'light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'default';
  });

  useEffect(() => {
    document.documentElement.classList.remove('default', 'light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail.theme;
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    };
    
    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, [theme]);

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['default', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return {
    theme,
    setTheme: setThemeMode,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isDefault: theme === 'default'
  };
}