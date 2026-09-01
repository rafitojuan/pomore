import { useState, useEffect } from 'react';

export type Theme = 'default' | 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['default', 'light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'default';
  });

  const applyThemeToDOM = (t: Theme) => {
    document.documentElement.classList.remove('default', 'light', 'dark');
    document.documentElement.classList.add(t);

    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  };

  useEffect(() => {
    applyThemeToDOM(theme);

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme && customEvent.detail.theme !== theme) {
        setThemeState(customEvent.detail.theme);
      }
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    window.dispatchEvent(
      new CustomEvent('themeChanged', { detail: { theme: newTheme } })
    );
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['default', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isDefault: theme === 'default'
  };
}
