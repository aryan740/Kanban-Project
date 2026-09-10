import React, { useState, useEffect } from 'react';
import { useTasks } from './Context/TaskContext';
import { supabase } from './lib/supabaseClient';
import Auth from './Components/auth/Auth';
import Header from './Components/layout/Header';
import Board from './Components/layout/Board';
import Modal from './Components/shared/Modal';
import Analytics from './Components/dashboard/Analytics';
import AuditSidebar from './Components/dashboard/AuditSidebar';
import GlobalLogCenter from './Components/dashboard/GlobalLogCenter';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const { user, profile, loading } = useTasks();
  const [modalState, setModalState] = useState(null);
  const [activeAuditTask, setActiveAuditTask] = useState(null);
  const [showGeneralLogs, setShowGeneralLogs] = useState(false);
  const [profileTimeout, setProfileTimeout] = useState(false);

  useEffect(() => {
    let timer;
    if (user && !profile) {
      timer = setTimeout(() => {
        setProfileTimeout(true);
      }, 6000);
    } else {
      setProfileTimeout(false);
    }
    return () => clearTimeout(timer);
  }, [user, profile]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setModalState({ mode: 'edit', task });
    } else {
      setModalState({ mode: 'create' });
    }
  };

  const handleFallbackSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Jab tak initial auth check ya profile hydration chal rahi ho
  if (loading || (user && !profile)) {
    if (profileTimeout && user && !profile) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center gap-4 select-none p-4 text-center">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-600 dark:text-amber-400 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Setting up your profile...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Your profile is taking longer than expected to load. Please try signing out and logging in again.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFallbackSignOut}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Sign Out / Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 tracking-wide">
          Loading your workspace...
        </span>
      </div>
    );
  }

  // Agar user signed in nahi hai
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased flex flex-col relative overflow-hidden">
      {/* Header */}
      <Header 
        onOpenModal={handleOpenModal} 
        onOpenGeneralLogs={() => setShowGeneralLogs(true)} 
      />
      
      {/* Admin Analytics Bar */}
      {profile?.role === 'admin' && <Analytics />}
      
      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <Board onOpenModal={handleOpenModal} onOpenAudit={setActiveAuditTask} />
      </div>

      {/* Task Modal */}
      {modalState && (
        <Modal 
          mode={modalState.mode} 
          taskToEdit={modalState.task} 
          onClose={() => setModalState(null)} 
        />
      )}

      {/* Audit Logs Sidebar */}
      {activeAuditTask && (
        <AuditSidebar 
          task={activeAuditTask} 
          onClose={() => setActiveAuditTask(null)} 
        />
      )}

      {/* General Workspace Retention Modal */}
      <GlobalLogCenter 
        isOpen={showGeneralLogs} 
        onClose={() => setShowGeneralLogs(false)} 
      />
    </div>
  );
}