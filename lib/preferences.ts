// Explicit feedback adjusts a separate, bounded weight; it never rewrites a reader's rating.
export const PREFERENCE_LIMITS = { interests: 100, sources: 40, reviews: 500, feedbackDays: 60, votesPerStep: 3, maxAdjustment: 1 } as const;
export const REVIEW_STORAGE = 'nerdygent-reviews-v1';
export const REVIEW_EDITION_STORAGE = 'nerdygent-review-edition-v1';
export type Perspective = 'left' | 'center' | 'right' | 'unrated';
export type Coverage = Record<'local' | 'national' | 'world', { enabled: boolean; weight: number }>;
export type ReaderSource = { id: string; name: string; url: string; kind: 'website' | 'rss' | 'reddit' | 'newsletter'; perspective: Perspective; access: 'public' | 'subscriber'; preference: 'prefer' | 'allow' | 'exclude' };
export type ReviewSignal = 'more' | 'less' | 'too-dry' | 'repeat' | 'source-concern';
export type Review = { id: string; editionKey: string; articleId: string; headline: string; signal: ReviewSignal; interestId: string; createdAt: string };
export type InterestFields = { id?: string; parentId?: string; enabled?: boolean; expiresOn?: string; ratingSetAt?: string };
export type RatedInterest = InterestFields & { name: string; rating: number; cadence: string; keywords: string; combines: string };
export type Preferences = {
  schemaVersion: 2; country: string; frequency: 'daily' | 'weekly'; weeklyDay: number;
  coverage: Coverage; sources: ReaderSource[]; perspectives: Record<Perspective, number>;
  feedbackMode: 'suggest' | 'automatic' | 'off'; discovery: 'familiar' | 'balanced' | 'adventurous';
  voice: 'balanced' | 'lively' | 'concise'; voiceSetAt: string;
};
export const preferenceDefaults: Preferences = {
  schemaVersion: 2, country: '', frequency: 'daily', weeklyDay: 0,
  coverage: { local: { enabled: true, weight: 3 }, national: { enabled: true, weight: 3 }, world: { enabled: true, weight: 2 } },
  sources: [], perspectives: { left: 3, center: 3, right: 3, unrated: 3 },
  feedbackMode: 'suggest', discovery: 'balanced', voice: 'balanced', voiceSetAt: '',
};
export const ratingNames = ['Off', 'Passing interest', 'Occasional', 'Interested', 'Very interested', 'A favorite'];
const object = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const clean = (v: unknown, max: number) => typeof v === 'string' ? v.slice(0, max) : '';
function timestamp(v: unknown) { if (!v) return ''; if (typeof v !== 'string' || !Number.isFinite(Date.parse(v))) throw Error('A saved preference has an invalid change timestamp.'); return new Date(v).toISOString(); }
const number = (v: unknown, min: number, max: number, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
const choice = <T extends string>(v: unknown, values: readonly T[], fallback: T): T => values.includes(v as T) ? v as T : fallback;
export function validDay(v: string) { return /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v; }
export function newId(prefix = 'interest') { return `${prefix}-${globalThis.crypto.randomUUID()}`; }
export function normalizeInterests(value: unknown): RatedInterest[] {
  if (!Array.isArray(value)) return [];
  if (value.length > PREFERENCE_LIMITS.interests) throw Error(`A profile can hold up to ${PREFERENCE_LIMITS.interests} interests.`);
  const ids = new Set<string>();
  const result = value.map((v, i) => {
    const x = object(v); let id = clean(x.id, 100) || `legacy-${i}`;
    if (ids.has(id)) throw Error('Two interests have the same ID. Import a profile with unique interest IDs.');
    ids.add(id);
    const expiresOn = clean(x.expiresOn, 10);
    if (expiresOn && !validDay(expiresOn)) throw Error('A temporary interest needs a valid end date.');
    return { id, name: clean(x.name, 100), rating: number(x.rating, 1, 5, 3), cadence: choice(x.cadence, ['daily', 'weekly', 'event', 'rare'], 'event'), keywords: clean(x.keywords, 400), combines: clean(x.combines, 200), parentId: clean(x.parentId, 100), enabled: x.enabled !== false, expiresOn, ratingSetAt: timestamp(x.ratingSetAt) };
  });
  for (const it of result) {
    if (it.parentId && !ids.has(it.parentId)) throw Error(`The parent interest for “${it.name}” is missing.`);
    const seen = new Set([it.id]); let parent = it.parentId;
    while (parent) { if (seen.has(parent)) throw Error('An interest cannot be its own ancestor.'); seen.add(parent); parent = result.find(x => x.id === parent)?.parentId || ''; }
  }
  return result;
}
// Only public source addresses belong in copied prompts. Query/fragment credentials are not accepted.
export function publicSourceUrl(value: string): string | null {
  try { const u = new URL(value); if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash) return null; return u.href; } catch { return null; }
}
export function normalizePreferences(value: unknown): Preferences {
  const d = object(value); const coverage = object(d.coverage); const perspectives = object(d.perspectives);
  if (Array.isArray(d.sources) && d.sources.length > PREFERENCE_LIMITS.sources) throw Error(`Choose up to ${PREFERENCE_LIMITS.sources} sources.`);
  const sources = (Array.isArray(d.sources) ? d.sources : []).map((v, i): ReaderSource => {
    const s = object(v); const url = clean(s.url, 2048);
    if (url && !publicSourceUrl(url)) throw Error('Use a public HTTPS source address without query parameters, fragments or passwords. Keep private feed keys in the local companion.');
    return { id: clean(s.id, 100) || `source-${i}`, name: clean(s.name, 120), url, kind: choice(s.kind, ['website', 'rss', 'reddit', 'newsletter'], 'website'), perspective: choice(s.perspective, ['left', 'center', 'right', 'unrated'], 'unrated'), access: choice(s.access, ['public', 'subscriber'], 'public'), preference: choice(s.preference, ['prefer', 'allow', 'exclude'], 'allow') };
  });
  if (new Set(sources.map(s => s.id)).size !== sources.length) throw Error('Source IDs must be unique.');
  return {
    schemaVersion: 2, country: clean(d.country, 100), frequency: choice(d.frequency, ['daily', 'weekly'], 'daily'), weeklyDay: number(d.weeklyDay, 0, 6, 0),
    coverage: Object.fromEntries((['local', 'national', 'world'] as const).map(k => { const c = object(coverage[k]); return [k, { enabled: c.enabled !== false, weight: number(c.weight, 1, 5, preferenceDefaults.coverage[k].weight) }]; })) as Coverage,
    sources, perspectives: Object.fromEntries((['left', 'center', 'right', 'unrated'] as const).map(k => [k, number(perspectives[k], 0, 5, 3)])) as Preferences['perspectives'],
    feedbackMode: choice(d.feedbackMode, ['suggest', 'automatic', 'off'], 'suggest'), discovery: choice(d.discovery, ['familiar', 'balanced', 'adventurous'], 'balanced'),
    voice: choice(d.voice, ['balanced', 'lively', 'concise'], 'balanced'), voiceSetAt: timestamp(d.voiceSetAt),
  };
}
export function interestActive(it: RatedInterest, all: RatedInterest[], day: string): boolean {
  const seen = new Set<string>(); let current: RatedInterest | undefined = it;
  while (current) {
    if (current.enabled === false || (current.expiresOn && current.expiresOn < day) || (current.id && seen.has(current.id))) return false;
    if (current.id) seen.add(current.id);
    if (!current.parentId) return true;
    current = all.find(x => x.id === current?.parentId);
    if (!current) return false;
  }
  return true;
}
export function interestPath(it: RatedInterest, all: RatedInterest[]): string {
  const parts = [it.name]; const seen = new Set([it.id]); let parent = it.parentId;
  while (parent && !seen.has(parent)) { seen.add(parent); const p = all.find(x => x.id === parent); if (!p) break; parts.unshift(p.name); parent = p.parentId; }
  return parts.filter(Boolean).join(' › ');
}
export function normalizeReviews(value: unknown): Review[] {
  if (!Array.isArray(value)) return [];
  const results: Review[] = [];
  for (const v of value.slice(-PREFERENCE_LIMITS.reviews)) {
    const x = object(v); const signal = choice(x.signal, ['more', 'less', 'too-dry', 'repeat', 'source-concern'], 'repeat');
    if (!['more', 'less', 'too-dry', 'repeat', 'source-concern'].includes(String(x.signal))) continue;
    if (!x.id || !x.editionKey || !x.articleId || !Number.isFinite(Date.parse(String(x.createdAt)))) continue;
    const row = { id: clean(x.id, 100), editionKey: clean(x.editionKey, 250), articleId: clean(x.articleId, 100), headline: clean(x.headline, 300), signal, interestId: clean(x.interestId, 100), createdAt: clean(x.createdAt, 40) };
    if ((signal === 'more' || signal === 'less') && !row.interestId) continue;
    results.push(row);
  }
  // The latest explicit vote for a story/topic wins, including re-imports of the same review.
  const latest = new Map<string, Review>();
  for (const r of results) { const key = reviewKey(r); const prev = latest.get(key); if (!prev || Date.parse(prev.createdAt) <= Date.parse(r.createdAt)) latest.set(key, r); }
  return [...latest.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-PREFERENCE_LIMITS.reviews);
}
function reviewKey(r: Review) { return JSON.stringify([r.editionKey, r.articleId, ['more', 'less'].includes(r.signal) ? `topic:${r.interestId}` : r.signal]); }
export function addReview(reviews: Review[], review: Review) { return normalizeReviews([...reviews.filter(r => reviewKey(r) !== reviewKey(review)), review]); }
export function effectiveInterest(it: RatedInterest, all: RatedInterest[], reviews: Review[], mode: Preferences['feedbackMode'], now = new Date()) {
  const recent = normalizeReviews(reviews).filter(r => r.interestId === it.id && ['more', 'less'].includes(r.signal) && Date.parse(r.createdAt) <= now.getTime() && now.getTime() - Date.parse(r.createdAt) < PREFERENCE_LIMITS.feedbackDays * 86400000 && (!it.ratingSetAt || Date.parse(r.createdAt) > Date.parse(it.ratingSetAt)));
  const net = recent.reduce((n, r) => n + (r.signal === 'more' ? 1 : -1), 0);
  const adjustment = Math.max(-PREFERENCE_LIMITS.maxAdjustment, Math.min(PREFERENCE_LIMITS.maxAdjustment, Math.trunc(net / PREFERENCE_LIMITS.votesPerStep)));
  const suggested = Math.max(1, Math.min(5, it.rating + adjustment));
  return { base: it.rating, suggested, effective: mode === 'automatic' ? suggested : it.rating, adjustment: suggested - it.rating, votes: recent.length, net, path: interestPath(it, all) };
}
export function feedbackSummary(reviews: Review[], now = new Date(), since = '') {
  const rows = normalizeReviews(reviews).filter(r => Date.parse(r.createdAt) <= now.getTime() && now.getTime() - Date.parse(r.createdAt) < PREFERENCE_LIMITS.feedbackDays * 86400000 && (!since || Date.parse(r.createdAt) > Date.parse(since)));
  return { too_dry: rows.filter(r => r.signal === 'too-dry').length, repeats: rows.filter(r => r.signal === 'repeat').length, source_concerns: rows.filter(r => r.signal === 'source-concern').length };
}
export function editionPeriod(frequency: 'daily' | 'weekly', date: string) {
  if (!validDay(date)) throw Error('Choose a valid edition date.');
  const days = frequency === 'weekly' ? 7 : 2;
  return { end: date, start: new Date(Date.parse(date) - (days - 1) * 86400000).toISOString().slice(0, 10) };
}
