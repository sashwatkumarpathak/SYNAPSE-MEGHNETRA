import { events, nationalStats } from '@/lib/demo-data';
import type { MeghnetraDataAdapter, MeghnetraSnapshot } from './types';

export const demoAdapter: MeghnetraDataAdapter = {
  async getSnapshot(): Promise<MeghnetraSnapshot> {
    return {
      events,
      activeEvents: nationalStats.events,
      verifiedSignals: nationalStats.verified,
      underReview: nationalStats.suspicious,
      regionsCovered: nationalStats.regions,
      sourcesConnected: nationalStats.sources,
    };
  },
};
