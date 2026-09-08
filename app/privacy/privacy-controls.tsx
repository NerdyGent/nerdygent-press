'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {STORAGE} from '@/lib/press';
export default function PrivacyControls(){const [status,setStatus]=useState('');return <div className="actions"><Button variant="outline" onClick={()=>{try{localStorage.removeItem(STORAGE);localStorage.removeItem('nerdygent-history');setStatus('Profile and coverage history removed from this browser. Downloaded files are unaffected.')}catch{setStatus('This browser does not allow access to local storage.')}}}>Clear this device’s profile and history</Button><p role="status">{status}</p></div>}
