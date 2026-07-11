import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import Card from '../shared/Card';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', accent: 'bg-slate-400' },
  { id: 'todo', title: 'To Do', accent: 'bg-indigo-400' },
  { id: 'in_progress', title: 'In Progress', accent: 'bg-amber-500' },
  { id: 'review', title: 'QA / Review', accent: 'bg-purple-500' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-500' }
];

export default function Board({ onOpenModal, onOpenAudit }) {
  const { state, dispatch, user } = useTasks();
  const [activeOverColumn, setActiveOverColumn] = useState(null);

  // Structural Guard: Keep all active items mapped so they can fade out smoothly rather than vanishing from DOM
  const activeTasks = (state.tasks || []).filter(task => {
    if (task.isDeleted) return false;
    // Keep priority filters separated from search fading rules
    return state.filters.priority === 'all' || task.priority === state.filters.priority;
  });

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setActiveOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setActiveOverColumn(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setActiveOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      dispatch({
        type: 'UPDATE_TASK_STATUS',
        payload: { 
          id: taskId, 
          newStatus: targetStatus,
          operator: user?.email || 'Authorized Operator'
        }
      });
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[calc(100vh-220px)] items-start select-none">
      {COLUMNS.map(col => {
        const columnTasks = activeTasks.filter(t => {
          const s = t.status ? t.status.toLowerCase().replace('-', '_').trim() : '';
          const targetId = col.id.toLowerCase();
          
          if (targetId === 'review' && (s === 'qa' || s === 'review' || s === 'code_review')) return true;
          if (targetId === 'in_progress' && (s === 'in_progress' || s === 'in-progress')) return true;
          
          return s === targetId;
        });

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col max-h-[75vh] rounded-2xl p-3.5 bg-slate-100/70 border border-slate-200/40 transition-all duration-200 min-h-[340px] ${
              activeOverColumn === col.id ? 'bg-indigo-50/50 border-dashed border-indigo-400/80 shadow-inner scale-[1.01]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider truncate max-w-[90px]" title={col.title}>
                  {col.title}
                </h3>
                <span className="text-[10px] font-bold bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded-md">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin pb-4">
              {columnTasks.length > 0 ? (
                columnTasks.map(task => (
                  <Card 
                    key={task.id} 
                    task={task} 
                    onOpenModal={onOpenModal} 
                    onOpenAudit={onOpenAudit} 
                  />
                ))
              ) : (
                <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-[10px] font-medium text-slate-400/80 bg-slate-50/30">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}