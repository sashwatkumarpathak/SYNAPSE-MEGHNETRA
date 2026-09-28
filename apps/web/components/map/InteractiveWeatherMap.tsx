'use client';

import { useEffect, useMemo, useRef } from 'react';
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

const windByCity: Record<string, { speed: number; gust: number; direction: number; cardinal: string }> = {
  Visakhapatnam: { speed: 18.6, gust: 27.4, direction: 68, cardinal: 'ENE' },
  Mumbai: { speed: 14.2, gust: 21.8, direction: 224, cardinal: 'SW' },
  Kolkata: { speed: 21.7, gust: 31.2, direction: 154, cardinal: 'SSE' },
  Jaipur: { speed: 11.8, gust: 18.5, direction: 312, cardinal: 'NW' },
  Delhi: { speed: 13.4, gust: 19.7, direction: 292, cardinal: 'WNW' },
  Guwahati: { speed: 16.1, gust: 24.6, direction: 92, cardinal: 'E' },
};

const layerConfig = {
  rainfall: { field: 'rain', min: 0, max: 10, unit: 'mm/h', label: 'RAINFALL INTENSITY' },
  temperature: { field: 'temp', min: 10, max: 45, unit: '°C', label: 'TEMPERATURE' },
  wind: { field: 'wind', min: 0, max: 40, unit: 'km/h', label: 'WIND SPEED' },
  humidity: { field: 'humidity', min: 0, max: 100, unit: '%', label: 'RELATIVE HUMIDITY' },
  cloud: { field: 'cloud', min: 0, max: 100, unit: '%', label: 'CLOUD COVER' },
  visibility: { field: 'visibility', min: 1, max: 12, unit: 'km', label: 'VISIBILITY' },
} as const;

type FieldPoint = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    rain: number;
    temp: number;
    humidity: number;
    wind: number;
    cloud: number;
    visibility: number;
    direction: number;
  };
};

function buildWeatherField(events: WeatherEvent[]): FieldPoint[] {
  const points: FieldPoint[] = [];
  for (let lat = 8; lat <= 35; lat += 1.35) {
    for (let lng = 68; lng <= 97; lng += 1.35) {
      let rain = 0.55 + 1.2 * Math.max(0, Math.sin((lng - 68) / 4.2));
      let temp = 32 - (lat - 8) * 0.38;
      let humidity = 57 + 18 * Math.sin((lng + lat) / 8);
      let wind = 9 + 5 * Math.sin((lng - 70) / 4) + 3 * Math.cos(lat / 5);
      let direction = 55 + 34 * Math.sin((lng + lat) / 9);

      events.forEach(event => {
        const [eLng, eLat] = coords[event.city] ?? [78.9629, 20.5937];
        const dx = (lng - eLng) * Math.cos((lat * Math.PI) / 180);
        const dy = lat - eLat;
        const influence = Math.exp(-(dx * dx + dy * dy) / 45);
        rain += event.rain * influence;
        temp += (event.temp - 30) * influence * 0.7;
        humidity += (event.humidity - 65) * influence * 0.55;
        wind += (windByCity[event.city]?.speed ?? 12) * influence * 0.16;
        direction = (direction + (windByCity[event.city]?.direction ?? 90) * influence * 0.5) / (1 + influence * 0.5);
      });

      points.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          rain: Math.min(10, Math.max(0, rain)),
          temp: Math.min(45, Math.max(10, temp)),
          humidity: Math.min(100, Math.max(0, humidity)),
          wind: Math.min(40, Math.max(2, wind)),
          cloud: Math.min(100, Math.max(5, humidity + 6)),
          visibility: Math.min(12, Math.max(1, 13 - rain * 0.75)),
          direction: (direction + 360) % 360,
        },
      });
    }
  }
  return points;
}

function buildWindVectors(events: WeatherEvent[]) {
  const vectors = buildWeatherField(events).filter((_, index) => index % 3 === 0).map(point => {
    const [lng, lat] = point.geometry.coordinates;
    const direction = point.properties.direction * Math.PI / 180;
    const length = 0.34;
    const end: [number, number] = [
      lng + Math.sin(direction) * length,
      lat + Math.cos(direction) * length,
    ];
    return {
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: [[lng, lat], end] },
      properties: { direction: point.properties.direction, speed: point.properties.wind },
    };
  });
  return { type: 'FeatureCollection' as const, features: vectors };
}

function windFor(event: WeatherEvent) {
  return windByCity[event.city] ?? { speed: 12, gust: 18, direction: 90, cardinal: 'E' };
}

