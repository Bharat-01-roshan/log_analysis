import React from 'react';

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  const severityBuckets = stats.by_severity?.buckets || [];
  const topAnomalousIPs = stats.top_anomalous_ips?.buckets || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
  );
};

export default StatsOverview;
