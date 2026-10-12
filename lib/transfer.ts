import {normalizeProfile,parseEdition,STORAGE,type Profile,type Edition} from './press.ts';
import {normalizeReviews,newId,effectiveInterest,REVIEW_STORAGE,REVIEW_EDITION_STORAGE,type Review} from './preferences.ts';
type ReaderStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type ReaderPacket={kind:'nerdygent-reader';version:2;profile:Profile;reviews:Review[];edition?:Edition};
export type ReviewPacket={kind:'nerdygent-reviews';version:1;profileId:string;reviews:Review[]};
export function readerPacket(profile:Profile,reviews:Review[],edition?:Edition):ReaderPacket{return {kind:'nerdygent-reader',version:2,profile:normalizeProfile(profile),reviews:normalizeReviews(reviews),...(edition?{edition}: {})}}
export function reviewPacket(profile:Profile,reviews:Review[]):ReviewPacket{
 if(!profile.profileId)throw Error('Save your profile before exporting reviews.');
 return {kind:'nerdygent-reviews',version:1,profileId:profile.profileId,reviews:normalizeReviews(reviews)};
}
function parseFile(text:string){if(text.length>2_000_000)throw Error('Choose a reader file smaller than 2 MB.');return JSON.parse(text)}
export function parseReaderPacket(text:string):ReaderPacket{const d=parseFile(text);if(!d||d.kind!=='nerdygent-reader'||d.version!==2||!d.profile)throw Error('Choose a NerdyGent reader backup or phone-review file.');return readerPacket(normalizeProfile(d.profile),normalizeReviews(d.reviews),d.edition?parseEdition(JSON.stringify(d.edition)):undefined)}
export function parseTransfer(text:string):ReaderPacket|ReviewPacket{
 const d=parseFile(text);
 if(d?.kind==='nerdygent-reader')return parseReaderPacket(text);
 if(d?.kind!=='nerdygent-reviews'||d.version!==1||typeof d.profileId!=='string'||!d.profileId||d.profileId.length>100||!Array.isArray(d.reviews))throw Error('Choose a reader backup or returned review file.');
 return {kind:'nerdygent-reviews',version:1,profileId:d.profileId,reviews:normalizeReviews(d.reviews)};
}
export function readReviews(storage:ReaderStorage){return normalizeReviews(JSON.parse(storage.getItem(REVIEW_STORAGE)||'[]'))}
export function savedProfile(storage:ReaderStorage):Profile|null{const raw=storage.getItem(STORAGE);return raw?normalizeProfile(JSON.parse(raw)):null}
export function ensureProfileIdentity(storage:ReaderStorage):Profile|null{
 const p=savedProfile(storage);if(p&&!p.profileId){p.profileId=newId('reader');storage.setItem(STORAGE,JSON.stringify(p))}return p;
}
export function saveProfileDraft(storage:ReaderStorage,profile:Profile,expectedRaw:string|null){
 if(storage.getItem(STORAGE)!==expectedRaw)throw Error('Your profile changed in another tab. Download this draft as a backup, then reload before saving.');
 const p=normalizeProfile(profile);p.profileId ||= newId('reader');
 storage.setItem(STORAGE,JSON.stringify(p));return p;
}
export function mergeReviewPacket(storage:ReaderStorage,packet:ReviewPacket){
 const p=savedProfile(storage);if(!p?.profileId||p.profileId!==packet.profileId)throw Error('These reviews belong to a different or older unlinked profile. Open a fresh phone-review file from this profile; your settings have not changed.');
 const rows=normalizeReviews([...readReviews(storage),...packet.reviews]);storage.setItem(REVIEW_STORAGE,JSON.stringify(rows));return rows;
}
export function mutateReviews(storage:ReaderStorage,profileId:string|undefined,update:(rows:Review[])=>Review[]){
 if(!profileId||savedProfile(storage)?.profileId!==profileId)throw Error('Save your profile first, or reload if you switched profiles in another tab.');
 const rows=normalizeReviews(update(readReviews(storage)));storage.setItem(REVIEW_STORAGE,JSON.stringify(rows));return rows;
}
export function acceptSuggestion(storage:ReaderStorage,expected:Profile,id:string,now=new Date()){
 const p=savedProfile(storage);const before=expected.interests.find(it=>it.id===id);const it=p?.interests.find(it=>it.id===id);
 if(!p||!p.profileId||p.profileId!==expected.profileId||!before||!it||it.rating!==before.rating||it.ratingSetAt!==before.ratingSetAt)throw Error('This interest changed elsewhere. Reload its current rating before accepting a suggestion.');
 if(p.feedbackMode!=='suggest')throw Error('Learning mode changed. Reload to see the current setting.');
 const weight=effectiveInterest(it,p.interests,readReviews(storage),p.feedbackMode,now);
 it.rating=weight.suggested;it.ratingSetAt=now.toISOString();storage.setItem(STORAGE,JSON.stringify(p));return p;
}
// Web Locks serialize cooperating tabs; expected snapshots also reject stale drafts.
export async function withReaderLock<T>(action:()=>T|Promise<T>):Promise<T>{
 if(typeof navigator!=='undefined'&&navigator.locks)return navigator.locks.request('nerdygent-reader-storage',action);
 return action();
}
// Full restoration is explicit and separate from importing returned reviews.
export function saveReaderPacket(storage:ReaderStorage,packet:ReaderPacket,expectedRaw?:string|null){
 if(expectedRaw!==undefined&&storage.getItem(STORAGE)!==expectedRaw)throw Error('Your saved profile changed. Reload before restoring a backup.');
 const safe=readerPacket(packet.profile,packet.reviews,packet.edition);safe.profile.profileId ||= newId('reader');
 const entries:[string,string][]=[[STORAGE,JSON.stringify(safe.profile)],[REVIEW_STORAGE,JSON.stringify(safe.reviews)]];
 if(safe.edition)entries.push([REVIEW_EDITION_STORAGE,JSON.stringify(safe.edition)]);
 const before=entries.map(([key])=>[key,storage.getItem(key)] as const);
 try{for(const [key,value] of entries)storage.setItem(key,value)}catch(error){for(const [key,value] of before){try{if(value===null)storage.removeItem(key);else storage.setItem(key,value)}catch{/* Storage may be revoked entirely. */}}throw error}
 return safe;
}
