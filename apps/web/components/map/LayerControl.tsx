'use client';

import { useState } from 'react';
import { CloudRain, Droplets, Eye, Thermometer, Wind } from 'lucide-react';

export type WeatherLayer = 'rainfall' | 'temperature' | 'wind' | 'humidity' | 'cloud' | 'visibility';

const layers = [
  ['rainfall','Rainfall',CloudRain],
  ['temperature','Temperature',Thermometer],
  ['wind','Wind',Wind],
  ['humidity','Humidity',Droplets],
  ['cloud','Cloud cover',CloudRain],
  ['visibility','Visibility',Eye],
] as const;

export function LayerControl({value,onChange}:{value:WeatherLayer,onChange:(value:WeatherLayer)=>void}){
  const [open,setOpen]=useState(true);
  return <div className={`layer-control ${open?'open':''}`}>
    <button className="layer-control-toggle" onClick={()=>setOpen(v=>!v)}>WEATHER LAYERS <span>{open?'−':'+'}</span></button>
    {open && <div className="layer-control-list">
      {layers.map(([id,label,Icon])=><button key={id} className={value===id?'active':''} onClick={()=>onChange(id)}><Icon size={13}/><span>{label}</span><i/></button>)}
    </div>}
  </div>
}
