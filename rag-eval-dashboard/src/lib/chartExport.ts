export interface LegendItem {
  label: string;
  color: string;
}

/**
 * Build a self-contained SVG (title + chart + legend) and download it as a PNG.
 * Inlines `var(--...)` references against the current computed theme so dark
 * mode exports correctly.
 */
export function doExport(
  svgEl: SVGSVGElement | null,
  legendItems: LegendItem[],
  title: string
): void {
  if (!svgEl) return;

  const style = getComputedStyle(document.documentElement);
  const cv = (v: string): string => style.getPropertyValue(v).trim() || '';
  const BG = cv('--panel') || '#fdfbf5';
  const INK = cv('--ink') || '#1a1815';
  const INK3 = cv('--ink-3') || '#8a857b';
  const LINE = cv('--line') || '#d6d0bf';

  // Clone SVG and inline all var() references
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  function inlineVars(el: Element): void {
    for (const attr of ['fill', 'stroke', 'color', 'stop-color']) {
      const v = el.getAttribute(attr);
      if (v && v.includes('var(')) {
        el.setAttribute(attr, v.replace(/var\((--[^)]+)\)/g, (_, n: string) => cv(n) || v));
      }
    }
    const s = el.getAttribute('style');
    if (s && s.includes('var(')) {
      el.setAttribute('style', s.replace(/var\((--[^)]+)\)/g, (_, n: string) => cv(n) || ''));
    }
    for (const c of Array.from(el.children)) inlineVars(c);
  }
  inlineVars(clone);

  const chartW =
    svgEl.viewBox?.baseVal?.width ||
    svgEl.width.baseVal.value ||
    720;
  const chartH =
    svgEl.viewBox?.baseVal?.height ||
    svgEl.height.baseVal.value ||
    460;
  const pad = 24;
  const titleH = 46;
  const legCols = Math.min(legendItems.length, 4);
  const legRows = Math.ceil(legendItems.length / Math.max(1, legCols));
  const legH = legendItems.length > 0 ? legRows * 22 + 14 : 0;
  const totalW = chartW + pad * 2;
  const totalH = chartH + titleH + legH + pad * 2;

  // Legend entries
  const legItemW = chartW / Math.max(legCols, 1);
  const legSvg = legendItems
    .map((item, i) => {
      const col = i % legCols;
      const row = Math.floor(i / legCols);
      const x = pad + col * legItemW;
      const y = pad + titleH + chartH + pad + row * 22;
      const safeLabel = item.label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<rect x="${x}" y="${y + 1}" width="10" height="10" rx="1" fill="${item.color}"/>
        <text x="${x + 14}" y="${y + 10}" font-family="monospace" font-size="11" fill="${INK3}">${safeLabel}</text>`;
    })
    .join('\n');

  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Serialize inner chart content (strip outer <svg> wrapper to embed cleanly)
  const innerXml = new XMLSerializer()
    .serializeToString(clone)
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')
    .replace(/ xmlns(:[a-z]+)?="[^"]*"/g, '');

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
    <rect width="${totalW}" height="${totalH}" fill="${BG}" rx="2"/>
    <text x="${pad}" y="${pad + 20}" font-family="'Syne',sans-serif" font-size="14" font-weight="700" fill="${INK}">${safeTitle}</text>
    <text x="${totalW - pad}" y="${pad + 20}" font-family="monospace" font-size="10" fill="${INK3}" text-anchor="end">${dateStr}</text>
    <line x1="${pad}" x2="${totalW - pad}" y1="${pad + 28}" y2="${pad + 28}" stroke="${LINE}" stroke-width="1"/>
    <svg x="${pad}" y="${titleH + pad}" width="${chartW}" height="${chartH}">${innerXml}</svg>
    ${legSvg}
  </svg>`;

  const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = totalW * 2;
    canvas.height = totalH * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = `rag-eval-${new Date().toISOString().slice(0, 10)}.png`;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}
