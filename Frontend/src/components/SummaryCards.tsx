import { TrendingUp, TrendingDown, BarChart3, Percent } from 'lucide-react';
import type { StatsResponse } from '../types';

interface SummaryCardsProps {
  stats: StatsResponse | null;
}

function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0.0';
  return ((value / total) * 100).toFixed(1);
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const totalRequests = stats ? stats.totalAllowed + stats.totalRejected : 0;
  const rejectionRate = stats
    ? formatPercentage(stats.totalRejected, totalRequests)
    : '0.0';

  const cards = [
    {
      title: 'Total Requests',
      value: totalRequests.toLocaleString(),
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Allowed',
      value: stats?.totalAllowed.toLocaleString() ?? '0',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Rejected',
      value: stats?.totalRejected.toLocaleString() ?? '0',
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Rejection Rate',
      value: `${rejectionRate}%`,
      icon: Percent,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-400">{card.title}</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
