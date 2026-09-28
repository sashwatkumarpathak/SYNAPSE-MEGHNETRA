'use client';

import { CloudRain, MapPin, Wind } from 'lucide-react';
import type { WeatherEvent } from '@/lib/demo-data';

export function EventCard({event,onClick}:{event:WeatherEvent,onClick:()=>void}){
  const rainfall = event.type.includes('Rain');
  return <button className="event-row" onClick={onClick}>
    <div className={`event-symbol ${rainfall?'rainy':'stormy'}`}>
      {rainfall?<CloudRain size={18}/>:<Wind size={18}/>}
    </div>
    <div className="event-main">
      <strong>{event.type}</strong>
      <span><MapPin size={11}/> {event.city}, {event.state}</span>
    </div>
    <div className="event-confidence"><b>{event.confidence}%</b><small>confidence</small></div>
    <span className={`status-dot ${event.verified?'ok':'review'}`}/>
  </button>
}
