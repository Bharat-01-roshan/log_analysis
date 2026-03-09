import React, { useState, useEffect } from 'react';
import { fetchLogs, fetchStats } from './services/api';
import LogTable from './components/LogTable';
import StatsOverview from './components/StatsOverview';
import { RefreshCw, ShieldAlert, ListFilter, BrainCircuit, Sparkles, AlertTriangle } from 'lucide-react';

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [analyzedOnly, setAnalyzedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [newLogs, newStats] = await Promise.all([
        fetchLogs({ 
          severity: severityFilter,
          analyzed_only: analyzedOnly
        }),
        fetchStats()
      ]);
      
      if (newLogs && newLogs.error) {
        setError(newLogs.error);
        setLogs([]);
      } else {
        setLogs(Array.isArray(newLogs) ? newLogs : []);
        setError(null);
      }
      
      setStats(newStats && !newStats.error ? newStats : null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Connection failed. Is the backend API running?');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [severityFilter, analyzedOnly]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
              <ShieldAlert className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter leading-none">SMA Intelligence</h1>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center">
                <Sparkles size={10} className="mr-1" /> LLM-Powered Security
              </span>
            </div>
          </div>
          <button 
            onClick={loadData}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center px-3 text-gray-400 border-r border-gray-100">
              <ListFilter className="h-4 w-4 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-wider">Severity</span>
            </div>
            {['', 'Severe', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  severityFilter === level 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {level || 'All Logs'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAnalyzedOnly(!analyzedOnly)}
            className={`flex items-center space-x-3 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              analyzedOnly 
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-inner' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-500 shadow-sm'
            }`}
          >
            <BrainCircuit className={analyzedOnly ? 'text-blue-600 animate-pulse' : 'text-gray-300'} size={18} />
            <span>LLM Intelligence Alerts Only</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${analyzedOnly ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${analyzedOnly ? 'left-4.5' : 'left-0.5'}`} style={{ left: analyzedOnly ? '1.125rem' : '0.125rem' }}></div>
            </div>
          </button>
        </div>

        {/* Overview Stats */}
        <StatsOverview stats={stats} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm font-bold shadow-sm animate-shake">
            <AlertTriangle className="mr-3 h-5 w-5 text-red-500" />
            <div className="flex-1">
              <span className="uppercase text-[10px] font-black block mb-0.5 opacity-60">System Alert</span>
              {error}
            </div>
            <button 
              onClick={loadData}
              className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-xs"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Log Stream Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1 flex items-center">
              Intelligence Stream
              {loading && <span className="ml-3 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>}
            </h3>
            <p className="text-2xl font-black text-gray-900">
              {analyzedOnly ? 'AI-Analyzed Threats' : 'Full Ingestion Pipeline'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Real-time Sync Active</span>
          </div>
        </div>
        
        <LogTable logs={logs} />
      </main>
    </div>
  );
}

export default App;
