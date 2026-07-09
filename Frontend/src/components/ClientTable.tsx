import type { ClientStats } from '../types';
import { getClientStatus } from '../types';

interface ClientTableProps {
  clients: ClientStats[];
}

function StatusBadge({ status }: { status: ReturnType<typeof getClientStatus> }) {
  const styles = {
    Healthy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Near Limit': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Throttled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TokenBar({ tokens, capacity }: { tokens: number; capacity: number }) {
  const percentage = (tokens / capacity) * 100;
  const barColor =
    percentage === 0
      ? 'bg-red-500'
      : percentage <= 20
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-400 w-16 text-right">
        {tokens.toFixed(1)} / {capacity}
      </span>
    </div>
  );
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400 text-center">
          No active clients. Send test traffic to see data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Client ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tokens Remaining
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Allowed
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rejected
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {clients.map((client) => {
              const status = getClientStatus(client.tokens, client.capacity);
              return (
                <tr
                  key={client.clientId}
                  className="hover:bg-gray-700/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">
                      {client.clientId}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-64">
                    <TokenBar tokens={client.tokens} capacity={client.capacity} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-emerald-400 font-medium">
                      {client.allowed.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-red-400 font-medium">
                      {client.rejected.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
