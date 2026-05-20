import { useEffect, useRef } from 'react';

// Eagerly import all JSON files from the data folder (3 levels up from src/hooks/).
// Vite resolves these at build time, so they work on Vercel with no server-side filesystem access.
const dataModules = import.meta.glob('../../../data/*.json', { eager: true, query: '?raw', import: 'default' });

export function useAutoLoader(onPickFiles: (fs: File[]) => Promise<void>) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const files = Object.entries(dataModules).map(([filePath, content]) => {
      const name = filePath.split('/').pop()!;
      return new File([content as string], name, { type: 'application/json' });
    });

    if (files.length > 0) {
      void onPickFiles(files);
    }
  }, [onPickFiles]);
}
