'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Activity, AlertTriangle, BarChart3, CheckCircle2, CloudRain, Download, FileText, Gauge, Layers3, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Wind } from 'lucide-react';
import type { WeatherEvent } from '@/lib/demo-data';
import type { ShellSection } from '@/components/shell/Sidebar';
import { coverageLocations, coverageSummary, generateHistory, generateHistoricalReading, findLocation, INDIA_JURISDICTIONS } from '@/lib/pan-india-data';
import { InteractiveWeatherMap } from '@/components/map/InteractiveWeatherMap';

type Props = { section: Exclude<ShellSection,'Live Map'>; events: WeatherEvent[]; selected: WeatherEvent; onSelect: (event: WeatherEvent)=>void };

const meta: Record<Props['section'], {eyebrow:string;title:string;description:string;icon:any}> = {
  'Weather Layers': {eyebrow:'WEATHER INTELLIGENCE',title:'Weather layer control',description:'Explore synthetic historical weather fields across the pan-India coverage index while the production data and ML adapters remain decoupled.',icon:Layers3},
  Reports: {eyebrow:'OPERATIONAL REPORTING',title:'Intelligence reports',description:'Build a regional report from generated historical readings and download the current evidence snapshot for review.',icon:FileText},
  Analytics: {eyebrow:'NATIONAL ANALYTICS',title:'Signal analytics',description:'Turn the temporary historical dataset into usable trends, coverage metrics and risk distributions.',icon:BarChart3},
  Alerts: {eyebrow:'ALERT OPERATIONS',title:'Alert command center',description:'Review, acknowledge and filter weather signals without waiting for the future verification backend.',icon:AlertTriangle},
  'Scenario Lab': {eyebrow:'SCENARIO LAB',title:'Weather impact simulator',description:'Stress-test rainfall, heat and wind conditions locally using a deterministic impact model that can later be replaced by the ML engine.',icon:Activity},
  'Evidence Explorer': {eyebrow:'EVIDENCE GRAPH',title:'Evidence explorer',description:'Inspect how a signal is represented, what providers are attached and what the temporary confidence model currently says.',icon:ShieldCheck},
  'Admin Panel': {eyebrow:'SYSTEM CONTROL',title:'Platform administration',description:'Monitor frontend data services, coverage generation and integration readiness without touching the future backend contract.',icon:SlidersHorizontal},
};

function Glass({children,className='' }:{children:ReactNode;className?:string}){return <div className={'glass-card '+className}>{children}</div>}

