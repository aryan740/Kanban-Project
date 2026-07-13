import React from 'react';
import { X, Clock, User, Activity, AlertCircle, Download, Calendar } from 'lucide-react';

export default function AuditSidebar({ task, onClose }) {
  if (!task) return null;

  const logs = task.logs || [];

  // 📊 Forensic Ledger Telemetry Pipeline: Export data sets seamlessly
  const exportTelemetryData = (format) => {
    if (logs.length === 0) return alert('No transaction logs indexed for extraction.');
    
    let fileContent = '';
    let mimeType = '';
    let fileExtension = '';

    if (format === 'json') {
      const exportObject = {
        nodeId: task.id,
        nodeTitle: task.title,
        extractedAt: new Date().toISOString(),
        auditTrail: logs
      };
      fileContent = JSON.stringify(exportObject, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'csv') {
      const headers = ['Timestamp', 'ActionType', 'Operator', 'Details'];
      const rows = logs.map(log => [
        `"${log.timestamp || ''}"`,
        `"${log.action || 'WORKFLOW_MUTATION'}"`,
        `"${log.user || 'Authorized Operator'}"`,
        `"${log.details || log.message || ''}"`
      ]);
      fileContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetry_node_${task.id || 'export'}.${fileExtension}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⏳ Check Timeline Target & Expiration Alerts
  const getDeadlineStatus = () => {
    if (!task.dueDate) return null;
    const deadline = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = deadline - now;
    const hoursRemaining = timeDiff / (1000 * 60 * 60);

    if (timeDiff < 0) return { label: 'DEADLINE EXPIRED', styles: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40' };
    if (hoursRemaining <= 12) return { label: 'URGENT BREACH < 12H', styles: 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40' };
    return { label: `Due: ${deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`, styles: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  };

  const deadlineBadge = getDeadlineStatus();

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 flex flex-col select-none transition-all duration-300 transform translate-x-0">
      
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">System Audit Trail</h3>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Node History \& Forensic Logs</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Task Details & Dynamic Timelines */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
            Target Node
          </span>
          {deadlineBadge && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${deadlineBadge.styles}`}>
              {deadlineBadge.label}
            </span>
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white tracking-tight truncate">{task.title}</h4>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{task.description || 'No description provided.'}</p>
        </div>
        
        {/* Data Engine Pipeline Export Options Trigger Triggers */}
        <div className="pt-2 flex items-center gap-2 border-t border-dashed border-slate-200 dark:border-slate-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Download className="w-3 h-3" /> Pipeline Extract:
          </span>
          <button 
            onClick={() => exportTelemetryData('csv')}
            className="text-[9px] font-extrabold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded transition-all cursor-pointer"
          >
            CSV SHEET
          </button>
          <button 
            onClick={() => exportTelemetryData('json')}
            className="text-[9px] font-extrabold px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded transition-all cursor-pointer"
          >
            JSON MATRIX
          </button>
        </div>
      </div>

      {/* Logs Feed List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-slate-900">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="relative flex gap-4 items-start group">
              
              {index !== logs.length - 1 && (
                <span className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-800" />
              )}

              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 z-10 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:border-indigo-200 dark:group-hover:border-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                <Clock className="w-3.5 h-3.5" />
              </div>

              {/* Box Containing Forensic Info */}
              <div className="flex-1 space-y-1 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                    {log.action || 'WORKFLOW_MUTATION'}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono font-medium">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00'}
                  </span>
                </div>
                
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-normal">
                  {log.details || log.message || 'State modification event dispatch.'}
                </p>

                <div className="pt-1.5 flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <User className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[180px] text-slate-600 dark:text-slate-400">{log.user || 'Authorized Operator'}</span>
                  <span className="mx-1">•</span>
                  <span>{log.timestamp ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</span>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-medium text-slate-400/80 dark:text-slate-500 gap-2">
            <AlertCircle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <span>No transactional ledger entries indexed.</span>
          </div>
        )}
      </div>

    </div>
  );
}