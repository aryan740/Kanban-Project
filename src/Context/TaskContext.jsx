/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  searchQuery: '',
  filters: { priority: 'all' },
  theme: 'system',
  orgMembers: [],
  activePresence: [],
  orgName: null
};

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
});

export function canManageOrganization(role) {
  return role === ROLES.ADMIN;
}

export function canAssignTasks(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

export function canUpdateTask(task, profile) {
  if (!profile) return false;
  if (canAssignTasks(profile.role)) return true;
  return task.assigned_to === profile.username || task.assignedTo === profile.username;
}

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

    case 'CREATE_TASK': {
      const exists = state.tasks.some(t => t.id === action.payload.id);
      if (exists) return state;
      return { ...state, tasks: [action.payload, ...state.tasks] };
    }

    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => (task.id === action.payload.id ? { ...task, ...action.payload } : task))
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, status: action.payload.newStatus } : task
        )
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload.id)
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_ORG_MEMBERS':
      return { ...state, orgMembers: action.payload };

    case 'SET_PRESENCE':
      return { ...state, activePresence: action.payload };

    case 'SET_ORG_NAME':
      return { ...state, orgName: action.payload };

    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme Initializer
  useEffect(() => {
    const savedTheme = localStorage.getItem('synapse_theme');
    dispatch({ type: 'SET_THEME', payload: ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system' });
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => root.classList.toggle('dark', state.theme === 'dark' || (state.theme === 'system' && mediaQuery.matches));

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [state.theme]);

  // User Profile Loader with Retry & Fallback
  const fetchUserProfile = useCallback(async (uid, isRetry = false) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (!isRetry) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

          if (!retryError && retryData) {
            setProfile(retryData);
            return retryData;
          }
        }
        throw error;
      }

      if (data) {
        setProfile(data);
        return data;
      }
      throw new Error('No profile data returned');
    } catch (error) {
      console.error('Profile metadata extraction failed:', error.message);

      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;
        
        if (authUser) {
          const fallbackProfile = {
            id: uid,
            username: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
            role: 'employee',
            org_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .upsert([fallbackProfile])
            .select()
            .single();

          if (!createError && createdProfile) {
            setProfile(createdProfile);
            return createdProfile;
          }

          setProfile(fallbackProfile);
          return fallbackProfile;
        }
      } catch (fallbackError) {
        console.error('Fallback profile generation failed:', fallbackError.message);
      }

      setProfile(null);
      return null;
    }
  }, []);

  // Auth Session Setup
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session && isMounted) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session hydration failed:', error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        try {
          if (session) {
            setUser(session.user);
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
              await fetchUserProfile(session.user.id);
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err.message);
        } finally {
          if (isMounted) setLoading(false);
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Fetch Tasks from Normalized Tasks Table
  const fetchTasks = useCallback(async (orgId) => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('org_id', orgId)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false });

    if (!error && data) {
      dispatch({ type: 'SET_TASKS', payload: data });
    } else if (error) {
      console.error('Tasks fetch failed:', error.message);
    }
  }, []);

  // Sync Organization, Members, Metadata, & Realtime Channels
  useEffect(() => {
    if (!profile?.org_id) return;

    fetchTasks(profile.org_id);

    const fetchOrgMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', profile.org_id);
      if (data) {
        dispatch({ type: 'SET_ORG_MEMBERS', payload: data });
      }
    };

    const fetchOrganizationMetadata = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.org_id)
        .maybeSingle();
      if (!error && data) {
        dispatch({ type: 'SET_ORG_NAME', payload: data.name || null });
      }
    };

    fetchOrgMembers();
    fetchOrganizationMetadata();

    // Collaborative Realtime Channel for Tasks & Organizations
    const channel = supabase.channel(`org_realtime_${profile.org_id}`, {
      config: { presence: { key: profile.username || user?.email || 'Unknown User' } }
    });

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `org_id=eq.${profile.org_id}`
      }, (payload) => {
        if (payload.new) {
          if (payload.new.is_deleted === true || payload.new.isDeleted === true) {
            dispatch({ type: 'DELETE_TASK', payload: { id: payload.new.id } });
          } else {
            dispatch({ type: 'CREATE_TASK', payload: payload.new });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `org_id=eq.${profile.org_id}`
      }, (payload) => {
        if (payload.new) {
          if (payload.new.is_deleted === true || payload.new.isDeleted === true) {
            dispatch({ type: 'DELETE_TASK', payload: { id: payload.new.id } });
          } else {
            dispatch({ type: 'EDIT_TASK', payload: payload.new });
          }
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
        filter: `org_id=eq.${profile.org_id}`
      }, (payload) => {
        if (payload.old) {
          dispatch({ type: 'DELETE_TASK', payload: { id: payload.old.id } });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'organizations',
        filter: `id=eq.${profile.org_id}`
      }, (payload) => {
        if (payload.new) {
          dispatch({ type: 'SET_ORG_NAME', payload: payload.new.name || null });
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const stateData = channel.presenceState();
        const activeUsers = Object.keys(stateData).map(key => ({
          name: key,
          metadata: stateData[key][0]
        }));
        dispatch({ type: 'SET_PRESENCE', payload: activeUsers });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString(), role: profile.role });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, user?.email, fetchTasks]);

  // Atomic Audit Log Action Handler
  const logTaskAction = useCallback(async (taskId, action, details) => {
    if (!profile?.org_id || !taskId) return;
    try {
      await supabase.from('task_logs').insert([{
        task_id: taskId,
        org_id: profile.org_id,
        action,
        details,
        operator: profile.username || user?.email || 'Unknown'
      }]);
    } catch (err) {
      console.error('Task audit log insert failed:', err.message);
    }
  }, [profile?.org_id, profile?.username, user?.email]);

  // Production Action: Atomic Task Status Transition
  const updateTaskStatus = async (taskId, nextStatus) => {
    const previousTasks = state.tasks;
    const taskObj = state.tasks.find(t => t.id === taskId);
    const oldStatus = taskObj ? (taskObj.status || 'unknown') : 'unknown';

    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { id: taskId, newStatus: nextStatus } });

    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('RBAC / Network failure updating status:', error.message);
      dispatch({ type: 'SET_TASKS', payload: previousTasks });
      alert(`Status update failed: ${error.message}`);
    } else {
      await logTaskAction(taskId, 'STATUS_CHANGE', `Moved status from "${oldStatus}" to "${nextStatus}"`);
    }
  };

  // Production Action: Atomic Task Creation
  const createTask = async (taskPayload) => {
    if (!profile?.org_id) return { success: false, error: 'No active organization found' };

    const payload = {
      title: taskPayload.title,
      description: taskPayload.description || '',
      status: taskPayload.status || 'backlog',
      priority: taskPayload.priority || 'medium',
      assigned_to: taskPayload.assignedTo || taskPayload.assigned_to || null,
      due_date: taskPayload.dueDate || taskPayload.due_date || null,
      subtasks: taskPayload.subtasks || [],
      org_id: profile.org_id,
      created_by: user?.id
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Task insert failed:', error.message);
      alert(`Could not create task: ${error.message}`);
      return { success: false, error };
    }

    dispatch({ type: 'CREATE_TASK', payload: data });
    await logTaskAction(data.id, 'TASK_CREATED', `Created task "${data.title}"`);
    return { success: true, data };
  };

  // Production Action: Non-blocking Soft Task Deletion
  const deleteTask = async (taskId) => {
    // 1. Instant local removal
    dispatch({ type: 'DELETE_TASK', payload: { id: taskId } });

    try {
      // Fire update non-blockingly or concurrently with audit
      const updatePromise = supabase
        .from('tasks')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      const logPromise = logTaskAction(taskId, 'TASK_DELETED', 'Soft-deleted task');

      const [{ error }] = await Promise.all([updatePromise, logPromise]);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Soft delete failed:", err);
      // Re-fetch to sync clean server state only if failed
      if (profile?.org_id) fetchTasks(profile.org_id);
      alert("Could not delete task: " + (err.message || "Network/permission error"));
      return { success: false, error: err };
    }
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        user,
        profile,
        loading,
        createTask,
        updateTaskStatus,
        deleteTask,
        logTaskAction,
        fetchTasks: () => fetchTasks(profile?.org_id)
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be bundled within a TaskProvider layer.');
  return context;
}