'use client';
import Link from 'next/link';
import {Download} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import type {Profile} from '@/lib/press';
import {editionPeriod} from '@/lib/preferences';
import {Choice} from './controls';

export default function EnginePanel({profile,date,onDate,onPages,onExport}:{profile:Profile;date:string;onDate:(date:string)=>void;onPages:(pages:number)=>void;onExport:()=>void}){
  let period='Choose an edition date';
  try{const range=editionPeriod(profile.frequency,date);period=profile.frequency==='weekly'?`${range.start} through ${range.end}`:`Edition dated ${date}`}catch{/* Editable date field. */}
  return <section className="panel prose">
    <p className="eyebrow">THE ORIGINAL NEWSPAPER WORKFLOW · LOCAL PREVIEW</p>
    <h2>Full engine. Your AI.</h2>
    <p>The original reporting, editing, page layout and checks—with the ChatGPT or Claude account you already use. Your sources and reading mix guide the whole edition.</p>
    <div className="two-col"><div><label className="field-label" htmlFor="edition-date">Edition date</label><Input id="edition-date" type="date" value={date} onChange={e=>onDate(e.target.value)}/></div><div><label className="field-label">Printed pages</label><Choice label="Target page count" value={String(profile.pages)} options={['2','4','6','8']} onChange={v=>onPages(Number(v))}/></div></div>
    <p className="small-note">{profile.frequency==='weekly'?'Weekly':'Daily'} · {period}. Save any changes before exporting.</p>
    <ol className="steps">
      <li><h3>Take your mix to the engine.</h3><p>Export your saved profile, current reviews and previous coverage. Open the local desk on this computer and import the job.</p><div className="actions"><Button onClick={onExport}><Download/>Export engine job</Button><a className="text-link" href="http://127.0.0.1:8487/" target="_blank" rel="noreferrer">Open local desk ↗</a></div></li>
      <li><h3>Your AI does the editorial work.</h3><p>The desk collects your selected public RSS feeds and prepares each stage: triage, research, writing and copy editing. Attach its files to your AI chat and bring each result back to the desk. Missing sources stay visible.</p></li>
      <li><h3>Check the paper. Then print.</h3><p>The engine creates the original PDF and checks its sources, dates, layout and requested settings. A matching copy-edit report is required before release. Read the PDF, print it, then take its private review file to <Link href="/review">Rate your paper</Link>.</p></li>
    </ol>
    <p className="notice">The local desk must already be running on your computer. This is a working local preview; a public installer is not available yet. The website alone cannot run the engine. File transfers are manual, your AI’s usage limits apply, and this does not activate a schedule or send a printer job.</p>
    <div className="link-list"><a href="https://chatgpt.com/" target="_blank" rel="noreferrer">Open ChatGPT ↗</a><a href="https://claude.ai/" target="_blank" rel="noreferrer">Open Claude ↗</a><Link href="/help">How the handoff works →</Link></div>
  </section>;
}
