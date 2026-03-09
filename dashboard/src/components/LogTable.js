import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit, ShieldCheck, AlertTriangle, MapPin, Laptop } from 'lucide-react';

const getSeverityStyles = (severity) => {
  if (severity.includes('CRITICAL')) return 'bg-black text-red-500 border-2 border-red-500 animate-pulse';
  switch (severity) {
    case 'Severe': return 'bg-red-600 text-white';
    case 'High': return 'bg-orange-500 text-white';
    case 'Medium': return 'bg-yellow-400 text-black';
    case 'Low': return 'bg-green-500 text-white';
    default: return 'bg-gray-200 text-black';
  }
};

const LogRow = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const llm = log.llm_analysis;

  return (
    <>
      <tr 
        onClick={() => llm && setIsExpanded(!isExpanded)}
        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
      >
        <td className="px-6 py-4 text-xs whitespace-nowrap text-gray-600 flex items-center">
          {llm ? (
            isExpanded ? <ChevronDown size={14} className="mr-2 text-blue-500" /> : <ChevronRight size={14} className="mr-2 text-gray-400" />
          ) : <div className="w-[22px]" />}
          {new Date(log.timestamp).toLocaleString()}
        </td>
        <td className="px-6 py-4 text-sm font-bold text-gray-700">
           <div className="flex items-center">
             <Laptop size={14} className="mr-2 text-gray-400" />
             {log.device_id || 'Unknown'}
           </div>
        </td>
        <td className="px-6 py-4 text-sm font-mono text-blue-700">
          <div className="flex flex-col">
            <span>{log.source_ip || '---'}</span>
            <span className="text-[10px] text-gray-400 flex items-center mt-1">
              <MapPin size={10} className="mr-1" />
              {log.city ? `${log.city}, ${log.country}` : 'Internal/Unknown'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-700 break-words max-w-lg">
          {log.message}
        </td>
        <td className="px-6 py-4 text-sm text-center">
          <span className={`font-bold ${log.anomaly_score < -0.7 ? 'text-red-500' : 'text-gray-400'}`}>
            {log.anomaly_score.toFixed(3)}
          </span>
        </td>
        <td className="px-6 py-4 text-xs">
          <div className="flex flex-col space-y-1">
            <span className={`px-3 py-1 rounded-full font-bold uppercase text-center text-[10px] ${getSeverityStyles(log.severity)}`}>
              {log.severity}
            </span>
            {llm && (
              <span className="flex items-center justify-center text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                <BrainCircuit size={10} className="mr-1" /> LLM Analyzed
              </span>
            )}
          </div>
        </td>
      </tr>
      
      {isExpanded && llm && (
        <tr className="bg-blue-50/50 border-b border-blue-100">
          <td colSpan="6" className="px-12 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                    <BrainCircuit size={14} className="mr-2 text-blue-500" /> Intelligence Summary
                  </h4>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">
                    {llm.summary}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Threat Context</h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-bold text-gray-600 border border-gray-200">
                      Category: {llm.threat_category}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-xs font-bold border ${llm.is_anomaly ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      {llm.is_anomaly ? 'Anomalous Activity' : 'Baseline Behavior'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                    <ShieldCheck size={14} className="mr-2 text-green-500" /> Remediation Plan
                  </h4>
                  <p className="text-sm text-gray-700 italic">
                    {llm.remediation}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2 flex items-center">
                    <AlertTriangle size={14} className="mr-2" /> Zero-Day Vulnerability Potential
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${llm.zero_day_potential > 0.7 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${(llm.zero_day_potential || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-black text-red-600">
                      {Math.round((llm.zero_day_potential || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Reasoning</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap">
                  {llm.reasoning}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const LogTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
        <BrainCircuit size={48} className="mx-auto text-gray-200 mb-4" />
        <div className="text-lg font-bold text-gray-400">Intelligence stream is empty</div>
        <div className="text-sm text-gray-300">Awaiting system logs for analysis...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-5">Timestamp</th>
              <th className="px-6 py-5">Device</th>
              <th className="px-6 py-5">Source IP</th>
              <th className="px-6 py-5">Message Payload</th>
              <th className="px-6 py-5 text-center">ML Anomaly</th>
              <th className="px-6 py-5 text-center">Intel Rating</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <LogRow key={idx} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
