import { markdownToHtml } from '@/lib/markdown';

interface Props {
  text: string | undefined | null;
  className?: string;
}

/**
 * Renders a Markdown string as sanitized HTML via the custom `markdownToHtml` parser.
 * Returns null when `text` is empty or undefined.
 */
export function MarkdownRenderer({ text, className }: Props) {
  if (!text) return null;
  return (
    <div
      className={'md-output ' + (className || '')}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
    />
  );
}
