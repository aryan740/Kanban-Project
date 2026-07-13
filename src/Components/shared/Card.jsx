import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { Calendar, CheckSquare, Edit3, Trash2, History } from 'lucide-react';

const PRIORITY_THEMES = {
  high: 'bg-rose-50 text-rose-700 border-rose-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

export default function Card({ task, onOpenModal, onOpenAudit }) {
  const { state, dispatch, user } = useTasks();
  
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Pure Search Engine Context (Strict Validation Vector)
  const query = state.searchQuery?.trim().toLowerCase() || '';
  const isSearchActive = query !== '';
  const isMatched = isSearchActive && (
    task.title?.toLowerCase().includes(query) || 
    task.description?.toLowerCase().includes(query)
  );

  // High Contrast Array Join Architecture - Darker Hover and Clear Shadow Pulse
  const cardClasses = [
    'bg-white', 'dark:bg-slate-900',
    'border',
    'border-slate-200/95', 'dark:border-slate-700',
    'rounded-2xl',
    'p-4',
    'shadow-sm',
    'group',
    'relative',
    'border-l-4',
    'border-l-indigo-500',
    'hover:border-l-indigo-600',
    'hover:bg-slate-100/90', 'dark:hover:bg-slate-800',
    'hover:border-slate-300', 'dark:hover:border-slate-600',
    'hover:shadow-md',
    'select-none',
    'cursor-grab',
    'active:cursor-grabbing',
    'active:scale-[0.99]',
    'transition-all',
    'duration-150',
    isSearchActive && !isMatched ? 'opacity-20 pointer-events-none' : 'opacity-100'
  ].filter(Boolean).join(' ');

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cardClasses}
    >
      {/* Upper Meta Node */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${PRIORITY_THEMES[task.priority]}`}>
          {task.priority || 'medium'}
        </span>
        
        {/* Actions Panel */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white dark:bg-slate-900 pl-2">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenAudit(task); }}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-md transition-colors cursor-pointer"
            title="Inspect System Logs"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenModal(task); }}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-md transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={(e) => { 
              e.stopPropagation(); 
              if (window.confirm('Flag this tracking log node for soft deletion pipeline?')) {
                dispatch({ 
                  type: 'DELETE_TASK', 
                  payload: { id: task.id, operator: user?.email } 
                }); 
              }
            }}
            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Content */}
      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-1 line-clamp-1">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-normal mb-3">
          {task.description}
        </p>
      )}

      {/* Checklist */}
      {subtasks.length > 0 && (
        <div className="mb-3 space-y-1 bg-slate-50/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1">Checklist</span>
            <span>{completedSubtasks}/{subtasks.length}</span>
          </div>
          <div className="w-full h-1 bg-slate-200/60 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${subtaskPercent}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-t-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Timeline'}
        </span>
      </div>
    </div>
  );
}
