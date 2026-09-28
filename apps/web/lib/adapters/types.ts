import type { WeatherEvent } from '@/lib/demo-data';

export type MeghnetraSnapshot = {
  events: WeatherEvent[];
  activeEvents: number;
  verifiedSignals: number;
  underReview: number;
  regionsCovered: number;
  sourcesConnected: number;
};

export interface MeghnetraDataAdapter {
  getSnapshot(): Promise<MeghnetraSnapshot>;
}
