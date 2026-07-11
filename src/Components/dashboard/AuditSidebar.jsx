import React from 'react';
import { X, Clock, User, Activity, AlertCircle } from 'lucide-react';

export default function AuditSidebar({ task, onClose }) {
  if (!task) return null;

  const logs = task.logs || [];

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-slate-200/80 shadow-2xl z-50 flex flex-col select-none transition-all duration-300 transform translate-x-0">
      
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">System Audit Trail</h3>
            <p className="text-[10px] font-medium text-slate-400">Node History & Forensic Logs</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Task Details */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/30">
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
          Target Node
        </span>
        <h4 className="text-xs font-bold text-slate-800 tracking-tight mt-2 truncate">{task.title}</h4>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">{task.description || 'No description provided.'}</p>
      </div>

      {/* Logs Feed List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="relative flex gap-4 items-start group">
              
              {index !== logs.length - 1 && (
                <span className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-100" />
              )}

              <div className="bg-slate-100 border border-slate-200 rounded-full p-1 z-10 text-slate-500 group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                <Clock className="w-3.5 h-3.5" />
              </div>

              {/* Box Containing Forensic Info */}
              <div className="flex-1 space-y-1 bg-slate-50/50 border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                  <span className="uppercase tracking-wide text-indigo-600">
                    {log.action || 'WORKFLOW_MUTATION'}
                  </span>
                  <span className="text-slate-400 font-mono font-medium">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00'}
                  </span>
                </div>
                
                {/* Fallback to render log.message if log.details is empty */}
                <p className="text-xs font-medium text-slate-600 leading-normal">
                  {log.details || log.message || 'State modification event dispatch.'}
                </p>

                <div className="pt-1.5 flex items-center gap-1 text-[9px] font-bold text-slate-400 border-t border-slate-100 mt-2">
                  <User className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[200px]">{log.user || 'Authorized Operator'}</span>
                  <span className="mx-1">•</span>
                  <span>{log.timestamp ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</span>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl text-[11px] font-medium text-slate-400/80 bg-slate-50/20 gap-2">
            <AlertCircle className="w-4 h-4 text-slate-300" />
            <span>No transactional ledger entries indexed.</span>
          </div>
        )}
      </div>

    </div>
  );
}