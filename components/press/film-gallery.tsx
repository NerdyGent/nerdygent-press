'use client';
import {useState} from 'react';
import ProductFilm from './product-film';
const films=[{name:'sources-to-stories',number:'01',label:'Choose your sources',title:'Start with sources you choose.',subtitle:'Local outlets, RSS feeds and Reddit communities. A reading list you control.'},{name:'made-for-you',number:'02',label:'Set your preferences',title:'Make every edition more yours.',subtitle:'Adjust topics, priorities and feedback. Keep control as your preferences change.'}];
export default function FilmGallery(){const [active,setActive]=useState(0);const film=films[active];return <div className="film-gallery"><div className="film-selector" role="group" aria-label="Choose a product walkthrough">{films.map((f,i)=><button key={f.name} aria-pressed={active===i} onClick={()=>setActive(i)}><span>{f.number}</span>{f.label}</button>)}</div><ProductFilm key={film.name} {...film}/></div>}
