'use client';

import { Crosshair, Expand, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { events, WeatherEvent } from '@/lib/demo-data';
import { LayerControl, WeatherLayer } from './LayerControl';
import { ViewModeToggle } from './ViewModeToggle';
import { getDynamicLayerDomain, InteractiveWeatherMap } from './InteractiveWeatherMap';

function PlusIcon(){return <span className="pm">+</span>}
function MinusIcon(){return <span className="pm">−</span>}

const layerUnits: Record<WeatherLayer, string> = {
  rainfall: 'mm/h',
  temperature: '°C',
  wind: 'km/h',
  humidity: '%',
  cloud: '%',
  visibility: 'km',
};

function formatScaleValue(value: number, layer: WeatherLayer) {
  if (layer === 'temperature') return `${Math.round(value)}°`;
  if (layer === 'rainfall' || layer === 'wind' || layer === 'visibility') return value.toFixed(1);
  return Math.round(value).toString();
}

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
  const dynamicDomain = getDynamicLayerDomain(layer, events);
  const dynamicMid = (dynamicDomain.min + dynamicDomain.max) / 2;

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
          <span>{layer === 'temperature' ? 'TEMPERATURE · FIXED RANGE' : `${layer.toUpperCase()} · INDIA RANGE`}</span>
          <b>{layerUnits[layer]}</b>
        </div>
        <div className="weather-scale-bar"/>
        <div className="weather-scale-values">
          {layer === 'temperature' ? (
            <>
              <span>-20°</span>
              <span>-10°</span>
              <span>0°</span>
              <span>10°</span>
              <span>20°</span>
              <span>30°</span>
              <span>40°</span>
            </>
          ) : (
            <>
              <span>{formatScaleValue(dynamicDomain.min, layer)}</span>
              <span>{formatScaleValue(dynamicMid, layer)}</span>
              <span>{formatScaleValue(dynamicDomain.max, layer)}</span>
            </>
          )}
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
