'use client';
import {useRef,useState} from 'react';
import {Play,ArrowDownToLine} from 'lucide-react';
export default function ProductFilm({name,title,subtitle,number}:{name:string;title:string;subtitle:string;number:string}){
 const ref=useRef<HTMLVideoElement>(null);const [started,setStarted]=useState(false);const [error,setError]=useState(false);
 async function play(){try{await ref.current?.play();setStarted(true)}catch{setError(true)}}
 return <article className="product-film"><div className="film-viewport"><video ref={ref} controls={started} playsInline preload="none" poster={`/films/${name}-poster.png`} aria-label={title} aria-describedby={`${name}-description`} onPlay={()=>setStarted(true)} onError={()=>setError(true)}><source src={`/films/${name}.mp4`} type="video/mp4"/>Your browser cannot play this video. Use the download link below.</video>{!started&&<button className="film-play" onClick={play} aria-label={`Play ${title}`}><Play size={23} fill="currentColor"/><span>Watch film</span></button>}<span className="film-number">{number}</span></div><div className="film-caption"><div><h3>{title}</h3><p id={`${name}-description`}>{subtitle}</p></div><a href={`/films/${name}.mp4`} download aria-label={`Download ${title}`}><ArrowDownToLine size={18}/></a></div>{error&&<p className="small-note">Playback is unavailable. Download the film to watch it on your device.</p>}</article>
}
