import React from 'react';
import { useTasks } from '../../context/TaskContext';
import Card from './Card';

export default function Column({ id, title, borderColor, onEditTask }) {
  const { state } = useTasks();

  // Computational filtering logic for search and priority matrices
  const filteredTasks = state.tasks.filter(task => {
    // 1. Column Status Check
    const matchesStatus = task.status === id;
    
    // 2. Search Query Check (Case-Insensitive search on Title & Description)
    const matchesSearch = 
      task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(state.searchQuery.toLowerCase());
      
    // 3. Advanced Priority Filter Check
    const matchesPriority = 
      state.filters.priority === 'all' || task.priority === state.filters.priority;

    return matchesStatus && matchesSearch && matchesPriority;
  });

  return (
    <div className={`flex flex-col bg-slate-100/70 border-t-4 ${borderColor} rounded-b-xl p-3 min-h-[500px] max-h-[85vh] overflow-y-auto shadow-inner`}>
      
      {/* Column Header Metadata */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50/10 backdrop-blur-md py-1 z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {title}
        </span>
        <span className="text-[11px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
          {filteredTasks.length}
        </span>
      </div>

      {/* Task Stack Container */}
      <div className="flex flex-col gap-3 flex-1">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 text-center h-24 text-[11px] font-medium text-slate-400">
            No issues matching filters
          </div>
        ) : (
          filteredTasks.map(task => (
            <Card 
              key={task.id} 
              task={task} 
              onEdit={onEditTask} 
            />
          ))
        )}
      </div>
    </div>
  );
}