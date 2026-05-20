/* Tiny dependency-free Markdown subset:
   - headings (# … ####), unordered & ordered lists, paragraphs
   - hr, blockquote, fenced (not yet — see TODO), inline code, mark
   - bold/italic/bold-italic, GFM-ish pipe tables */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function inlineMd(t: string): string {
  return t
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>');
}

export function markdownToHtml(text: string | undefined | null): string {
  if (!text) return '';
  const lines = text.split('\n');

  let html = '';
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableRows: string[][] = [];

  const endLists = (): void => {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
  };

  const flushTable = (): void => {
    if (!tableRows.length) { inTable = false; return; }
    html += '<table class="md-table"><thead><tr>';
    tableRows[0]!.forEach(c => { html += `<th>${inlineMd(esc(c.trim()))}</th>`; });
    html += '</tr></thead><tbody>';
    let start = 1;
    if (tableRows.length > 1 && tableRows[1]!.every(c => /^[-: ]+$/.test(c.trim()))) start = 2;
    for (let i = start; i < tableRows.length; i++) {
      html += '<tr>';
      tableRows[i]!.forEach(c => { html += `<td>${inlineMd(esc(c.trim()))}</td>`; });
      html += '</tr>';
    }
    html += '</tbody></table>';
    tableRows = [];
    inTable = false;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    // Table row
    if (trimmed.startsWith('|')) {
      if (!inTable) { endLists(); inTable = true; }
      const cells = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|');
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    const e = esc(raw);

    if (/^#{1,4} /.test(raw)) {
      endLists();
      const n = raw.match(/^(#+)/)![1].length;
      const tag = n <= 2 ? 'h2' : n === 3 ? 'h3' : 'h4';
      html += `<${tag}>${inlineMd(e.replace(/^#+\s/, ''))}</${tag}>`;
      continue;
    }
    if (/^[-*•] /.test(raw)) {
      if (inOl) { html += '</ol>'; inOl = false; }
      if (!inUl) { html += '<ul>'; inUl = true; }
      html += `<li>${inlineMd(e.replace(/^[-*•] /, ''))}</li>`;
      continue;
    }
    if (/^\d+\. /.test(raw)) {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (!inOl) { html += '<ol>'; inOl = true; }
      html += `<li>${inlineMd(e.replace(/^\d+\. /, ''))}</li>`;
      continue;
    }

    endLists();

    if (/^-{3,}$/.test(trimmed)) { html += '<hr class="md-hr"/>'; continue; }
    if (/^> /.test(raw)) {
      html += `<blockquote class="md-bq">${inlineMd(e.replace(/^&gt; /, ''))}</blockquote>`;
      continue;
    }
    if (trimmed === '') { html += '<br/>'; continue; }
    html += `<p>${inlineMd(e)}</p>`;
  }

  if (inTable) flushTable();
  if (inUl) html += '</ul>';
  if (inOl) html += '</ol>';
  return html;
}
