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

type WeatherSample = {
  rain: number;
  temp: number;
  humidity: number;
  wind: number;
  cloud: number;
  visibility: number;
  direction: number;
};

// Simplified India field boundary used only for the demo raster mask.
// Production weather data will arrive as a provider-backed raster/grid and use
// the same renderer, so the visual contract does not change.
const INDIA_FIELD_BOUNDARY: [number, number][] = [
  [68.0, 23.8], [68.8, 22.0], [70.0, 20.8], [71.4, 20.0], [72.6, 18.5],
  [73.6, 16.2], [74.2, 14.2], [75.1, 11.8], [76.3, 9.0], [77.4, 8.0],
  [79.0, 9.1], [80.5, 11.8], [82.1, 14.0], [84.0, 16.0], [86.0, 18.2],
  [88.0, 20.2], [89.5, 21.5], [91.0, 22.4], [92.0, 21.8], [92.8, 23.0],
  [93.7, 24.4], [95.0, 26.0], [96.3, 27.3], [97.4, 28.4], [96.2, 29.1],
  [94.7, 28.7], [93.2, 28.0], [91.8, 27.2], [90.6, 28.1], [89.2, 29.1],
  [87.6, 28.7], [85.8, 27.7], [84.0, 27.2], [82.3, 28.0], [80.8, 30.0],
  [79.2, 31.8], [77.5, 34.0], [76.0, 36.1], [74.3, 36.7], [72.8, 35.0],
  [71.0, 32.5], [69.8, 29.8], [68.8, 27.0], [68.0, 23.8],
];

