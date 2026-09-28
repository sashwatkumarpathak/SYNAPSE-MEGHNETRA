'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { WeatherEvent } from '@/lib/demo-data';

type Props = {
  events: WeatherEvent[];
  selected: WeatherEvent;
  mode: '2D' | '3D';
  layer: 'rainfall' | 'temperature' | 'wind' | 'humidity' | 'cloud' | 'visibility';
  onSelect: (event: WeatherEvent) => void;
};

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const coords: Record<string, [number, number]> = {
  Visakhapatnam: [83.2185, 17.6868],
  Mumbai: [72.8777, 19.076],
  Kolkata: [88.3639, 22.5726],
  Jaipur: [75.7873, 26.9124],
  Delhi: [77.1025, 28.7041],
  Guwahati: [91.7362, 26.1445],
};

export function InteractiveWeatherMap({ events, selected, mode, layer, onSelect }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!container.current || !token) return;

    mapboxgl.accessToken = token;
    const initial = coords[selected.city] ?? [78.9629, 20.5937];

    const instance = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initial,
      zoom: 4.25,
      pitch: mode === '3D' ? 42 : 0,
      bearing: mode === '3D' ? -8 : 0,
      projection: 'mercator',
      antialias: true,
      attributionControl: false,
    });

    instance.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    instance.on('load', () => {
      instance.addSource('meghnetra-terrain', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
      instance.setTerrain({ source: 'meghnetra-terrain', exaggeration: 1.12 });

      if (!instance.getSource('meghnetra-events')) {
        instance.addSource('meghnetra-events', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: events.map(event => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: coords[event.city] ?? [78.9629, 20.5937] },
              properties: {
                id: event.id,
                severity: event.severity,
                confidence: event.confidence,
                city: event.city,
                rain: event.rain,
                temp: event.temp,
                humidity: event.humidity,
                wind: Math.max(1, event.rain * 1.8),
                cloud: Math.min(100, event.humidity + 8),
                visibility: Math.max(1, 12 - event.rain * 0.8),
              },
            })),
          },
        });

        instance.addLayer({
          id: 'meghnetra-weather-field',
          type: 'heatmap',
          source: 'meghnetra-events',
          maxzoom: 9,
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'rain'], 0, 0, 8, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 0.65, 9, 1.5],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 22, 9, 46],
            'heatmap-opacity': 0.58,
            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,80,255,0)', 0.25, '#00b7ff', 0.5, '#1ee5b5', 0.72, '#ffe44d', 0.9, '#ff8a32', 1, '#ff3b61'],
          },
        });

        instance.addLayer({
          id: 'meghnetra-event-glow',
          type: 'circle',
          source: 'meghnetra-events',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 10, 9, 17],
            'circle-color': [
              'match', ['get', 'severity'],
              'High', '#ff5266',
              'Medium', '#ffc04f',
              '#25c8ff',
            ],
            'circle-opacity': 0.18,
            'circle-blur': 1,
          },
        });

        instance.addLayer({
          id: 'meghnetra-event-core',
          type: 'circle',
          source: 'meghnetra-events',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3.5, 9, 7],
            'circle-color': [
              'match', ['get', 'severity'],
              'High', '#ff6673',
              'Medium', '#ffbf52',
              '#24c8ff',
            ],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#e9faff',
          },
        });

        instance.addLayer({
          id: 'meghnetra-event-label',
          type: 'symbol',
          source: 'meghnetra-events',
          layout: {
            'text-field': ['get', 'city'],
            'text-size': 10,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#ccefff',
            'text-halo-color': '#03101b',
            'text-halo-width': 1.5,
          },
        });

        if (!instance.getLayer('3d-buildings')) {
          instance.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 11,
            filter: ['==', ['get', 'extrude'], 'true'],
            paint: {
              'fill-extrusion-color': '#0d5d83',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.72,
              'fill-extrusion-vertical-gradient': true,
            },
          });
        }
      }
    });

    instance.on('click', 'meghnetra-event-core', event => {
      const id = event.features?.[0]?.properties?.id;
      const match = events.find(item => item.id === id);
      if (match) onSelect(match);
    });

    map.current = instance;
    return () => {
      markerRefs.current.forEach(marker => marker.remove());
      markerRefs.current = [];
      instance.remove();
      map.current = null;
    };
  }, [events, onSelect]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const target = coords[selected.city] ?? [78.9629, 20.5937];
    instance.easeTo({
      center: target,
      zoom: mode === '3D' ? 11.6 : 4.25,
      pitch: mode === '3D' ? 58 : 0,
      bearing: mode === '3D' ? -18 : 0,
      duration: 1100,
      essential: true,
    });

    if (instance.getLayer('3d-buildings')) {
      instance.setLayoutProperty('3d-buildings', 'visibility', mode === '3D' ? 'visible' : 'none');
    }
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'meghnetra-selected-marker';
    marker.setAttribute('aria-label', `Selected event: ${selected.city}`);
    marker.innerHTML = '<span class="marker-ring"></span><span class="marker-ring ring-2"></span><span class="marker-core"></span><span class="marker-label"></span>';
    const label = marker.querySelector('.marker-label');
    if (label) label.textContent = `${selected.type} · ${selected.confidence}%`;
    marker.addEventListener('click', () => onSelect(selected));
    const selectedMarker = new mapboxgl.Marker({element: marker, anchor: 'center'}).setLngLat(target).addTo(instance);
    markerRefs.current.push(selectedMarker);
  }, [selected, mode, onSelect]);


  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const source = instance.getSource('meghnetra-events') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    const max = layer === 'rainfall' ? 8 : layer === 'temperature' ? 40 : layer === 'humidity' ? 100 : layer === 'visibility' ? 12 : 100;
    const features = events.map(event => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: coords[event.city] ?? [78.9629, 20.5937] },
      properties: {
        id: event.id, severity: event.severity, confidence: event.confidence, city: event.city,
        rain: event.rain, temp: event.temp, humidity: event.humidity,
        wind: Math.max(1, event.rain * 1.8), cloud: Math.min(100, event.humidity + 8),
        visibility: Math.max(1, 12 - event.rain * 0.8),
      },
    }));
    source.setData({ type: 'FeatureCollection', features });
    if (instance.getLayer('meghnetra-weather-field')) {
      const field = layer === 'temperature' ? 'temp' : layer === 'humidity' ? 'humidity' : layer === 'visibility' ? 'visibility' : layer === 'wind' ? 'wind' : layer === 'cloud' ? 'cloud' : 'rain';
      const min = field === 'visibility' ? 1 : 0;
      instance.setPaintProperty('meghnetra-weather-field', 'heatmap-weight', ['interpolate', ['linear'], ['get', field], min, 0, max, 1]);
    }
  }, [layer, events]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    if (instance.getLayer('3d-buildings')) {
      instance.setLayoutProperty('3d-buildings', 'visibility', mode === '3D' ? 'visible' : 'none');
    }
    if (mode === '3D') instance.setTerrain({ source: 'meghnetra-terrain', exaggeration: 1.12 });
  }, [mode]);

  return <div className="interactive-map">
    <div ref={container} className="mapbox-canvas" />
    {!token && (
      <div className="map-engine-notice">
        <strong>MAP ENGINE READY</strong>
        <span>Set NEXT_PUBLIC_MAPBOX_TOKEN to activate live 2D + extruded 3D buildings.</span>
      </div>
    )}
    <div className="map-layer-badge">LAYER <b>{layer.toUpperCase()}</b></div>
  </div>;
}
