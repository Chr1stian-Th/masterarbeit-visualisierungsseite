import { markdownToHtml } from '@/lib/markdown';

interface Props {
  text: string | undefined | null;
  className?: string;
}

export function MarkdownRenderer({ text, className }: Props) {
  if (!text) return null;
  return (
    <div
      className={'md-output ' + (className || '')}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
    />
  );
}