function pointInIndia(lng: number, lat: number) {
  let inside = false;
  for (let i = 0, j = INDIA_FIELD_BOUNDARY.length - 1; i < INDIA_FIELD_BOUNDARY.length; j = i++) {
    const [xi, yi] = INDIA_FIELD_BOUNDARY[i];
    const [xj, yj] = INDIA_FIELD_BOUNDARY[j];
    const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function clampBounds(bounds?: mapboxgl.LngLatBounds) {
  if (!bounds) return { west: 68, south: 8, east: 97, north: 37 };
  const b = bounds;
  return {
    west: Math.max(67.5, b.getWest() - 0.08),
    south: Math.max(7, b.getSouth() - 0.08),
    east: Math.min(98, b.getEast() + 0.08),
    north: Math.min(37, b.getNorth() + 0.08),
  };
}

function sampleWeather(lng: number, lat: number, events: WeatherEvent[]): WeatherSample {
  // Smooth low-amplitude background: this deliberately avoids a saturated
  // national-wide color so the event field is spatially meaningful.
  let rain = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin((lng - 70) / 5.4 + Math.sin(lat / 7)));
  let temp = 32 - (lat - 8) * 0.38 + 1.5 * Math.sin(lng / 7);
  let humidity = 57 + 14 * Math.sin((lng + lat) / 8.5);
  let wind = 8 + 3.5 * Math.sin((lng - 70) / 4.8) + 2 * Math.cos(lat / 5.5);
  let direction = 55 + 34 * Math.sin((lng + lat) / 9.5);

  events.forEach(event => {
    const [eLng, eLat] = coords[event.city] ?? [78.9629, 20.5937];
    const dx = (lng - eLng) * Math.cos((lat * Math.PI) / 180);
    const dy = lat - eLat;
    // Localized Gaussian influence. Unlike the previous heatmap-density
    // renderer, this changes the actual weather value, not point density.
    const influence = Math.exp(-(dx * dx + dy * dy) / 1.8);

    rain += Math.max(0, event.rain) * influence;
    temp += (event.temp - 30) * influence * 0.72;
    humidity += (event.humidity - 65) * influence * 0.62;
    wind += (windByCity[event.city]?.speed ?? 12) * influence * 0.18;
    direction =
      (direction + (windByCity[event.city]?.direction ?? 90) * influence * 0.5) /
      (1 + influence * 0.5);
  });

  return {
    rain: Math.min(10, Math.max(0, rain)),
    temp: Math.min(45, Math.max(10, temp)),
    humidity: Math.min(100, Math.max(0, humidity)),
    wind: Math.min(40, Math.max(2, wind)),
    cloud: Math.min(100, Math.max(5, humidity + 6)),
    visibility: Math.min(12, Math.max(1, 13 - rain * 0.75)),
    direction: (direction + 360) % 360,
  };
}

function rasterSize(zoom: number) {
  if (zoom < 6) return 280;
  if (zoom < 9) return 336;
  if (zoom < 12) return 384;
  if (zoom < 15) return 448;
  return 512;
}

function mercatorY(lat: number) {
  const rad = (lat * Math.PI) / 180;
  return 0.5 - Math.log((1 + Math.sin(rad)) / (1 - Math.sin(rad))) / (4 * Math.PI);
}

function latitudeFromMercator(y: number) {
  return (Math.atan(Math.sinh((0.5 - y) * 2 * Math.PI)) * 180) / Math.PI;
}

function interpolateColor(
  value: number,
  config: (typeof layerConfig)[keyof typeof layerConfig],
) {
  const normalized = Math.max(0, Math.min(1, (value - config.min) / (config.max - config.min)));
  const stops = [
    [0.00, [36, 105, 255]],
    [0.22, [34, 198, 255]],
    [0.43, [44, 225, 177]],
    [0.62, [231, 235, 86]],
    [0.78, [255, 175, 63]],
    [0.91, [255, 91, 70]],
    [1.00, [255, 48, 101]],
  ] as const;

  let left = stops[0];
  let right = stops[stops.length - 1];
  for (let i = 1; i < stops.length; i++) {
    if (normalized <= stops[i][0]) {
      left = stops[i - 1];
      right = stops[i];
      break;
    }
  }

  const span = Math.max(0.0001, right[0] - left[0]);
  const t = (normalized - left[0]) / span;
  const eased = t * t * (3 - 2 * t);
  const rgb = left[1].map((channel, index) => Math.round(channel + (right[1][index] - channel) * eased));

  // Keep weak/background values atmospheric and let stronger values carry the
  // visual signal. This is intentionally much softer than the old density map.
  const alpha = normalized < 0.04
    ? 0
    : Math.min(0.66, 0.055 + Math.pow(normalized, 1.35) * 0.64);

  return [rgb[0], rgb[1], rgb[2], Math.round(alpha * 255)] as const;
}

function renderWeatherRaster(
  canvas: HTMLCanvasElement,
  bounds: { west: number; south: number; east: number; north: number },
  events: WeatherEvent[],
  layer: keyof typeof layerConfig,
  zoom: number,
) {
  const size = rasterSize(zoom);
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return;

  const image = ctx.createImageData(size, size);
  const data = image.data;
  const config = layerConfig[layer];
  const northY = mercatorY(bounds.north);
  const southY = mercatorY(bounds.south);

  for (let py = 0; py < size; py++) {
    const y = py / Math.max(1, size - 1);
    const mercator = northY + (southY - northY) * y;
    const lat = latitudeFromMercator(mercator);

    for (let px = 0; px < size; px++) {
      const x = px / Math.max(1, size - 1);
      const lng = bounds.west + (bounds.east - bounds.west) * x;
      const index = (py * size + px) * 4;

      if (!pointInIndia(lng, lat)) {
        data[index + 3] = 0;
        continue;
      }

      const sample = sampleWeather(lng, lat, events);
      const value = sample[config.field as keyof WeatherSample] as number;
      const [r, g, b, a] = interpolateColor(value, config);

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = a;
    }
  }

  ctx.putImageData(image, 0, 0);
}

function windFor(event: WeatherEvent) {
  return windByCity[event.city] ?? { speed: 12, gust: 18, direction: 90, cardinal: 'E' };
}

function windVector(lng: number, lat: number, events: WeatherEvent[]) {
  let speed = 10 + 4 * Math.sin((lng - 70) / 4) + 2.5 * Math.cos(lat / 5);
  let direction = 55 + 34 * Math.sin((lng + lat) / 9);

  events.forEach(event => {
    const [eLng, eLat] = coords[event.city] ?? [78.9629, 20.5937];
    const dx = (lng - eLng) * Math.cos((lat * Math.PI) / 180);
    const dy = lat - eLat;
    const influence = Math.exp(-(dx * dx + dy * dy) / 45);
    speed += (windByCity[event.city]?.speed ?? 12) * influence * 0.16;
    direction =
      (direction + (windByCity[event.city]?.direction ?? 90) * influence * 0.5) /
      (1 + influence * 0.5);
  });

  const radians = ((direction + 360) % 360) * Math.PI / 180;
  return {
    speed: Math.max(2, Math.min(40, speed)),
    direction: (direction + 360) % 360,
    u: Math.sin(radians),
    v: Math.cos(radians),
  };
}

function particleCount(zoom: number) {
  if (zoom < 5.5) return 55;
  if (zoom < 7) return 80;
  if (zoom < 8.5) return 110;
  if (zoom < 10) return 145;
  if (zoom < 11.5) return 190;
  if (zoom < 13) return 250;
  return 320;
}

export function InteractiveWeatherMap({ events, selected, mode, layer, onSelect }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const windCanvas = useRef<HTMLCanvasElement | null>(null);
  const weatherRasterCanvas = useRef<HTMLCanvasElement | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const selectedWind = windFor(selected);
  const layerRef = useRef(layer);
  layerRef.current = layer;

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
      zoom: 5.35,
      pitch: 0,
      bearing: 0,
      projection: 'mercator',
      antialias: true,
      attributionControl: false,
    });

    instance.addControl(
      new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }),
      'bottom-right',
    );

    instance.on('load', () => {
      instance.addSource('meghnetra-terrain', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      instance.setTerrain({ source: 'meghnetra-terrain', exaggeration: 1.08 });

      // Mapbox's country polygons provide the real basemap context.
      // The weather raster itself is independently clipped to the demo India field.
      instance.addSource('meghnetra-countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });

      const rasterCanvas = document.createElement('canvas');
      rasterCanvas.setAttribute('aria-hidden', 'true');
      weatherRasterCanvas.current = rasterCanvas;

      instance.addSource('meghnetra-weather-raster', {
        type: 'image',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        coordinates: [
          [67.5, 37],
          [98, 37],
          [98, 7],
          [67.5, 7],
        ],
      });

      instance.addSource('meghnetra-events', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: events.map(event => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: coords[event.city] ?? [78.9629, 20.5937],
            },
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
        id: 'meghnetra-outside-india',
        type: 'fill',
        source: 'meghnetra-countries',
        'source-layer': 'country_boundaries',
        slot: 'middle',
        minzoom: 0,
        maxzoom: 22,
        filter: ['all',
          ['!=', ['get', 'iso_3166_1'], 'IN'],
          ['==', ['get', 'disputed'], 'false'],
        ],
        paint: {
          'fill-color': '#02070d',
          'fill-opacity': 0.48,
        },
      });

      instance.addLayer({
        id: 'meghnetra-india-outline',
        type: 'line',
        source: 'meghnetra-countries',
        'source-layer': 'country_boundaries',
        slot: 'top',
        minzoom: 0,
        maxzoom: 22,
        filter: ['all',
          ['==', ['get', 'iso_3166_1'], 'IN'],
          ['any',
            ['==', ['get', 'worldview'], 'all'],
            ['in', 'IN', ['get', 'worldview']],
          ],
        ],
        paint: {
          'line-color': '#55dfff',
          'line-opacity': 0.34,
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.7, 9, 1.2, 16, 1.8],
        },
      });

      instance.addLayer({
        id: 'meghnetra-weather-raster',
        type: 'raster',
        source: 'meghnetra-weather-raster',
        slot: 'bottom',
        paint: {
          'raster-opacity': 0.58,
          'raster-fade-duration': 0,
          'raster-resampling': 'linear',
          'raster-emissive-strength': 0.28,
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
            'match',
            ['get', 'severity'],
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
            'match',
            ['get', 'severity'],
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

      const refreshWeatherRaster = () => {
        const source = instance.getSource('meghnetra-weather-raster') as mapboxgl.ImageSource | undefined;
        const canvas = weatherRasterCanvas.current;
        if (!source || !canvas) return;

        const bounds = clampBounds(instance.getBounds() ?? undefined);
        renderWeatherRaster(
          canvas,
          bounds,
          eventsRef.current,
          layerRef.current,
          instance.getZoom(),
        );

        source.updateImage({
          url: canvas.toDataURL('image/png'),
          coordinates: [
            [bounds.west, bounds.north],
            [bounds.east, bounds.north],
            [bounds.east, bounds.south],
            [bounds.west, bounds.south],
          ],
        });
      };

      let refreshTimer: number | undefined;
      const scheduleRefresh = () => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(refreshWeatherRaster, 90);
      };

      instance.on('zoom', scheduleRefresh);
      instance.on('move', scheduleRefresh);
      instance.on('zoomend', scheduleRefresh);
      instance.on('moveend', scheduleRefresh);
      refreshWeatherRaster();

      instance.once('remove', () => {
        window.clearTimeout(refreshTimer);
        weatherRasterCanvas.current = null;
        instance.off('zoom', scheduleRefresh);
        instance.off('move', scheduleRefresh);
        instance.off('zoomend', scheduleRefresh);
        instance.off('moveend', scheduleRefresh);
      });
    });

    instance.on('click', 'meghnetra-event-core', event => {
      const feature = event.features?.[0] as { properties?: { id?: string } } | undefined;
      const id = feature?.properties?.id;
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
      zoom: mode === '3D' ? 13.2 : 5.35,
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
    marker.setAttribute('aria-label', `Selected event: ${selected.city}`);
    marker.innerHTML =
      '<span class="marker-ring"></span><span class="marker-ring ring-2"></span><span class="marker-core"></span><span class="marker-label"></span>';
    const label = marker.querySelector('.marker-label');
    if (label) label.textContent = `${selected.type} · ${selected.confidence}%`;
    marker.addEventListener('click', () => onSelect(selected));

    const selectedMarker = new mapboxgl.Marker({
      element: marker,
      anchor: 'center',
    })
      .setLngLat(target)
      .addTo(instance);
    markerRefs.current.push(selectedMarker);
  }, [selected, mode, onSelect]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    layerRef.current = layer;
    const source = instance.getSource('meghnetra-weather-raster') as mapboxgl.ImageSource | undefined;
    const canvas = weatherRasterCanvas.current;
    if (!source || !canvas) return;

    const bounds = clampBounds(instance.getBounds() ?? undefined);
    renderWeatherRaster(canvas, bounds, eventsRef.current, layer, instance.getZoom());
    source.updateImage({
      url: canvas.toDataURL('image/png'),
      coordinates: [
        [bounds.west, bounds.north],
        [bounds.east, bounds.north],
        [bounds.east, bounds.south],
        [bounds.west, bounds.south],
      ],
    });
  }, [layer]);

  useEffect(() => {
    const canvas = windCanvas.current;
    const instance = map.current;
    if (!canvas || !instance) return;

    let frame = 0;
    let running = true;
    let lastTime = 0;
    let particles: Array<{ lng: number; lat: number; age: number; life: number; seed: number }> = [];

    const hash = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    const resetParticle = (index: number, bounds: mapboxgl.LngLatBounds) => {
      const seed = index * 31.731 + instance.getZoom() * 7.17;
      return {
        lng: bounds.getWest() + hash(seed) * (bounds.getEast() - bounds.getWest()),
        lat: bounds.getSouth() + hash(seed + 9.31) * (bounds.getNorth() - bounds.getSouth()),
        age: hash(seed + 3.7),
        life: 0.65 + hash(seed + 6.4) * 1.6,
        seed,
      };
    };

    const syncParticleDensity = () => {
      const target = particleCount(instance.getZoom());
      const bounds = instance.getBounds();
      if (!bounds) return;
      while (particles.length < target) {
        particles.push(resetParticle(particles.length, bounds));
      }
      if (particles.length > target) particles.length = target;
    };

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
        const bounds = instance.getBounds();
        if (!bounds) return;
        const dt = Math.min(0.032, Math.max(0.008, (time - lastTime) / 1000 || 0.016));
        lastTime = time;

        particles.forEach((particle, index) => {
          const vector = windVector(particle.lng, particle.lat, eventsRef.current);
          const motion = Math.max(0.000025, Math.min(0.000095, vector.speed / 420000));
          particle.lng += vector.u * motion * dt * 60;
          particle.lat += vector.v * motion * dt * 60;
          particle.age += dt / particle.life;

          if (
            particle.age > 1 ||
            particle.lng < bounds.getWest() - 0.2 ||
            particle.lng > bounds.getEast() + 0.2 ||
            particle.lat < bounds.getSouth() - 0.2 ||
            particle.lat > bounds.getNorth() + 0.2
          ) {
            particles[index] = resetParticle(index, bounds);
            return;
          }

          const trailScale = Math.max(0.006, Math.min(0.018, vector.speed / 2600));
          const tailLng = particle.lng - vector.u * trailScale;
          const tailLat = particle.lat - vector.v * trailScale;

          const a = instance.project([tailLng, tailLat]);
          const b = instance.project([particle.lng, particle.lat]);

          const lifeFade = Math.sin(Math.min(1, particle.age) * Math.PI);
          const alpha = (0.10 + Math.min(0.22, vector.speed / 150)) * lifeFade;

          const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          gradient.addColorStop(0, 'rgba(115, 231, 255, 0)');
          gradient.addColorStop(0.45, `rgba(115, 231, 255, ${alpha * 0.55})`);
          gradient.addColorStop(1, `rgba(180, 244, 255, ${alpha})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = instance.getZoom() > 11 ? 1 : 0.7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      }

      frame = requestAnimationFrame(draw);
    };

    syncParticleDensity();
    resize();
    window.addEventListener('resize', resize);
    instance.on('resize', resize);
    instance.on('zoomend', syncParticleDensity);
    instance.on('moveend', syncParticleDensity);
    frame = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      instance.off('resize', resize);
      instance.off('zoomend', syncParticleDensity);
      instance.off('moveend', syncParticleDensity);
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

      <div className="map-data-strip"><span className="map-view-state">{mode === '3D' ? '● TRUE 3D TERRAIN + CITY BUILDINGS' : '● 2D WEATHER FIELD'}</span>
        <span><i className="live-dot" /> DEMO WEATHER FIELD</span>
        <span>06:00–13:30 IST</span>
        <span>{mode === '3D' ? '3D TERRAIN + CITY MODEL' : 'NATIONAL 2D FIELD'}</span>
      </div>

      {layer === 'wind' && (
        <div className="wind-intel-card">
          <div className="wind-intel-head">
            <span>WIND FIELD</span>
            <b>10 m AGL</b>
          </div>
          <strong>{selectedWind.speed.toFixed(1)} <small>km/h</small></strong>
          <div className="wind-direction">
            <span style={{ transform: `rotate(${selectedWind.direction}deg)` }}>↑</span>
            <div>
              <b>{selectedWind.cardinal}</b>
              <small>{selectedWind.direction}° · gust {selectedWind.gust.toFixed(1)} km/h</small>
            </div>
          </div>
          <em>Flow density increases continuously with zoom.</em>
        </div>
      )}
    </div>
  );
}
