import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ClientTable } from './components/ClientTable';
import { LiveChart } from './components/LiveChart';
import { TrafficGenerator } from './components/TrafficGenerator';
import { useStatsPolling, useTrafficGenerator } from './hooks';

function App() {
  const { stats, isBackendReachable, timeSeriesData } = useStatsPolling();
  const {
    clientId,
    setClientId,
    sendBurst,
    isSending,
    sendResult,
  } = useTrafficGenerator();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header isBackendReachable={isBackendReachable} />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards stats={stats} />

         <div className="w-full">
          <LiveChart data={timeSeriesData} />
        </div>

        {/* Two-column layout for larger screens */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Table and Traffic Generator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Table */}
            

            {/* Traffic Generator */}
            <TrafficGenerator
              clientId={clientId}
              onClientIdChange={setClientId}
              onSendBurst={sendBurst}
              isSending={isSending}
              sendResult={sendResult}
            />
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-3">
                Active Clients
              </h2>
              <ClientTable clients={stats?.clients ?? []} />
            </div>
          </div>

          {/* Right column - placeholder for spacing */}
          <div className="lg:col-span-1"></div>
        </div>

        {/* Full-width Chart */}
       

        {/* Offline message */}
        {!isBackendReachable && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">
              Unable to connect to backend at <code className="text-red-300">http://localhost:8080</code>.
              <br />
              Make sure your rate limiter backend is running.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs text-gray-500 text-center">
            Polling <code className="text-gray-600">http://localhost:8080/api/stats</code> every 1.5s
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
