import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesDataPoint } from '../types';

interface LiveChartProps {
  data: TimeSeriesDataPoint[];
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function LiveChart({ data }: LiveChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    time: formatTime(point.timestamp),
  }));

  // Calculate delta values (difference between consecutive points)
  const dataWithDeltas = chartData.map((point, index) => {
    if (index === 0) {
      return { ...point, allowedDelta: 0, rejectedDelta: 0 };
    }
    const prev = chartData[index - 1];
    return {
      ...point,
      allowedDelta: point.allowed - prev.allowed,
      rejectedDelta: point.rejected - prev.rejected,
    };
  });

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">
        Traffic Trend (Last ~30s)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dataWithDeltas}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              wrapperStyle={{ color: '#9ca3af' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="allowedDelta"
              name="Requests/sec"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#34d399' }}
            />
            <Line
              type="monotone"
              dataKey="rejectedDelta"
              name="Rejected/sec"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#f87171' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
