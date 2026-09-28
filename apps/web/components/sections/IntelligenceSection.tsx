'use client';

import { Bell, BarChart3, FileText, Gauge, Layers3, Radar, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { WeatherEvent } from '@/lib/demo-data';
import type { ShellSection } from '@/components/shell/Sidebar';

type Props = { section: Exclude<ShellSection,'Live Map'>; events: WeatherEvent[]; selected: WeatherEvent; onSelect: (event: WeatherEvent)=>void };

const copy: Record<Props['section'], {eyebrow:string; title:string; description:string; icon: any}> = {
  'Weather Layers': {eyebrow:'WEATHER INTELLIGENCE',title:'Layer control center',description:'Switch between precipitation, temperature, wind, humidity, cloud and visibility fields without leaving the national console.',icon:Layers3},
  Reports: {eyebrow:'OPERATIONAL REPORTING',title:'Weather intelligence reports',description:'Generate evidence-backed regional summaries from the same event and source model used by the live console.',icon:FileText},
  Analytics: {eyebrow:'NATIONAL ANALYTICS',title:'Signal analytics',description:'Track event volume, verification quality, regional concentration and source health across the prototype network.',icon:BarChart3},
  Alerts: {eyebrow:'ALERT OPERATIONS',title:'Alert command center',description:'Prioritize high-severity signals, review confidence and keep response teams focused on actionable weather intelligence.',icon:Bell},
  'Scenario Lab': {eyebrow:'SCENARIO LAB',title:'Weather impact simulation',description:'Prototype scenario planning for rainfall escalation, heatwave spread and regional response capacity.',icon:Radar},
  'Evidence Explorer': {eyebrow:'EVIDENCE GRAPH',title:'Evidence explorer',description:'Trace a weather event back to its contributing providers and verification signals.',icon:ShieldCheck},
  'Admin Panel': {eyebrow:'SYSTEM CONTROL',title:'Platform administration',description:'Inspect provider connectivity, ingestion health, feature flags and deployment readiness.',icon:SlidersHorizontal},
};

export function IntelligenceSection({section,events,selected,onSelect}:Props){
 const meta=copy[section], Icon=meta.icon;
 const high=events.filter(e=>e.severity==='High').length;
 const verified=events.filter(e=>e.verified).length;
 const avg=Math.round(events.reduce((s,e)=>s+e.confidence,0)/events.length);
 return <div className="section-view">
   <div className="section-hero">
     <div><div className="eyebrow"><Icon size={13}/>{meta.eyebrow}</div><h1>{meta.title}</h1><p>{meta.description}</p></div>
     <div className="section-status"><span className="live-dot"/> LIVE PROTOTYPE</div>
   </div>
   <div className="section-kpis">
     <div><Gauge size={17}/><span>Signals<b>{events.length}</b></span></div>
     <div><ShieldCheck size={17}/><span>Verified<b>{verified}</b></span></div>
     <div><Radar size={17}/><span>High severity<b>{high}</b></span></div>
     <div><BarChart3 size={17}/><span>Avg confidence<b>{avg}%</b></span></div>
   </div>
   <div className="section-grid">
     <div className="section-main card-surface">
       <div className="card-heading"><div><div className="eyebrow">ACTIVE INTELLIGENCE</div><h3>{section === 'Alerts' ? 'Priority event queue' : section === 'Evidence Explorer' ? 'Evidence-linked events' : 'National signal overview'}</h3></div><span className="network-ok"><span className="live-dot"/> Healthy</span></div>
       <div className="signal-list">{events.map(event=><button key={event.id} className={selected.id===event.id?'signal-row selected':'signal-row'} onClick={()=>onSelect(event)}><span className={'severity-dot '+event.severity.toLowerCase()}/><span className="signal-copy"><b>{event.type}</b><small>{event.city}, {event.state} · {event.time}</small></span><span className="signal-confidence">{event.confidence}%</span><span className={event.verified?'verified-text':'review-text'}>{event.verified?'VERIFIED':'REVIEW'}</span></button>)}</div>
     </div>
     <div className="section-side">
       <div className="card-surface"><div className="eyebrow">SELECTED SIGNAL</div><h3>{selected.city}</h3><p className="section-muted">{selected.type} · {selected.severity} severity</p><div className="metric-big">{selected.confidence}%<small>confidence</small></div><div className="mini-metrics"><span>Rain<b>{selected.rain} mm</b></span><span>Temp<b>{selected.temp}°C</b></span><span>Humidity<b>{selected.humidity}%</b></span></div></div>
       <div className="card-surface"><div className="eyebrow">SYSTEM NOTE</div><p className="section-muted">Prototype data is wired through an adapter boundary so live APIs, Kafka streams and the verification engine can replace demo providers without changing this interface.</p></div>
     </div>
   </div>
 </div>
}
