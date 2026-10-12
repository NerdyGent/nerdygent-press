import {normalizeProfile,profileData,safeUrl,STORAGE,type Profile} from './press.ts';
import {editionPeriod,normalizeReviews,publicSourceUrl,REVIEW_STORAGE,type Review} from './preferences.ts';

export type CoverageRecord={date:string;headline:string;urls:string[]};
export type EngineJob={kind:'nerdygent-engine-job';version:1;date:string;profile:Profile;editorProfile:ReturnType<typeof profileData>;reviews:Review[];history:CoverageRecord[]};

// Mirrors the retained browser coverage history and engine/render/audit.py.
export const ENGINE_HISTORY_LIMIT=40;
function historyUrl(value:string):string|null{
  const safe=safeUrl(value);if(!safe)return null;
  const url=new URL(safe);url.hash='';
  for(const key of [...url.searchParams.keys()]){
    if(/^(token|access_token|api_key|apikey|key|auth|password|secret|signature|sig)$/i.test(key))return null;
    if(/^utm_|^(fbclid|gclid)$/.test(key))url.searchParams.delete(key);
  }
  return url.href;
}
export function engineJob(profile:Profile,reviews:Review[],date:string,history:unknown=[]):EngineJob{
  const p=normalizeProfile(profile);
  if(!p.profileId)throw Error('Save your profile on this device before exporting an engine job.');
  editionPeriod(p.frequency,date);
  if(p.coverage.local.enabled&&!p.place.trim())throw Error('Add a place for local news, or turn local coverage off.');
  if(p.coverage.national.enabled&&!p.country.trim())throw Error('Add a country for national news, or turn national coverage off.');
  if(!Object.values(p.perspectives).some(Boolean))throw Error('Enable at least one source perspective.');
  p.sources=p.sources.filter(s=>s.name.trim()&&s.url).map(s=>({...s,url:publicSourceUrl(s.url)!}));
  const rows=normalizeReviews(reviews);
  const coverage:CoverageRecord[]=[];
  for(const row of Array.isArray(history)?history:[]){
    if(!row||typeof row!=='object'||typeof row.date!=='string'||typeof row.headline!=='string'||!Array.isArray(row.urls))continue;
    try{editionPeriod('daily',row.date)}catch{continue}
    if(row.date>=date)continue;
    const urls=[...new Set<string>(row.urls.filter((u:unknown):u is string=>typeof u==='string').map((u:string)=>historyUrl(u)).filter((u:string|null):u is string=>!!u))];
    coverage.push({date:row.date,headline:row.headline.slice(0,300),urls});
  }
  return {kind:'nerdygent-engine-job',version:1,date,profile:p,editorProfile:profileData(p,rows,date),reviews:rows,history:coverage.slice(-ENGINE_HISTORY_LIMIT)};
}

// Read reviews and coverage at export time; never export a stale tab's profile.
export function savedEngineJob(storage:Pick<Storage,'getItem'>,draft:Profile,expectedRaw:string|null,date:string):EngineJob{
  const raw=storage.getItem(STORAGE);
  if(raw!==expectedRaw)throw Error('Your profile changed in another tab. Reload before exporting an engine job.');
  if(!raw)throw Error('Save your profile on this device before exporting an engine job.');
  const saved=normalizeProfile(JSON.parse(raw));
  if(JSON.stringify(saved)!==JSON.stringify(normalizeProfile(draft)))throw Error('Save your changes on this device, then export the engine job.');
  return engineJob(saved,normalizeReviews(JSON.parse(storage.getItem(REVIEW_STORAGE)||'[]')),date,JSON.parse(storage.getItem('nerdygent-history')||'[]'));
}