export function InteractiveWeatherMap({ events, selected, mode, layer, onSelect }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const windCanvas = useRef<HTMLCanvasElement | null>(null);
  const weatherField = useMemo(() => buildWeatherField(events), [events]);
  const windVectors = useMemo(() => buildWindVectors(events), [events]);
  const selectedWind = windFor(selected);

  useEffect(() => {
    if (!container.current || !token) return;

    mapboxgl.accessToken = token;
    const initial = coords[selected.city] ?? [78.9629, 20.5937];

    const instance = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: 'monochrome',
          lightPreset: 'night',
          show3dObjects: mode === '3D',
          showPointOfInterestLabels: true,
          showTransitLabels: false,
        },
      },
      center: initial,
      zoom: 4.25,
      pitch: 0,
      bearing: 0,
      projection: 'mercator',
      antialias: true,
      attributionControl: { compact: true },
    });

    instance.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'bottom-right');

    instance.on('load', () => {
      instance.addSource('meghnetra-terrain', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      instance.setTerrain({ source: 'meghnetra-terrain', exaggeration: 1.08 });

      instance.addSource('meghnetra-field', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: weatherField },
      });

      instance.addSource('meghnetra-wind-vectors', {
        type: 'geojson',
        data: windVectors,
      });

      instance.addSource('meghnetra-events', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: events.map(event => ({
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: coords[event.city] ?? [78.9629, 20.5937] },
            properties: {
              id: event.id,
              severity: event.severity,
              confidence: event.confidence,
              city: event.city,
              rain: event.rain,
              temp: event.temp,
              humidity: event.humidity,
              wind: windFor(event).speed,
              cloud: Math.min(100, event.humidity + 8),
              visibility: Math.max(1, 12 - event.rain * 0.8),
            },
          })),
        },
      });

      instance.addLayer({
        id: 'meghnetra-weather-field',
        type: 'heatmap',
        source: 'meghnetra-field',
        slot: 'bottom',
        maxzoom: 9,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'rain'], 0, 0, 10, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 0.72, 7, 1.18, 9, 1.55],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 22, 7, 34, 9, 48],
          'heatmap-opacity': 0.62,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,70,255,0)',
            0.16, '#164fff',
            0.34, '#00b9ff',
            0.52, '#21e0b1',
            0.68, '#e8ed55',
            0.82, '#ffad3d',
            0.93, '#ff5c48',
            1, '#ff2e68',
          ],
        },
      });

      instance.addLayer({
        id: 'meghnetra-wind-vectors',
        type: 'line',
        source: 'meghnetra-wind-vectors',
        slot: 'top',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#7ee8ff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.7, 8, 1.35, 13, 2],
          'line-opacity': 0.72,
          'line-dasharray': [0.25, 1.4],
        },
      });

      instance.addLayer({
        id: 'meghnetra-wind-arrows',
        type: 'symbol',
        source: 'meghnetra-wind-vectors',
        slot: 'top',
        minzoom: 4,
        layout: {
          'text-field': '➜',
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 8, 9, 12],
          'text-rotate': ['get', 'direction'],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#9befff',
          'text-halo-color': '#03101b',
          'text-halo-width': 1.5,
          'text-opacity': ['case', ['==', layer, 'wind'], 0.9, 0.22],
        },
      });

      instance.addLayer({
        id: 'meghnetra-event-glow',
        type: 'circle',
        source: 'meghnetra-events',
        slot: 'top',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 10, 9, 17, 14, 25],
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
        slot: 'top',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3.5, 9, 7, 14, 10],
          'circle-color': [
            'match', ['get', 'severity'],
            'High', '#ff6673',
            'Medium', '#ffbf52',
            '#24c8ff',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#e9faff',
          'circle-emissive-strength': 1,
        },
      });

      instance.addLayer({
        id: 'meghnetra-event-label',
        type: 'symbol',
        source: 'meghnetra-events',
        slot: 'top',
        layout: {
          'text-field': ['concat', ['get', 'city'], '  ·  ', ['to-string', ['get', 'confidence']], '%'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 9, 9, 11, 14, 13],
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#d8f5ff',
          'text-halo-color': '#020b13',
          'text-halo-width': 1.8,
          'text-emissive-strength': 1,
        },
      });
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
  }, [events, onSelect, weatherField, windVectors]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const target = coords[selected.city] ?? [78.9629, 20.5937];
    instance.easeTo({
      center: target,
      zoom: mode === '3D' ? 13.2 : 4.9,
      pitch: mode === '3D' ? 61 : 0,
      bearing: mode === '3D' ? -18 : 0,
      duration: 1100,
      essential: true,
    });

    const setConfig = (instance as mapboxgl.Map & {
      setConfigProperty?: (importId: string, property: string, value: unknown) => void;
    }).setConfigProperty;
    setConfig?.call(instance, 'basemap', 'show3dObjects', mode === '3D');

    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'meghnetra-selected-marker';
    marker.setAttribute('aria-label', \`Selected event: \${selected.city}\`);
    marker.innerHTML = '<span class="marker-ring"></span><span class="marker-ring ring-2"></span><span class="marker-core"></span><span class="marker-label"></span>';
    const label = marker.querySelector('.marker-label');
    if (label) label.textContent = \`\${selected.type} · \${selected.confidence}%\`;
    marker.addEventListener('click', () => onSelect(selected));

    const selectedMarker = new mapboxgl.Marker({
      element: marker,
      anchor: 'center',
    }).setLngLat(target).addTo(instance);
    markerRefs.current.push(selectedMarker);
  }, [selected, mode, onSelect]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const source = instance.getSource('meghnetra-field') as mapboxgl.GeoJSONSource | undefined;
    const windSource = instance.getSource('meghnetra-wind-vectors') as mapboxgl.GeoJSONSource | undefined;
    if (!source || !windSource) return;

    source.setData({ type: 'FeatureCollection', features: weatherField });
    windSource.setData(windVectors);

    const config = layerConfig[layer];
    if (instance.getLayer('meghnetra-weather-field')) {
      instance.setPaintProperty(
        'meghnetra-weather-field',
        'heatmap-weight',
        ['interpolate', ['linear'], ['get', config.field], config.min, 0, config.max, 1],
      );
    }
    if (instance.getLayer('meghnetra-wind-arrows')) {
      instance.setPaintProperty(
        'meghnetra-wind-arrows',
        'text-opacity',
        layer === 'wind' ? 0.95 : 0.2,
      );
    }
  }, [layer, weatherField, windVectors]);

  useEffect(() => {
    const canvas = windCanvas.current;
    const instance = map.current;
    if (!canvas || !instance) return;

    let frame = 0;
    let running = true;
    const particles = Array.from({ length: 90 }, (_, index) => ({
      seed: index * 17.371,
      progress: (index * 0.071) % 1,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    const draw = (time: number) => {
      if (!running) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (layer === 'wind') {
        ctx.lineCap = 'round';
        particles.forEach((particle, index) => {
          const t = ((time * 0.000025 * (1 + (index % 5) * 0.12)) + particle.progress) % 1;
          const lng = 68 + ((particle.seed * 1.7 + t * 29) % 29);
          const lat = 8 + ((particle.seed * 0.83 + Math.sin(t * Math.PI * 2 + particle.seed) * 2.5) % 27);
          const wind = 8 + 8 * Math.abs(Math.sin((lng + lat) / 7));
          const dir = (58 + 38 * Math.sin((lng + lat) / 9)) * Math.PI / 180;
          const nextLng = lng + Math.sin(dir) * 0.28;
          const nextLat = lat + Math.cos(dir) * 0.28;

          const a = instance.project([lng, lat]);
          const b = instance.project([nextLng, nextLat]);
          const alpha = 0.18 + Math.min(0.55, wind / 20);
          ctx.strokeStyle = \`rgba(126, 232, 255, \${alpha})\`;
          ctx.lineWidth = 1 + wind / 22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    instance.on('move', resize);
    instance.on('resize', resize);
    frame = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      instance.off('move', resize);
      instance.off('resize', resize);
    };
  }, [layer]);

  return (
    <div className="interactive-map">
      <div ref={container} className="mapbox-canvas" />
      <canvas ref={windCanvas} className="wind-particle-canvas" aria-hidden="true" />
      {!token && (
        <div className="map-engine-notice">
          <strong>MAP ENGINE READY</strong>
          <span>Set NEXT_PUBLIC_MAPBOX_TOKEN to activate the national 2D/3D weather engine.</span>
        </div>
      )}
      <div className="map-layer-badge">
        <span>{layerConfig[layer].label}</span>
        <b>{layerConfig[layer].unit}</b>
      </div>
      <div className="map-data-strip">
        <span><i className="live-dot" /> DEMO WEATHER FIELD</span>
        <span>06:00–13:30 IST</span>
        <span>{mode === '3D' ? '3D TERRAIN + CITY MODEL' : 'NATIONAL 2D FIELD'}</span>
      </div>
      {layer === 'wind' && (
        <div className="wind-intel-card">
          <div className="wind-intel-head">
            <span>WIND VECTOR</span>
            <b>10 m AGL</b>
          </div>
          <strong>{selectedWind.speed.toFixed(1)} <small>km/h</small></strong>
          <div className="wind-direction">
            <span style={{ transform: \`rotate(\${selectedWind.direction}deg)\` }}>↑</span>
            <div><b>{selectedWind.cardinal}</b><small>{selectedWind.direction}° · gust {selectedWind.gust.toFixed(1)} km/h</small></div>
          </div>
          <em>Synthetic prototype field · ready for real wind raster adapter</em>
        </div>
      )}
    </div>
  );
}
