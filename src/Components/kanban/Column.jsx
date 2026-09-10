import React, { useState } from 'react';
import { useTasks } from '../../Context/TaskContext';
import Card from './Card';

export default function Column({ id, title, borderColor, onOpenModal, onOpenAudit }) {
  const { state, updateTaskStatus } = useTasks();
  const [isDragOver, setIsDragOver] = useState(false);

  const searchQuery = state.searchQuery?.trim().toLowerCase() || '';
  const isSearchActive = searchQuery.length > 0;

  const filteredTasks = state.tasks.filter(task => {
    const matchesStatus = task.status === id;
    const matchesPriority =
      state.filters.priority === 'all' || task.priority === state.filters.priority;

    return matchesStatus && matchesPriority;
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const draggedTask = state.tasks.find(t => t.id === taskId);
    if (draggedTask && draggedTask.status !== id) {
      await updateTaskStatus(taskId, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100/70 dark:bg-slate-900 border-t-4 ${borderColor} rounded-b-xl p-3 min-h-[500px] max-h-[85vh] overflow-y-auto shadow-inner dark:shadow-none transition-colors duration-150 ${
        isDragOver ? 'ring-2 ring-indigo-500/50 bg-indigo-50/30 dark:bg-slate-800/80' : ''
      }`}
    >
      {/* Column Header Metadata */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md py-1 z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {title}
        </span>
        <span className="text-[11px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full">
          {filteredTasks.length}
        </span>
      </div>

      {/* Task Stack Container */}
      <div className="flex flex-col gap-3 flex-1">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center h-24 text-[11px] font-medium text-slate-400">
            No issues matching filters
          </div>
        ) : (
          filteredTasks.map(task => (
            <Card
              key={task.id}
              task={task}
              onOpenModal={onOpenModal}
              onOpenAudit={onOpenAudit}
              isSearchActive={isSearchActive}
              isSearchMatch={
                !isSearchActive ||
                task.title?.toLowerCase().includes(searchQuery) ||
                task.description?.toLowerCase().includes(searchQuery)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}