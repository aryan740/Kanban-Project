import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { X, Plus, Trash2 } from 'lucide-react';

export default function Modal({ mode, taskToEdit, onClose }) {
  const { dispatch, user } = useTasks();

  // 1. Initial State Hydration directly aligned with system schema standards
  const [title, setTitle] = useState(mode === 'edit' && taskToEdit ? taskToEdit.title : '');
  const [description, setDescription] = useState(mode === 'edit' && taskToEdit ? taskToEdit.description : '');
  const [status, setStatus] = useState(mode === 'edit' && taskToEdit ? taskToEdit.status : 'backlog');
  const [priority, setPriority] = useState(mode === 'edit' && taskToEdit ? taskToEdit.priority : 'medium');
  
  // Standardized lowercase subtasks array key tracking
  const [subtasks, setSubtasks] = useState(mode === 'edit' && taskToEdit ? (taskToEdit.subtasks || taskToEdit.subTasks || []) : []);
  const [newSubTaskText, setNewSubTaskText] = useState('');

  // Sub-task Core Management Actions
  const handleAddSubTask = () => {
    if (!newSubTaskText.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      text: newSubTaskText.trim(),
      completed: false // Standardized boolean flag matching card rendering loops
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubTaskText('');
  };

  const handleToggleSubTask = (id) => {
    setSubtasks(subtasks.map(sub => 
      sub.id === id ? { ...sub, completed: !sub.completed } : sub
    ));
  };

  const handleDeleteSubTask = (id) => {
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };

  // Main Submit Core Orchestration Engine
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Issue Title is strictly mandated for operations.');

    const currentOperator = user?.email || 'Authorized Operator';

    if (mode === 'create') {
      const newTask = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        subtasks,
        operator: currentOperator,
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'CREATE_TASK', payload: newTask });
    } else if (mode === 'edit' && taskToEdit) {
      const updatedTask = {
        ...taskToEdit,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        subtasks,
        operator: currentOperator
      };
      
      if (status !== taskToEdit.status) {
        dispatch({ 
          type: 'UPDATE_TASK_STATUS', 
          payload: { id: taskToEdit.id, newStatus: status, operator: currentOperator } 
        });
      }
      dispatch({ type: 'EDIT_TASK', payload: updatedTask });
    }

    onClose(); // Dismiss modal layout framework securely
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <div className="bg-white border border-slate-200 rounded-[22px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col transition-all">
        
        {/* Modal Window Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            {mode === 'create' ? 'Initialize Action Item' : 'Mutate Workspace Record'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Interactive Input Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">Issue Title *</label>
            <input
              type="text"
              placeholder="e.g., Fix session expiration validation schema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none text-slate-800 transition-all placeholder:text-slate-300"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">Detailed Description</label>
            <textarea
              rows="3"
              placeholder="Provide explicit operational details context for this workspace tracking node..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none text-slate-800 resize-none transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Grid Selection Layers for Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none cursor-pointer appearance-none transition-all"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">QA / Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">Severity / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none cursor-pointer appearance-none transition-all"
              >
                <option value="low">Low Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="high">High Severity</option>
              </select>
            </div>
          </div>

          {/* Checklist Engine Block */}
          <div className="border-t border-slate-100/80 pt-4 space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">Target Action Checklist</label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist sub-task item parameters..."
                value={newSubTaskText}
                onChange={(e) => setNewSubTaskText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none text-slate-800 transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={handleAddSubTask}
                className="bg-slate-950 text-white px-3 rounded-xl hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Render checklist stacks */}
            <div className="max-h-32 overflow-y-auto space-y-1.5 pt-1 pr-1 scrollbar-thin">
              {subtasks.map(sub => (
                <div key={sub.id} className="flex items-center justify-between bg-slate-50/60 border border-slate-200/50 rounded-xl p-2.5 group/item transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sub.completed || sub.isCompleted || false}
                      onChange={() => handleToggleSubTask(sub.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer transition-all"
                    />
                    <span className={`text-xs font-semibold text-slate-700 transition-all ${sub.completed || sub.isCompleted ? 'line-through text-slate-300/90' : ''}`}>
                      {sub.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubTask(sub.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover/item:opacity-100 p-0.5 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="border-t border-slate-100/80 pt-4 flex items-center justify-end gap-2 sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              {mode === 'create' ? 'Deploy Issue' : 'Commit Adjustments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}