'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {REVIEW_STORAGE,REVIEW_EDITION_STORAGE} from '@/lib/preferences';
import {STORAGE} from '@/lib/press';
export default function PrivacyControls(){const [status,setStatus]=useState('');return <div className="actions"><Button variant="outline" onClick={()=>{try{localStorage.removeItem(STORAGE);localStorage.removeItem('nerdygent-history');localStorage.removeItem(REVIEW_STORAGE);localStorage.removeItem(REVIEW_EDITION_STORAGE);setStatus('Profile, reviews, saved review edition and coverage history removed from this browser. Downloaded files are unaffected.')}catch{setStatus('This browser does not allow access to local storage.')}}}>Clear this device’s profile, papers and reviews</Button><p role="status">{status}</p></div>}
