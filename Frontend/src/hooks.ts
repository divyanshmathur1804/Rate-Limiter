import { useState, useEffect, useCallback } from 'react';
import type { StatsResponse, TimeSeriesDataPoint } from './types';

const API_URL = 'http://localhost:8080/api/stats';
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_DATA_POINTS = 20; // ~30 seconds of data

export function useStatsPolling() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isBackendReachable, setIsBackendReachable] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: StatsResponse = await response.json();
      setStats(data);
      setIsBackendReachable(true);
      setError(null);

      // Update time series data
      const now = Date.now();
      setTimeSeriesData((prev) => {
        const newData: TimeSeriesDataPoint = {
          timestamp: now,
          allowed: data.totalAllowed,
          rejected: data.totalRejected,
        };
        const updated = [...prev, newData];
        // Keep only the last MAX_DATA_POINTS
        return updated.slice(-MAX_DATA_POINTS);
      });
    } catch (err) {
      setIsBackendReachable(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, isBackendReachable, timeSeriesData, error };
}

export function useTrafficGenerator() {
  const [clientId, setClientId] = useState('client1');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number } | null>(null);

  const sendBurst = useCallback(async () => {
    setIsSending(true);
    setSendResult(null);

    const burstSize = 20;
    let success = 0;
    let failed = 0;

    // Send 20 rapid requests
    const requests = Array.from({ length: burstSize }, async () => {
      try {
        // Assume a simple GET endpoint that triggers rate limiting
        const response = await fetch(`http://localhost:8080/api/${clientId}`);
        return response.ok ? 'success' : 'failed';
      } catch {
        return 'failed';
      }
    });

    const results = await Promise.all(requests);
    results.forEach((result) => {
      if (result === 'success') success++;
      else failed++;
    });

    setSendResult({ success, failed });
    setIsSending(false);
  }, [clientId]);

  return { clientId, setClientId, sendBurst, isSending, sendResult };
}
