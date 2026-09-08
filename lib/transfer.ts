import {normalizeProfile,parseEdition,type Profile,type Edition} from './press.ts';
import {normalizeReviews,type Review} from './preferences.ts';
export type ReaderPacket={kind:'nerdygent-reader';version:2;profile:Profile;reviews:Review[];edition?:Edition};
export function readerPacket(profile:Profile,reviews:Review[],edition?:Edition):ReaderPacket{return {kind:'nerdygent-reader',version:2,profile:normalizeProfile(profile),reviews:normalizeReviews(reviews),...(edition?{edition}: {})}}
export function parseReaderPacket(text:string):ReaderPacket{if(text.length>2_000_000)throw Error('Choose a reader backup smaller than 2 MB.');const d=JSON.parse(text);if(!d||d.kind!=='nerdygent-reader'||d.version!==2||!d.profile)throw Error('Choose a NerdyGent reader backup or phone-review file.');return readerPacket(normalizeProfile(d.profile),normalizeReviews(d.reviews),d.edition?parseEdition(JSON.stringify(d.edition)):undefined)}
// Validate first and roll back a multi-key import if storage rejects any write.
export function saveReaderPacket(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,packet:ReaderPacket){
 const safe=readerPacket(packet.profile,packet.reviews,packet.edition);
 const entries:[string,string][]=[['nerdygent-profile-v1',JSON.stringify(safe.profile)],['nerdygent-reviews-v1',JSON.stringify(safe.reviews)]];
 if(safe.edition)entries.push(['nerdygent-review-edition-v1',JSON.stringify(safe.edition)]);
 const before=entries.map(([key])=>[key,storage.getItem(key)] as const);
 try{for(const [key,value] of entries)storage.setItem(key,value)}catch(error){for(const [key,value] of before){try{if(value===null)storage.removeItem(key);else storage.setItem(key,value)}catch{/* browser may revoke storage access entirely */}}throw error}
}
