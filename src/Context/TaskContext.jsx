/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  searchQuery: '',
  filters: { priority: 'all' },
  theme: 'light',
  orgMembers: [],
  activePresence: []
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
      
    case 'CREATE_TASK': {
      const enrichedTask = {
        ...action.payload,
        isDeleted: false,
        deletedAt: null,
        logs: [{
          timestamp: new Date().toISOString(),
          user: action.payload.operator || 'Authorized Operator',
          action: 'INITIALIZATION',
          details: `Created core action ticket node. Assigned to: ${action.payload.assignedTo || 'Unassigned'}`
        }]
      };
      return { ...state, tasks: [...state.tasks, enrichedTask] };
    }

    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const changes = [];
            if (task.title !== action.payload.title) changes.push('Title');
            if (task.description !== action.payload.description) changes.push('Description');
            if (task.priority !== action.payload.priority) changes.push('Priority Level');
            if (task.assignedTo !== action.payload.assignedTo) changes.push('Assigned Resource');
            if (task.dueDate !== action.payload.dueDate) changes.push('Timeline Deadline');

            const logDetails = changes.length > 0 
              ? `Mutated core properties: [${changes.join(', ')}].`
              : 'Adjusted nested matrix attributes.';

            return {
              ...action.payload,
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'METADATA_UPDATE',
                  details: logDetails
                }
              ]
            };
          }
          return task;
        })
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            return {
              ...task,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'SOFT_DELETE',
                  details: 'Soft delete flagged. 48-Hour retention lease initiated.'
                }
              ]
            };
          }
          return task;
        })
      };

    case 'RESTORE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            return {
              ...task,
              isDeleted: false,
              deletedAt: null,
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'WORKSPACE_RECOVERY',
                  details: 'Restored node from recovery retention log layer.'
                }
              ]
            };
          }
          return task;
        })
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const oldStatus = task.status || 'backlog';
            const newStatus = action.payload.newStatus;
            if (oldStatus === newStatus) return task;

            return {
              ...task,
              status: newStatus,
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'PIPELINE_SHIFT',
                  details: `Transitioned status vector from [${oldStatus}] to [${newStatus}].`
                }
              ]
            };
          }
          return task;
        })
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
      
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'TOGGLE_THEME': {
      const targetTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('synapse_theme', targetTheme);
      return { ...state, theme: targetTheme };
    }

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_ORG_MEMBERS':
      return { ...state, orgMembers: action.payload };

    case 'SET_PRESENCE':
      return { ...state, activePresence: action.payload };
      
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Auto-Adaptive System Theming Configuration Engine
  useEffect(() => {
    const savedTheme = localStorage.getItem('synapse_theme');
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch({ type: 'SET_THEME', payload: systemPrefersDark ? 'dark' : 'light' });
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // 2. Auth Session Persistence Engine (Fixed Token Kill Bugs)
  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error("Profile metadata extraction failed:", e.message);
    }
  };

  // 3. Multi-Tenant Sync Layer (Tracks Tenant Orgs & Sub-accounts)
  useEffect(() => {
    if (!profile?.org_id) return;

    // Fetch org tasks
    const fetchOrgMatrixData = async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('tasks')
        .eq('org_id', profile.org_id)
        .single();
      if (!error && data) {
        dispatch({ type: 'SET_TASKS', payload: data.tasks || [] });
      }
    };
    
    // Fetch all members associated with this organization link
    const fetchOrgMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, role')
        .eq('org_id', profile.org_id);
      if (data) {
        dispatch({ type: 'SET_ORG_MEMBERS', payload: data });
      }
    };

    fetchOrgMatrixData();
    fetchOrgMembers();

    // 4. Collaborative Real-time Broadcast Pipeline Integration
    const channel = supabase.channel(`org_${profile.org_id}`, {
      config: { presence: { key: profile.username || user.email } }
    });

    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'boards', 
        filter: `org_id=eq.${profile.org_id}` 
      }, (payload) => {
        if (payload.new && payload.new.tasks) {
          dispatch({ type: 'SET_TASKS', payload: payload.new.tasks });
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
  }, [profile]);

  // 5. Automated Debounced Save Framework (Saves to the target Org Matrix row)
  useEffect(() => {
    if (!profile?.org_id) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        await supabase
          .from('boards')
          .upsert({ 
            org_id: profile.org_id, 
            tasks: state.tasks, 
            updated_at: new Date().toISOString() 
          }, { onConflict: 'org_id' });
      } catch (err) {
        console.error('Multi-tenant cloud synch failed:', err.message);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [state.tasks, profile]);

  return (
    <TaskContext.Provider value={{ state, dispatch, user, profile, loading }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be bundled within a TaskProvider layer.');
  return context;
}