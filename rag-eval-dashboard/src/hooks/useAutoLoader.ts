import { useEffect, useRef } from 'react';

// Lazy glob: each JSON file becomes its own chunk, loaded after the page shell renders.
// Vite resolves the module graph at build time so this works on Vercel without filesystem access.
const dataModules = import.meta.glob('../../../data/*.json', { query: '?raw', import: 'default' });

export function useAutoLoader(onPickFiles: (fs: File[]) => Promise<void>) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const loadAll = async () => {
      const files = await Promise.all(
        Object.entries(dataModules).map(async ([filePath, load]) => {
          const content = await (load as () => Promise<string>)();
          const name = filePath.split('/').pop()!;
          return new File([content], name, { type: 'application/json' });
        })
      );
      await onPickFiles(files);
    };

    void loadAll();
  }, [onPickFiles]);
}
