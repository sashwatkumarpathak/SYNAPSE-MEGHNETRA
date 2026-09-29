'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen({onDone}:{onDone:()=>void}) {
  const [progress,setProgress]=useState(8);
  useEffect(()=>{
    const timer=window.setInterval(()=>setProgress(p=>Math.min(100,p+Math.round(7+Math.random()*13))),180);
    const done=window.setTimeout(onDone,1500);
    return()=>{window.clearInterval(timer);window.clearTimeout(done)};
  },[onDone]);
  return <div className="loading-screen" aria-label="Loading MEGHNETRA">
    <div className="loading-grid"/>
    <div className="loading-orbit orbit-a"/><div className="loading-orbit orbit-b"/>
    <div className="loading-core"><img src="/synapse-logo.png" alt="SYNAPSE"/><span/></div>
    <div className="loading-wordmark">SYNAPSE<span>-MEGHNETRA</span></div>
    <div className="loading-caption">NATIONAL WEATHER INTELLIGENCE</div>
    <div className="loading-progress"><i style={{width:`${progress}%`}}/></div>
    <div className="loading-meta"><span>INITIALIZING WEATHER GRAPH</span><b>{progress}%</b><span>FRONTEND DATA MODE</span></div>
  </div>;
}
