'use client';

import { Crosshair } from 'lucide-react';
import { events, WeatherEvent } from '@/lib/demo-data';

function PlusIcon(){return <span className="pm">+</span>}
function MinusIcon(){return <span className="pm">−</span>}

export function WeatherMap({selected,setSelected}:{selected:WeatherEvent,setSelected:(e:WeatherEvent)=>void}){
  return <div className="map-shell">
    <div className="map-grid"/>
    <div className="map-scan"/>
    <div className="map-title"><span className="live-dot"/>LIVE NATIONAL VIEW <small>synthetic prototype feed</small></div>
    <div className="india-outline"><div className="india-shape"/></div>
    {events.map(e=><button key={e.id} className={`map-point ${selected.id===e.id?'active':''} ${e.severity.toLowerCase()}`} style={{left:`${e.x}%`,top:`${e.y}%`}} onClick={()=>setSelected(e)} aria-label={e.city}><span className="pulse"/><i/></button>)}
    <div className="map-legend"><span><i className="rain"/>Rainfall</span><span><i className="warn"/>Alert</span><span><i className="verified"/>Verified</span></div>
    <div className="map-controls"><button aria-label="Recenter"><Crosshair size={15}/></button><button aria-label="Zoom in"><PlusIcon/></button><button aria-label="Zoom out"><MinusIcon/></button></div>
  </div>
}
