import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  title: string;
  children: string | undefined;
  /** When true, children is rendered via MarkdownRenderer; otherwise shown as preformatted text. */
  markdown?: boolean;
}

/**
 * Labeled content block used inside modals (e.g. input, output, ground truth sections).
 */
export function Section({ title, children, markdown }: Props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 className="h">{title}</h3>
      {markdown ? (
        <MarkdownRenderer text={children} />
      ) : (
        <div
          style={{
            fontFamily: 'var(--serif)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            fontSize: 13.5,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
