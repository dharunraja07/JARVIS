import { useEffect } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useJarvisStore();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
