import test from 'node:test';
import assert from 'node:assert/strict';
import {engineJob,savedEngineJob} from '../lib/engine.ts';
import {emptyProfile,normalizeProfile,STORAGE} from '../lib/press.ts';
import {REVIEW_STORAGE} from '../lib/preferences.ts';
const date='2026-10-12';
const profile=()=>normalizeProfile({...emptyProfile,profileId:'test-reader',pages:8,place:'Edinburgh',country:'United Kingdom',interests:[{id:'parent',name:'Food',rating:3},{id:'niche',parentId:'parent',name:'Baking',rating:5},{id:'trip',name:'A trip',rating:4,expiresOn:'2026-10-11'}]});
const votes=()=>[0,1,2].map(i=>({id:`v${i}`,editionKey:'old',articleId:`a${i}`,headline:`Story ${i}`,signal:'less',interestId:'niche',createdAt:'2026-10-10T12:00:00Z'}));
test('full job preserves pages, separate base ratings and explicit bounded feedback',()=>{
 const p=profile();p.feedbackMode='automatic';const job=engineJob(p,votes(),date);
 assert.equal(job.kind,'nerdygent-engine-job');assert.equal(job.version,1);assert.equal(job.profile.pages,8);
 assert.equal(job.editorProfile.pages,8);assert.equal(job.editorProfile.interests.find(i=>i.id==='niche').rating,4);
 assert.equal(job.profile.interests.find(i=>i.id==='niche').rating,5);assert.equal(job.editorProfile.interests.find(i=>i.id==='parent').rating,3);
 assert.equal(job.editorProfile.interests.some(i=>i.id==='trip'),false);assert.equal(job.profile.interests.length,3);
 for(const mode of ['suggest','off']){p.feedbackMode=mode;assert.equal(engineJob(p,votes(),date).editorProfile.interests.find(i=>i.id==='niche').rating,5)}
});
test('weekly jobs preserve the chosen cadence, source access and exclusions',()=>{
 const p=profile();p.frequency='weekly';p.sources=[{id:'source',name:'Publisher',url:'https://EXAMPLE.org',kind:'rss',perspective:'left',access:'subscriber',preference:'exclude'}];
 const j=engineJob(p,[],date);assert.equal(j.editorProfile.frequency,'weekly');assert.equal(j.editorProfile.country,'United Kingdom');
 assert.equal(j.profile.sources[0].url,'https://example.org/');assert.deepEqual(j.profile.sources,j.editorProfile.sources);
});
test('job refuses missing identity, location, invalid date, and private feed credentials',()=>{
 const p=profile();assert.throws(()=>engineJob({...p,profileId:undefined},[],date),/Save/);
 assert.throws(()=>engineJob({...p,place:''},[],date),/place/);assert.throws(()=>engineJob({...p,country:''},[],date),/country/);
 assert.throws(()=>engineJob(p,[],'2026-02-30'),/valid edition date/);
 assert.throws(()=>engineJob({...p,sources:[{name:'Private',url:'https://example.org/feed?key=secret'}]},[],date),/public HTTPS/);
});
test('history contains only prior coverage, with public links and bounded retention',()=>{
 const h=Array.from({length:45},(_,i)=>({date:'2026-10-11',headline:`Story ${i}`,urls:['https://example.org/article','https://example.org/story?id=123&utm_source=rss#part','https://example.org/feed?key=private','file:///private']}));
 h.push({date,headline:'Current date',urls:[]},{date:'bad',headline:'Bad date',urls:[]});
 const j=engineJob(profile(),[],date,h);assert.equal(j.history.length,40);assert.equal(j.history[0].headline,'Story 5');assert.deepEqual(j.history[0].urls,['https://example.org/article','https://example.org/story?id=123']);
});
test('export reloads current reviews and refuses stale tabs or unsaved draft changes',()=>{
 const p=profile();const raw=JSON.stringify(p);const map=new Map([[STORAGE,raw],[REVIEW_STORAGE,JSON.stringify(votes())]]);const storage={getItem:k=>map.get(k)??null};
 assert.equal(savedEngineJob(storage,p,raw,date).reviews.length,3);
 assert.throws(()=>savedEngineJob(storage,{...p,pages:4},raw,date),/Save your changes/);
 map.set(STORAGE,JSON.stringify({...p,about:'Newer'}));assert.throws(()=>savedEngineJob(storage,p,raw,date),/another tab/);
});
