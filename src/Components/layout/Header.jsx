import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { Search, Plus, Filter, Layers, LogOut, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function Header({ onOpenModal, onOpenGeneralLogs }) {
  const { state, dispatch } = useTasks();

  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleFilterChange = (e) => {
    dispatch({ type: 'SET_FILTERS', payload: { priority: e.target.value } });
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to terminate your secure cloud workspace session?')) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err) {
        alert('Logout lifecycle failed: ' + err.message);
      }
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm select-none">
      
      {/* 1. Branding Section Update */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 transform transition-transform hover:rotate-6">
          <Layers className="w-[18px] h-[18px]" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">
            Synapse
          </h1>
          <p className="text-[10px] font-semibold text-slate-400">Workspace Pipeline Matrix</p>
        </div>
      </div>

      {/* 2. Search & Controls Stack */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks or tickets..."
            value={state.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
          />
        </div>

        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <select
            value={state.filters.priority}
            onChange={handleFilterChange}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-2 appearance-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* 3. General Retention Log Center Toggle Trigger Button */}
        <button
          type="button"
          onClick={onOpenGeneralLogs}
          className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer"
          title="Open General Retention Logs (Recycle Bin)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onOpenModal(null)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Issue</span>
        </button>

        <button
          onClick={handleSignOut}
          className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-slate-500 hover:text-rose-600 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          title="Sign Out Session"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>
    </header>
  );
}