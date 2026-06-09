import { useMemo } from 'react';

/** Lightweight syntax-highlighted JSON, no dependencies. */
export function JsonViewer({ data }: { data: unknown }) {
  const html = useMemo(() => highlight(JSON.stringify(data, null, 2)), [data]);
  return (
    <pre className="scroll-thin overflow-auto rounded-lg border border-line bg-void p-4 font-mono text-[12px] leading-relaxed">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

const COLORS = {
  key: '#818cf8',
  string: '#86efac',
  number: '#fbbf24',
  bool: '#60a5fa',
  null: '#f87171',
  punc: '#5a5a68',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Token-based highlighter. Operates on already pretty-printed JSON.
 * Safe: all dynamic text is HTML-escaped before being wrapped in styled spans.
 */
function highlight(json: string): string {
  const tokenRegex =
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\bnull\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g;

  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(json)) !== null) {
    result += escapeHtml(json.slice(lastIndex, match.index));
    const [token, keyTok, strTok, boolTok, numTok, puncTok] = match;
    const safe = escapeHtml(token);

    if (keyTok) result += `<span style="color:${COLORS.key}">${safe}</span>`;
    else if (strTok) result += `<span style="color:${COLORS.string}">${safe}</span>`;
    else if (boolTok) result += `<span style="color:${COLORS.bool}">${safe}</span>`;
    else if (numTok) result += `<span style="color:${COLORS.number}">${safe}</span>`;
    else if (puncTok) result += `<span style="color:${COLORS.punc}">${safe}</span>`;
    else result += `<span style="color:${COLORS.null}">${safe}</span>`; // null

    lastIndex = tokenRegex.lastIndex;
  }
  result += escapeHtml(json.slice(lastIndex));
  return result;
}
