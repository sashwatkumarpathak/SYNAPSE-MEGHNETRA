'use client';

import { Card } from '@/components/ui/card';
import { MapPin, ShieldCheck } from 'lucide-react';
import type { WeatherEvent } from '@/lib/demo-data';

export function EventIntelligencePanel({event}:{event:WeatherEvent}){
  return <Card className="selected-card">
    <div className="card-top">
      <span className="verified-pill"><ShieldCheck size={14}/> {event.verified?'VERIFIED':'UNDER REVIEW'}</span>
      <span className="confidence">{event.confidence}%</span>
    </div>
    <h2>{event.type}</h2>
    <p className="place"><MapPin size={14}/> {event.city}, {event.state}</p>
    <div className="weather-grid">
      <div><small>Temperature</small><b>{event.temp}°C</b></div>
      <div><small>Humidity</small><b>{event.humidity}%</b></div>
      <div><small>Rainfall</small><b>{event.rain} mm</b></div>
    </div>
    <div className="evidence">
      <div className="section-label">EVIDENCE SOURCES <span>{event.sources} correlated</span></div>
      {['IMD Observation','Weather API','Citizen Reports','Geospatial Correlation']
        .slice(0, Math.min(4,event.sources))
        .map((source,index)=><div className="source" key={source}>
          <span className="source-check">✓</span>{source}
          <small>{index===0?'official':index===1?'live':'correlated'}</small>
        </div>)}
    </div>
    <button className="detail-btn">Open event intelligence <span>→</span></button>
  </Card>
}
