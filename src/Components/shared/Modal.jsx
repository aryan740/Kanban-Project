import React, { useState } from 'react';
import { canAssignTasks, canUpdateTask, useTasks } from '../../Context/TaskContext';
import { supabase } from '../../lib/supabaseClient';
import { X, Plus, Trash2, Calendar, UserCheck } from 'lucide-react';

export default function Modal({ mode, taskToEdit, onClose }) {
  const { state, dispatch, profile, createTask, logTaskAction } = useTasks();
  const canAssign = canAssignTasks(profile?.role);
  const canEditTask = mode === 'create' ? canAssign : canUpdateTask(taskToEdit, profile);
  const isEmployee = profile?.role === 'employee';
  const isWorkerReadOnly = isEmployee && mode === 'edit';

  const initialAssigned = taskToEdit ? (taskToEdit.assigned_to || taskToEdit.assignedTo || '') : '';
  const initialDueDate = taskToEdit ? (taskToEdit.due_date || taskToEdit.dueDate || '') : '';

  const [title, setTitle] = useState(mode === 'edit' && taskToEdit ? taskToEdit.title : '');
  const [description, setDescription] = useState(mode === 'edit' && taskToEdit ? (taskToEdit.description || '') : '');
  const [status, setStatus] = useState(mode === 'edit' && taskToEdit ? taskToEdit.status : 'backlog');
  const [priority, setPriority] = useState(mode === 'edit' && taskToEdit ? taskToEdit.priority : 'medium');
  const [assignedTo, setAssignedTo] = useState(initialAssigned);
  const [dueDate, setDueDate] = useState(initialDueDate);

  const [subtasks, setSubtasks] = useState(mode === 'edit' && taskToEdit ? (taskToEdit.subtasks || taskToEdit.subTasks || []) : []);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubTask = () => {
    if (!newSubTaskText.trim() || isWorkerReadOnly) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      text: newSubTaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubTaskText('');
  };

  const handleToggleSubTask = async (id) => {
    const targetSub = subtasks.find(s => s.id === id);
    const updatedSubtasks = subtasks.map(sub =>
      sub.id === id ? { ...sub, completed: !sub.completed } : sub
    );
    setSubtasks(updatedSubtasks);

    if (mode === 'edit' && taskToEdit) {
      const isNowCompleted = targetSub ? !targetSub.completed : false;
      const logDetails = `Toggled subtask: "${targetSub?.text || 'Subtask'}" (${isNowCompleted ? 'completed' : 'uncompleted'})`;

      dispatch({
        type: 'EDIT_TASK',
        payload: { ...taskToEdit, subtasks: updatedSubtasks }
      });

      await supabase.from('tasks').update({
        subtasks: updatedSubtasks,
        updated_at: new Date().toISOString()
      }).eq('id', taskToEdit.id);

      if (logTaskAction) {
        await logTaskAction(taskToEdit.id, 'CHECKLIST_UPDATE', logDetails);
      }
    }
  };

  const handleDeleteSubTask = (id) => {
    if (isWorkerReadOnly) return;
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditTask || isSubmitting) return;
    if (!title.trim()) return alert('Issue Title is strictly mandated for operations.');

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        if (!canAssign) {
          alert('RBAC Violation: Only Admins and Managers can create tasks.');
          return;
        }

        const taskPayload = {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          assignedTo: assignedTo || null,
          dueDate: dueDate || null,
          subtasks
        };

        const res = await createTask(taskPayload);
        if (!res.success) return;
      } else if (mode === 'edit' && taskToEdit) {
        const updatePayload = {
          subtasks,
          updated_at: new Date().toISOString()
        };

        if (!isWorkerReadOnly) {
          updatePayload.title = title.trim();
          updatePayload.description = description.trim();
          updatePayload.status = status;
          updatePayload.priority = priority;
          updatePayload.assigned_to = assignedTo || null;
          updatePayload.due_date = dueDate || null;
        } else {
          updatePayload.status = status;
        }

        const { error } = await supabase
          .from('tasks')
          .update(updatePayload)
          .eq('id', taskToEdit.id);

        if (error) {
          console.error('Task mutation failed:', error.message);
          alert(`Update failed: ${error.message}`);
          return;
        }

        dispatch({
          type: 'EDIT_TASK',
          payload: {
            ...taskToEdit,
            ...updatePayload,
            assignedTo: updatePayload.assigned_to ?? taskToEdit.assignedTo,
            dueDate: updatePayload.due_date ?? taskToEdit.dueDate
          }
        });

        if (logTaskAction) {
          await logTaskAction(taskToEdit.id, 'TASK_EDITED', `Updated task details for "${title}"`);
        }
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[22px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col transition-all">
        
        {/* Modal Window Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {mode === 'create' ? 'Create Task' : (isWorkerReadOnly ? 'Task Progress & Checklist' : 'Edit Task')}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Interactive Input Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-0.5">Issue Title *</label>
            <input
              type="text"
              placeholder="e.g., Fix session expiration validation schema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              required
              disabled={isWorkerReadOnly || isSubmitting}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-0.5">Detailed Description</label>
            <textarea
              rows="2"
              placeholder="Provide operational details for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              disabled={isWorkerReadOnly || isSubmitting}
            />
          </div>

          {/* Grid Selection Layers for Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-0.5">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-indigo-600 focus:outline-none cursor-pointer transition-all"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">QA / Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-0.5">Severity / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-indigo-600 focus:outline-none cursor-pointer transition-all"
                disabled={isWorkerReadOnly || isSubmitting}
              >
                <option value="low">Low Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="high">High Severity</option>
              </select>
            </div>
          </div>

          {/* Assignee and Due Date Mapping */}
          {canAssign && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100/80 dark:border-slate-800/80 pt-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-0.5 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-indigo-500" /> Assign Resource
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  disabled={isWorkerReadOnly || isSubmitting}
                  className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-indigo-600 focus:outline-none cursor-pointer transition-all"
                >
                  <option value="">Unassigned</option>
                  {state.orgMembers?.map(member => (
                    <option key={member.id} value={member.username}>
                      @{member.username} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" /> Timeline Deadline
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isWorkerReadOnly || isSubmitting}
                  className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-indigo-600 focus:outline-none cursor-pointer transition-all"
                />
              </div>
            </div>
          )}

          {/* Checklist Engine Block */}
          <div className="border-t border-slate-100/80 dark:border-slate-800/80 pt-4 space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-0.5">Task Checklist</label>

            {!isWorkerReadOnly && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add checklist sub-task item..."
                  value={newSubTaskText}
                  onChange={(e) => setNewSubTaskText(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleAddSubTask}
                  disabled={isSubmitting}
                  className="bg-slate-950 dark:bg-indigo-600 text-white px-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 pr-1 scrollbar-thin">
              {subtasks.length > 0 ? (
                subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl p-2 group/item transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sub.completed || false}
                        onChange={() => handleToggleSubTask(sub.id)}
                        disabled={isSubmitting}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer transition-all"
                      />
                      <span className={`text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all ${sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {sub.text}
                      </span>
                    </div>
                    {!isWorkerReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSubTask(sub.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover/item:opacity-100 p-0.5 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic py-1">No checklist subtasks added yet.</p>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="border-t border-slate-100/80 dark:border-slate-800/80 pt-4 flex items-center justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : (mode === 'create' ? 'Create Task' : (isWorkerReadOnly ? 'Save Progress' : 'Save Changes'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}