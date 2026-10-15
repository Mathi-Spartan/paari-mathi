// Tiny markdown helpers shared by server and client. Tamil letters are included in tag names.
const TAG_RE = /(^|\s)#([\p{L}\p{M}\p{N}_-]+)/gu;
const LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function extractTags(body: string) {
  const out = new Set<string>();
  for (const m of body.matchAll(TAG_RE)) out.add(m[2]);
  return [...out];
}

export function extractLinks(body: string) {
  const out = new Set<string>();
  for (const m of body.matchAll(LINK_RE)) out.add(m[1].trim());
  return [...out];
}

export function excerpt(body: string, n = 140) {
  return body
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(LINK_RE, (_m, a, b) => b || a)
    .replace(/[*_>`#-]|\[[ x]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, n);
}

export function wordCount(body: string) {
  return (body.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length;
}

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'italic'; v: string }
  | { t: 'code'; v: string }
  | { t: 'link'; target: string; label: string }
  | { t: 'tag'; v: string };

export function parseInline(s: string): Inline[] {
  const re = /(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(`[^`]+`)|(\[\[[^\]]+\]\])|((?:^|(?<=\s))#[\p{L}\p{M}\p{N}_-]+)/gu;
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: 'text', v: s.slice(last, i) });
    const tok = m[0];
    if (m[1]) out.push({ t: 'bold', v: tok.slice(2, -2) });
    else if (m[2]) out.push({ t: 'italic', v: tok.slice(1, -1) });
    else if (m[3]) out.push({ t: 'code', v: tok.slice(1, -1) });
    else if (m[4]) {
      const [target, label] = tok.slice(2, -2).split('|');
      out.push({ t: 'link', target: target.trim(), label: (label ?? target).trim() });
    } else if (m[5]) out.push({ t: 'tag', v: tok.trim().slice(1) });
    last = i + tok.length;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

export type Block =
  | { t: 'h'; level: number; text: string }
  | { t: 'p'; text: string }
  | { t: 'quote'; text: string }
  | { t: 'li'; text: string; line: number }
  | { t: 'task'; text: string; done: boolean; line: number }
  | { t: 'img'; src: string; alt: string }
  | { t: 'hr' }
  | { t: 'gap' };

export function parseBlocks(body: string): Block[] {
  const lines = body.split('\n');
  const out: Block[] = [];
  lines.forEach((raw, line) => {
    const l = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if (!l.trim()) { if (out.length && out[out.length - 1].t !== 'gap') out.push({ t: 'gap' }); return; }
    if ((m = l.match(/^(#{1,3})\s+(.*)$/))) return void out.push({ t: 'h', level: m[1].length, text: m[2] });
    if (/^(-{3,}|\*{3,})$/.test(l.trim())) return void out.push({ t: 'hr' });
    if ((m = l.match(/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/))) return void out.push({ t: 'task', done: m[1] !== ' ', text: m[2], line });
    if ((m = l.match(/^\s*[-*]\s+(.*)$/))) return void out.push({ t: 'li', text: m[1], line });
    if ((m = l.match(/^>\s?(.*)$/))) return void out.push({ t: 'quote', text: m[1] });
    if ((m = l.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/))) return void out.push({ t: 'img', alt: m[1], src: m[2] });
    out.push({ t: 'p', text: l });
  });
  return out;
}
