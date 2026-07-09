import { Zap, Loader2 } from 'lucide-react';

interface TrafficGeneratorProps {
  clientId: string;
  onClientIdChange: (id: string) => void;
  onSendBurst: () => void;
  isSending: boolean;
  sendResult: { success: number; failed: number } | null;
}

export function TrafficGenerator({
  clientId,
  onClientIdChange,
  onSendBurst,
  isSending,
  sendResult,
}: TrafficGeneratorProps) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Test Traffic Generator</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label
            htmlFor="clientId"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Client ID
          </label>
          <input
            id="clientId"
            type="text"
            value={clientId}
            onChange={(e) => onClientIdChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            placeholder="Enter client ID"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onSendBurst}
            disabled={isSending || !clientId.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Send Burst (20 requests)
              </>
            )}
          </button>
        </div>
      </div>
      {sendResult && (
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-emerald-400">
            {sendResult.success} succeeded
          </span>
          <span className="text-red-400">{sendResult.failed} rejected</span>
        </div>
      )}
    </div>
  );
}
