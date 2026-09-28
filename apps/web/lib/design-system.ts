export const meghnetraDesign = {
  colors: {
    space: '#02070D',
    surface: '#07121D',
    surfaceElevated: '#0B1825',
    cyan: '#24C8FF',
    blue: '#287BFF',
    green: '#35DF9A',
    amber: '#FFBF52',
    red: '#FF6673',
    violet: '#9A7CFF',
  },
  motion: { fast: 140, normal: 220, slow: 420, ambient: 5000 },
  radii: { panel: 18, control: 10, pill: 999 },
} as const;

export type WeatherSemantic =
  | 'rain' | 'temperature' | 'wind' | 'warning'
  | 'critical' | 'verified' | 'review';
