import type { ReactNode } from 'react';

interface Props {
  title: string;
  sectionKey: string;
  isCollapsed: (key: string) => boolean;
  onToggle: (key: string) => void;
  count?: number;
  badge?: string;
  maxHeight?: number;
  children: ReactNode;
}

/**
 * Generic collapsible sidebar group. The header click toggles open/closed
 * via the controlled `isCollapsed` + `onToggle` callbacks (typically from
 * useCollapsibleSections).
 */
export function SidebarSection({
  title,
  sectionKey,
  isCollapsed,
  onToggle,
  count,
  badge,
  maxHeight = 400,
  children,
}: Props) {
  const collapsed = isCollapsed(sectionKey);
  return (
    <div className="sb-group">
      <h3 className="h" onClick={() => onToggle(sectionKey)}>
        <span>{title}</span>
        {count !== undefined && (
          <span className="pill" style={{ marginLeft: 4 }}>
            {count}
          </span>
        )}
        {badge && <span className="pill">{badge}</span>}
        <span className="sb-section-toggle" style={{ marginLeft: 'auto' }}>
          {collapsed ? '▸' : '▾'}
        </span>
      </h3>
      <div
        className={'sb-section-body' + (collapsed ? ' collapsed' : '')}
        style={{ maxHeight: collapsed ? 0 : maxHeight }}
      >
        {children}
      </div>
    </div>
  );
}
