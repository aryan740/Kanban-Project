import React from 'react';
import { canManageOrganization, canUpdateTask, useTasks } from '../../Context/TaskContext';
import { Calendar, CheckSquare, Edit3, MessageSquare, Trash2, History, User, AlertTriangle } from 'lucide-react';

const PRIORITY_THEMES = {
  high: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
  medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
  low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

export default function Card({ task, onOpenModal, onOpenAudit }) {
  const { dispatch, user, profile } = useTasks();
  
  const subtasks = task.subtasks || [];
  const comments = task.comments || [];
  const activityCount = task.logs?.length || 0;
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // ⏳ Dynamic Timeline Evaluator
  const getTimelineStatus = () => {
    if (!task.dueDate) return { isUrgent: false, styles: 'border-l-indigo-500 text-slate-400' };
    
    const deadline = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = deadline - now;
    const hoursRemaining = timeDiff / (1000 * 60 * 60);

    if (timeDiff < 0) {
      return { isUrgent: false, isExpired: true, styles: 'border-l-rose-600 dark:border-l-rose-500 bg-rose-50/30 text-rose-600 dark:text-rose-400' };
    }
    if (task.priority === 'high' && hoursRemaining <= 12) {
      return { isUrgent: true, isExpired: false, styles: 'border-l-amber-500 animate-pulse text-amber-600 dark:text-amber-400' };
    }
    return { isUrgent: false, isExpired: false, styles: 'border-l-indigo-500 text-slate-400' };
  };

  const timeline = getTimelineStatus();

  // 🛡️ RBAC Authorization Guard
  const canUpdate = canUpdateTask(task, profile);
  const canDelete = canManageOrganization(profile?.role);

  const handleDragStart = (e) => {
    if (!canUpdate) {
      e.preventDefault();
      return alert('RBAC Access Violation: Enterprise Workers can only drag tasks assigned to their account node.');
    }
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={canUpdate}
      onDragStart={handleDragStart}
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm group relative border-l-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${timeline.styles} ${!canUpdate ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {/* Upper Meta Node */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${PRIORITY_THEMES[task.priority || 'medium']}`}>
          {task.priority || 'medium'}
        </span>
        
        {/* Actions Panel */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white dark:bg-slate-900 pl-2">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenAudit(task); }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
            title="Inspect System Logs"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          
          {canUpdate && (
            <>
              {canDelete && <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenModal(task); }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>}
              <button 
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (window.confirm('Flag this tracking log node for soft deletion pipeline?')) {
                    dispatch({ 
                      type: 'DELETE_TASK', 
                      payload: { id: task.id, operator: profile?.username || user?.email } 
                    }); 
                  }
                }}
                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-2 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{(task.status || 'backlog').replace('_', ' ')}</span>
        <span>Created by {task.creator || task.operator || 'Unknown'}</span>
      </div>
      <h4 className="text-xs font-bold text-slate-800 dark:text-white tracking-tight mb-1 line-clamp-1">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-normal mb-3">
          {task.description}
        </p>
      )}

      {/* Checklist Matrix */}
      {subtasks.length > 0 && (
        <div className="mb-3 space-y-1 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500">
            <span>Checklist</span>
            <span>{completedSubtasks}/{subtasks.length}</span>
          </div>
          <div className="w-full h-1 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${subtaskPercent}%` }} />
          </div>
        </div>
      )}

      {/* Footer Meta Hub */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
        <span className={`flex items-center gap-1 ${timeline.isUrgent ? 'text-amber-500 font-extrabold' : timeline.isExpired ? 'text-rose-500 font-extrabold' : ''}`}>
          {timeline.isUrgent || timeline.isExpired ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Timeline'}
        </span>
        
        {/* Corporate Resource Allocation Badge */}
        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700 max-w-[120px] truncate">
          <User className="w-2.5 h-2.5 text-slate-400" />
          <span className="truncate">{task.assignedTo ? `@${task.assignedTo}` : 'Unassigned'}</span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1" title="Checklist progress"><CheckSquare className="h-3 w-3" />{completedSubtasks}/{subtasks.length}</span>
        <span className="flex items-center gap-1" title="Comments"><MessageSquare className="h-3 w-3" />{comments.length}</span>
        <span className="flex items-center gap-1" title="Activity"><History className="h-3 w-3" />{activityCount}</span>
      </div>
    </div>
  );
}
