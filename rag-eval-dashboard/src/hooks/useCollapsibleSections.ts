import { useCallback, useState } from 'react';

/** Tracks which sidebar sections are collapsed by section-key string. */
export function useCollapsibleSections(): {
  collapsed: Set<string>;
  isCollapsed: (key: string) => boolean;
  toggle: (key: string) => void;
  collapse: (key: string) => void;
} {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = useCallback((key: string) => {
    setCollapsed(p => {
      const n = new Set(p);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }, []);

  const collapse = useCallback((key: string) => {
    setCollapsed(p => (p.has(key) ? p : new Set([...p, key])));
  }, []);

  return {
    collapsed,
    isCollapsed: (key: string) => collapsed.has(key),
    toggle,
    collapse,
  };
}
