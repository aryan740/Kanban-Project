import React from 'react';
import { useTasks } from '../../Context/TaskContext'; // Synced Context structural path tracking
import { X, RefreshCw, ShieldAlert } from 'lucide-react';

export default function GlobalLogCenter({ isOpen, onClose }) {
  const { state, dispatch, user } = useTasks();

  if (!isOpen) return null;
  
  // Extract all soft-deleted records from global matrix
  const deletedTasks = (state.tasks || []).filter(task => task.isDeleted);

  const handleRestore = (id) => {
    dispatch({
      type: 'RESTORE_TASK',
      payload: { id, operator: user?.email }
    });
  };

  const checkRetentionTime = (deletedAtString) => {
    const deletedAt = new Date(deletedAtString);
    const now = new Date();
    const diffTime = Math.abs(now - deletedAt);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    // Retention period: 48 hours maximum window
    const hoursRemaining = 48 - diffHours;
    return hoursRemaining > 0 ? `${hoursRemaining}h remaining` : 'Expired';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto flex flex-col">
        
        {/* Header Grid */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-t-[24px]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-[18px] h-[18px] text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">General Retention Logs center</h3>
              <p className="text-[10px] font-medium text-slate-400">Soft-deleted items index log mapping (48 Hours active recovery lease)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Stream Array */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {deletedTasks.length > 0 ? (
            deletedTasks.map(task => (
              /* Differentiated Soft Delete Layout Vector (Dashed Border + Grayscale/Opacity shift) */
              <div 
                key={task.id} 
                className="border border-dashed border-slate-300 bg-slate-50/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 opacity-75 hover:opacity-100 hover:border-indigo-300 hover:bg-slate-100/50"
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Visual strikethrough logic mapping active on typography */}
                    <h4 className="text-xs font-bold text-slate-500 tracking-tight line-through decoration-slate-400">
                      {task.title}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-mono border border-rose-100">
                      {checkRetentionTime(task.deletedAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic line-clamp-1">
                    {task.description || 'No context description logs field mapping.'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400">Removed By: <span className="text-slate-600">{task.operator || 'System User'}</span></p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(task.id)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restore Node</span>
                </button>
              </div>
            ))
          ) : (
            <div className="h-48 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs gap-2 bg-slate-50/20">
              <ShieldAlert className="w-5 h-5 text-slate-300" />
              <span className="font-semibold text-[11px] tracking-wide text-slate-400/80">No structural items indexed inside retention buffer matrix.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
