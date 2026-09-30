'use client';

import { Crosshair, Expand, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { events, WeatherEvent } from '@/lib/demo-data';
import { LayerControl, WeatherLayer } from './LayerControl';
import { ViewModeToggle } from './ViewModeToggle';
import { InteractiveWeatherMap } from './InteractiveWeatherMap';

function PlusIcon(){return <span className="pm">+</span>}
function MinusIcon(){return <span className="pm">−</span>}

const layerScale: Record<WeatherLayer, { min: string; mid: string; max: string; unit: string }> = {
  rainfall: { min: '0', mid: '5', max: '10+', unit: 'mm/h' },
  temperature: { min: '10°', mid: '28°', max: '45°', unit: '°C' },
  wind: { min: '0', mid: '20', max: '40+', unit: 'km/h' },
  humidity: { min: '0', mid: '50', max: '100', unit: '%' },
  cloud: { min: '0', mid: '50', max: '100', unit: '%' },
  visibility: { min: '1', mid: '7', max: '12+', unit: 'km' },
};

export function WeatherMap({selected,setSelected}:{selected:WeatherEvent,setSelected:(e:WeatherEvent)=>void}){
  const [layer,setLayer]=useState<WeatherLayer>('rainfall');
  const [mode,setMode]=useState<'2D'|'3D'>('2D');
  const [expanded,setExpanded]=useState(false);
  const [fullscreen,setFullscreen]=useState(false);
  const shellRef=useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const shellClass = `map-shell${expanded ? ' map-shell-expanded' : ''}${fullscreen ? ' map-shell-fullscreen' : ''}`;

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;
    try {
      if (!document.fullscreenElement) {
        await shell.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback is the CSS expanded mode; native fullscreen can be blocked by the browser.
      setExpanded(true);
    }
  };

  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return <div ref={shellRef} className={shellClass}>
      <InteractiveWeatherMap events={events} selected={selected} mode={mode} layer={layer} onSelect={setSelected}/>
      <LayerControl value={layer} onChange={setLayer}/>
      <ViewModeToggle mode={mode} onChange={setMode}/>

      <div className={`weather-scale weather-scale-${layer}`} aria-label={`${layer} intensity scale`}>
        <div className="weather-scale-head">
          <span>{layer.toUpperCase()} FIELD</span>
          <b>{layerScale[layer].unit}</b>
        </div>
        <div className="weather-scale-bar"/>
        <div className="weather-scale-values">
          <span>{layerScale[layer].min}</span>
          <span>{layerScale[layer].mid}</span>
          <span>{layerScale[layer].max}</span>
        </div>
      </div>

      <div className="map-size-controls" aria-label="Map sizing controls">
        <button
          type="button"
          className={expanded && !fullscreen ? 'active' : ''}
          onClick={() => setExpanded(value => !value)}
          aria-label={expanded ? 'Use compact map size' : 'Expand map size'}
          title={expanded ? 'Compact map' : 'Expand map'}
        >
          <Expand size={15}/>
          <span>{expanded ? 'COMPACT' : 'EXPAND'}</span>
        </button>
        <button
          type="button"
          className={fullscreen ? 'active' : ''}
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen map' : 'Open map fullscreen'}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize2 size={15}/> : <Maximize2 size={15}/>}
          <span>{fullscreen ? 'EXIT' : 'FULL'}</span>
        </button>
      </div>

      <div className="map-legend"><span><i className="rain"/>Intensity</span><span><i className="warn"/>Alert</span><span><i className="verified"/>Verified</span></div>
    </div>;
  }

  return <div className="map-shell">
    <div className="map-grid"/>
    <div className="map-scan"/>
    <div className="map-title"><span className="live-dot"/>LIVE NATIONAL VIEW <small>{layer} · synthetic prototype feed</small></div><LayerControl value={layer} onChange={setLayer}/><ViewModeToggle mode={mode} onChange={setMode}/>
    <div className={`india-outline ${mode==='3D'?'mode-3d':''}`}><div className="india-shape"/></div>
    {events.map(e=><button key={e.id} className={`map-point ${selected.id===e.id?'active':''} ${e.severity.toLowerCase()}`} style={{left:`${e.x}%`,top:`${e.y}%`}} onClick={()=>setSelected(e)} aria-label={e.city}><span className="pulse"/><i/></button>)}
    <div className="layer-readout">LAYER <b>{layer.toUpperCase()}</b> · VIEW <b>{mode}</b></div><div className="map-legend"><span><i className="rain"/>Rainfall</span><span><i className="warn"/>Alert</span><span><i className="verified"/>Verified</span></div>
    <div className="map-controls"><button aria-label="Recenter"><Crosshair size={15}/></button><button aria-label="Zoom in"><PlusIcon/></button><button aria-label="Zoom out"><MinusIcon/></button></div>
  </div>
}
