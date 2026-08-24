import { useEffect, useState } from 'react';

export function useTheme(initialIsDark = true) {
  const [isDarkMode, setIsDarkMode] = useState(initialIsDark);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode];
}
