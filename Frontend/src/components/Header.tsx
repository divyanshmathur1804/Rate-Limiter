import { Activity } from 'lucide-react';

interface HeaderProps {
  isBackendReachable: boolean;
}

export function Header({ isBackendReachable }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Rate Limiter Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isBackendReachable ? 'bg-emerald-500' : 'bg-red-500'
            } ${isBackendReachable ? 'animate-pulse' : ''}`}
          />
          <span className="text-sm text-gray-400">
            {isBackendReachable ? 'Backend Connected' : 'Backend Unreachable'}
          </span>
        </div>
      </div>
    </header>
  );
}