export function IntelligenceSection({section,events,selected,onSelect}:Props){
 const m=meta[section], Icon=m.icon;
 const [search,setSearch]=useState('');
 const [layer,setLayer]=useState('Rainfall');
 const [ack,setAck]=useState<string[]>([]);
 const [reportDays,setReportDays]=useState(30);
 const [scenario,setScenario]=useState({rain:42,heat:34,wind:24});
 const location=findLocation(selected.city);
 const history=useMemo(()=>generateHistory(location.location,location.state,90),[location.location,location.state]);
 const filteredLocations=coverageLocations.filter(x=>`${x.location} ${x.state}`.toLowerCase().includes(search.toLowerCase())).slice(0,12);
 const avg=Math.round(history.reduce((s,x)=>s+x.temperature,0)/history.length*10)/10;
 const rainTotal=Math.round(history.reduce((s,x)=>s+x.rainfall,0));
 const risk=Math.min(99,Math.round(scenario.rain*1.15+Math.max(0,scenario.heat-32)*3.2+scenario.wind*.55));
 const scenarioEvent: WeatherEvent = {
   ...selected,
   id: 'SCENARIO-PREVIEW',
   type: risk > 70 ? 'Simulated Severe Weather' : risk > 40 ? 'Simulated Weather Stress' : 'Simulated Stable Field',
   severity: risk > 70 ? 'High' : risk > 40 ? 'Medium' : 'Low',
   confidence: risk,
   temp: scenario.heat,
   humidity: Math.min(100, Math.max(25, 62 + scenario.rain * 0.35)),
   rain: scenario.rain / 10,
   sources: 1,
   verified: false,
   time: 'SIMULATION',
 };

 function downloadReport(){
   const payload={generatedAt:new Date().toISOString(),coverage:coverageSummary,location,days:reportDays,readings:history.slice(-reportDays)};
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`meghnetra-${location.code.toLowerCase()}-report.json`; a.click(); URL.revokeObjectURL(url);
 }

 const header=<div className="section-hero glass-hero"><div><div className="eyebrow"><Icon size={13}/>{m.eyebrow}</div><h1>{m.title}</h1><p>{m.description}</p></div><div className="section-status"><span className="live-dot"/> FRONTEND DATA MODE</div></div>;

 if(section==='Weather Layers') return <div className="section-view">{header}<div className="control-strip glass-card"><div><span className="control-label">FIELD</span><div className="segmented">{['Rainfall','Temperature','Wind','Humidity','Cloud'].map(x=><button className={layer===x?'selected':''} onClick={()=>setLayer(x)} key={x}>{x}</button>)}</div></div><div className="coverage-chip"><Gauge size={15}/><b>{coverageSummary.seededLocations}</b><span>seeded locations · {coverageSummary.generatedReadings.toLocaleString()} generated readings</span></div></div><div className="section-grid"><Glass className="wide"><div className="card-heading"><div><div className="eyebrow">PAN-INDIA COVERAGE</div><h3>{layer} field explorer</h3></div><span className="network-ok"><span className="live-dot"/> Generated locally</span></div><div className="location-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find any seeded city or state…"/></div><div className="coverage-grid">{filteredLocations.map(x=>{const r=generateHistoricalReading(x.location,x.state,new Date('2026-09-29'));return <button key={x.code+x.location} className="location-tile" onClick={()=>{const e=events.find(e=>e.city===x.location); if(e)onSelect(e)}}><span>{x.location}</span><small>{x.state}</small><b>{layer==='Rainfall'?r.rainfall+' mm':layer==='Temperature'?r.temperature+'°C':layer==='Wind'?r.wind+' km/h':layer==='Humidity'?r.humidity+'%':Math.round(100-r.visibility*4)+'%'}</b></button>})}</div></Glass><Glass><div className="eyebrow">FIELD READOUT</div><h3>{location.location}</h3><div className="metric-big">{layer==='Rainfall'?history.at(-1)?.rainfall:layer==='Temperature'?history.at(-1)?.temperature:layer==='Wind'?history.at(-1)?.wind:history.at(-1)?.humidity}<small>{layer==='Rainfall'?'mm':layer==='Temperature'?'°C':layer==='Wind'?'km/h':'%'}</small></div><div className="mini-metrics"><span>7D avg<b>{Math.round(history.slice(-7).reduce((s,x)=>s+x.rainfall,0)/7*10)/10} mm</b></span><span>Risk<b>{history.at(-1)?.risk}%</b></span></div></Glass></div></div>;

 if(section==='Reports') return <div className="section-view">{header}<div className="report-builder glass-card"><div className="builder-title"><Sparkles size={18}/><div><b>Historical intelligence brief</b><small>Deterministic demo data · backend-ready export shape</small></div></div><div className="builder-controls"><label>LOCATION<input value={location.location} readOnly/></label><label>WINDOW<select value={reportDays} onChange={e=>setReportDays(Number(e.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option></select></label><button className="primary-btn" onClick={downloadReport}><Download size={15}/> Export JSON</button></div></div><div className="report-grid"><Glass><div className="eyebrow">EXECUTIVE SIGNAL</div><h2>{location.location}</h2><p className="section-muted">{location.state} · {reportDays}-day generated baseline</p><div className="report-number">{avg}°C<small>mean temperature</small></div><div className="report-stat-row"><span>Total rainfall<b>{rainTotal} mm</b></span><span>Peak risk<b>{Math.max(...history.map(x=>x.risk))}%</b></span><span>Wind avg<b>{Math.round(history.reduce((s,x)=>s+x.wind,0)/history.length)} km/h</b></span></div></Glass><Glass className="timeline-card"><div className="eyebrow">90-DAY SIGNAL TRACE</div><div className="spark-bars">{history.filter((_,i)=>i%4===0).map((x,i)=><i key={i} style={{height:`${Math.max(12,x.risk*.72)}%`}} title={`${x.date}: ${x.risk}%`}/>)}</div><div className="timeline-foot"><span>90 days ago</span><span>today</span></div></Glass></div></div>;

 if(section==='Analytics') return <div className="section-view">{header}<div className="section-kpis"><div><Gauge/><span>Seeded locations<b>{coverageSummary.seededLocations}</b></span></div><div><Activity/><span>Generated readings<b>{coverageSummary.generatedReadings.toLocaleString()}</b></span></div><div><CloudRain/><span>Jurisdictions<b>{coverageSummary.jurisdictions}</b></span></div><div><ShieldCheck/><span>Demo confidence<b>Deterministic</b></span></div></div><div className="analytics-grid"><Glass className="wide"><div className="card-heading"><div><div className="eyebrow">REGIONAL DISTRIBUTION</div><h3>Coverage by jurisdiction</h3></div></div><div className="bar-list jurisdiction-list">{INDIA_JURISDICTIONS.map(j=><div key={j.code}><span><b>{j.name}</b><small>{j.locations.length} seeded locations</small></span><i><b style={{width: Math.min(100,20+j.locations.length*5) + '%'}}/></i><em>{j.locations.length}</em></div>)}</div></Glass><Glass><div className="eyebrow">SELECTED HISTORY</div><h3>{location.location}</h3><div className="analytics-big">{Math.round(history.reduce((s,x)=>s+x.risk,0)/history.length)}<small>average risk index</small></div><div className="history-kpis"><span><b>{Math.round(history.at(-1)?.temperature ?? 0)}°C</b><small>latest temp</small></span><span><b>{Math.round(history.slice(-7).reduce((s,x)=>s+x.rainfall,0))} mm</b><small>7D rainfall</small></span><span><b>{Math.round(history.at(-1)?.wind ?? 0)} km/h</b><small>latest wind</small></span></div><div className="history-spark">{history.slice(-14).map((x,i)=><i key={i} style={{height: Math.max(12,x.risk) + '%'}} title={x.date+' · Risk '+x.risk+'% · '+x.temperature+'°C'}/>)}</div><div className="history-foot"><span>14-day signal</span><b>{history.at(-1)?.date}</b></div></Glass></div></div>;

 if(section==='Alerts') return <div className="section-view">{header}<div className="alert-toolbar glass-card"><div className="alert-count"><AlertTriangle size={18}/><b>{events.length-ack.length}</b><span>unacknowledged signals</span></div><button onClick={()=>setAck(events.map(e=>e.id))}><CheckCircle2 size={15}/> Acknowledge all</button></div><Glass><div className="alert-inline-detail"><div><div className="eyebrow">SELECTED SIGNAL</div><h3>{selected.type}</h3><p>{selected.city}, {selected.state} · {selected.time}</p></div><div className="alert-inline-metrics"><span><b>{selected.confidence}%</b><small>confidence</small></span><span><b>{selected.temp}°C</b><small>temperature</small></span><span><b>{selected.rain} mm</b><small>rainfall</small></span><span><b>{selected.sources}</b><small>sources</small></span></div></div><div className="signal-list">{events.map(event=><button key={event.id} className={selected.id===event.id?'signal-row selected':'signal-row'} onClick={()=>onSelect(event)}><span className={'severity-dot '+event.severity.toLowerCase()}/><span className="signal-copy"><b>{event.type}</b><small>{event.city}, {event.state} · {event.time}</small></span><span className="signal-confidence">{event.confidence}%</span><span className={ack.includes(event.id)?'verified-text':'review-text'}>{ack.includes(event.id)?'ACKNOWLEDGED':'ACTION NEEDED'}</span></button>)}</div></Glass></div>;

 if(section==='Scenario Lab') return <div className="section-view">{header}<div className="scenario-layout scenario-layout-v2"><Glass className="scenario-controls"><div className="eyebrow">PARAMETER CONTROLS</div><div className="scenario-live-badge"><span className="live-dot"/> MAP PREVIEW UPDATES LIVE</div>{([
  ['rain','Rainfall intensity','mm/h',0,80],
  ['heat','Temperature','°C',20,48],
  ['wind','Wind speed','km/h',0,80],
] as const).map(([key,label,unit,min,max])=><label className="range-row" key={key}><span>{label}<b>{scenario[key]} {unit}</b></span><input type="range" min={min} max={max} value={scenario[key]} onChange={e=>setScenario({...scenario,[key]:Number(e.target.value)})}/></label>)}<button className="secondary-btn" onClick={()=>setScenario({rain:42,heat:34,wind:24})}><RefreshCw size={14}/> Reset scenario</button><div className="scenario-note">Simulation state is isolated from the Live Map and does not mutate real/demo event data.</div></Glass><Glass className="scenario-map-card"><div className="scenario-map-head"><div><div className="eyebrow">SCENARIO WEATHER FIELD</div><h3>{selected.city} · simulated impact</h3></div><span>SIMULATION ONLY</span></div><div className="scenario-map-wrap"><InteractiveWeatherMap events={[scenarioEvent]} selected={scenarioEvent} mode="2D" layer="rainfall" onSelect={()=>{}}/><div className="scenario-map-overlay"><b>RISK {risk}</b><span>{scenario.rain} mm/h · {scenario.heat}°C · {scenario.wind} km/h</span></div></div><div className="impact-grid"><span><Wind/> Wind load<b>{scenario.wind} km/h</b></span><span><CloudRain/> Rain load<b>{scenario.rain} mm/h</b></span><span><Activity/> Heat load<b>{scenario.heat}°C</b></span></div></Glass></div></div>;

 if(section==='Evidence Explorer') return <div className="section-view">{header}<div className="evidence-layout"><Glass className="wide"><div className="card-heading"><div><div className="eyebrow">SELECTED SIGNAL</div><h3>{selected.type} · {selected.city}</h3></div><span className="verified-pill"><ShieldCheck size={12}/> {selected.confidence}% confidence</span></div><div className="evidence-chain">{['IMD Observation','Weather API','Citizen Reports','Geospatial Correlation'].slice(0,selected.sources>6?4:3).map((x,i)=><div key={x}><span className="chain-node">{i+1}</span><div><b>{x}</b><small>{i===0?'official observation':'correlated supporting signal'}</small></div><CheckCircle2 size={15}/></div>)}</div></Glass><Glass><div className="eyebrow">EVIDENCE METADATA</div><div className="metadata"><span>Event ID<b>{selected.id}</b></span><span>Sources<b>{selected.sources}</b></span><span>Status<b>{selected.verified?'Verified':'Review'}</b></span><span>Timestamp<b>{selected.time}</b></span></div></Glass></div></div>;

 return <div className="section-view">{header}<div className="admin-grid"><Glass><div className="eyebrow">FRONTEND SERVICES</div>{['Demo data generator','Map renderer','Historical index','Export service'].map((x,i)=><div className="service-row" key={x}><span className="live-dot"/><b>{x}</b><em>{i===1?'MAPBOX READY':'OPERATIONAL'}</em></div>)}</Glass><Glass><div className="eyebrow">INTEGRATION GATE</div><h2>Backend intentionally isolated</h2><p className="section-muted">The current UI exposes stable surfaces for Node, Python ML, PostGIS, Kafka/Redis and real providers. No production architecture is assumed until mentor review.</p><div className="integration-tags">{['Node API','Python ML','PostGIS','Kafka','Redis','Weather APIs'].map(x=><span key={x}>{x}<small>WAITING</small></span>)}</div></Glass></div></div>;
}
