export interface ClientStats {
  clientId: string;
  tokens: number;
  capacity: number;
  allowed: number;
  rejected: number;
}

export interface StatsResponse {
  clients: ClientStats[];
  totalAllowed: number;
  totalRejected: number;
}

export interface TimeSeriesDataPoint {
  timestamp: number;
  allowed: number;
  rejected: number;
}

export type ClientStatus = 'Healthy' | 'Near Limit' | 'Throttled';

export function getClientStatus(tokens: number, capacity: number): ClientStatus {
  const percentage = (tokens / capacity) * 100;
  if (percentage === 0) return 'Throttled';
  if (percentage <= 20) return 'Near Limit';
  return 'Healthy';
}
