import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  const severityBuckets = stats.by_severity?.buckets || [];
  const topAnomalousIPs = stats.top_anomalous_ips?.buckets || [];
  const rawAnomalyBins = stats.anomaly_distribution?.buckets || [];

  // Format data for Recharts
  const chartData = rawAnomalyBins.map(bin => {
    const score = parseFloat(bin.key);
    let category = "Normal";
    if (score < -0.6) category = "Anomaly";
    else if (score < -0.2) category = "Suspicious";

    return {
      name: score.toFixed(1),
      count: bin.doc_count,
      category: category
    };
  });

  const getBarColor = (category) => {
    if (category === "Anomaly") return "#ef4444"; // red-500
    if (category === "Suspicious") return "#f59e0b"; // amber-500
    return "#3b82f6"; // blue-500
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Severity Distribution</h2>
          <div className="flex flex-wrap gap-4">
            {severityBuckets.map((bucket) => (
              <div key={bucket.key} className="flex-1 min-w-[100px] p-4 bg-gray-50 rounded text-center">
                <div className="text-2xl font-black text-gray-800">{bucket.doc_count}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">{bucket.key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Anomalous IPs */}
        <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-red-600">Top Suspicious Sources (Avg Anomaly)</h2>
          <div className="space-y-2">
            {topAnomalousIPs.map((ipBucket) => (
              <div key={ipBucket.key} className="flex justify-between items-center p-2 bg-red-50 border border-red-100 rounded">
                <span className="font-mono text-sm text-gray-700">{ipBucket.key}</span>
                <span className="font-bold text-red-600">{ipBucket.avg_anomaly.value.toFixed(3)}</span>
              </div>
            ))}
            {topAnomalousIPs.length === 0 && <div className="text-gray-400 text-sm">No suspicious IPs detected.</div>}
          </div>
        </div>
      </div>

      {/* Anomaly Score Graph */}
      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-700">ML Anomaly Distribution</h2>
            <p className="text-xs text-gray-400">Lower scores indicate "Outliers" detected by Isolation Forest</p>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase">
            <div className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Outlier</div>
            <div className="flex items-center"><span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span> Suspicious</div>
            <div className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Normal</div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                label={{ value: 'Anomaly Score (-1: Outlier, 1: Normal)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                fontSize={10}
              />
              <YAxis fontSize={10} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
