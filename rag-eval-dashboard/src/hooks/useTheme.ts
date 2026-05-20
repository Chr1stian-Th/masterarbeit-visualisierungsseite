import { useEffect, useState } from 'react';

/**
 * Sync a dark-mode boolean with `document.documentElement.dataset.theme`.
 * Initial value is read from the dataset attribute that the inline script
 * in `index.html` sets before first paint (so there's no flash).
 */
export function useTheme(): {
  darkMode: boolean;
  toggle: () => void;
} {
  const [darkMode, setDarkMode] = useState<boolean>(
    () => document.documentElement.dataset.theme === 'dark'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return {
    darkMode,
    toggle: () => setDarkMode(d => !d),
  };
}
